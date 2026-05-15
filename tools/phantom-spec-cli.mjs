#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [, , command, specPath, ...args] = process.argv;

const usage = () => {
  console.log(`Phantom Spec CLI

Usage:
  npm run phantom:spec -- validate <spec.json>
  npm run phantom:spec -- summary <spec.json>
  npm run phantom:spec -- readiness <spec.json> react|powerBi

Commands:
  validate  Validate a Phantom Spec JSON file for agent/build handoff.
  summary   Print a compact machine-readable summary.
  readiness Check React or Power BI handoff readiness.
`);
};

const readSpec = async (path) => {
  if (!path) {
    throw new Error('Missing spec path.');
  }
  const fullPath = resolve(path);
  const raw = await readFile(fullPath, 'utf8');
  return JSON.parse(raw);
};

const assert = (condition, message, errors) => {
  if (!condition) errors.push(message);
};

const validateSpec = (spec) => {
  const errors = [];
  assert(spec && typeof spec === 'object', 'Spec must be a JSON object.', errors);
  assert(typeof spec.specVersion === 'string', 'specVersion is required.', errors);
  assert(['react', 'powerBi'].includes(spec.mode), 'mode must be react or powerBi.', errors);
  assert(spec.project && typeof spec.project === 'object', 'project is required.', errors);
  assert(typeof spec.project?.scenario === 'string', 'project.scenario is required.', errors);
  assert(Array.isArray(spec.views), 'views must be an array.', errors);
  assert(spec.views?.length > 0, 'At least one view is required.', errors);

  for (const [viewIndex, view] of (spec.views || []).entries()) {
    assert(typeof view.id === 'string', `views[${viewIndex}].id is required.`, errors);
    assert(Array.isArray(view.components), `views[${viewIndex}].components must be an array.`, errors);
    for (const [componentIndex, component] of (view.components || []).entries()) {
      const prefix = `views[${viewIndex}].components[${componentIndex}]`;
      assert(typeof component.id === 'string', `${prefix}.id is required.`, errors);
      assert(typeof component.type === 'string', `${prefix}.type is required.`, errors);
      assert(component.layout && typeof component.layout === 'object', `${prefix}.layout is required.`, errors);
      assert(component.dataRequirements && typeof component.dataRequirements === 'object', `${prefix}.dataRequirements is required.`, errors);
      assert(component.exportTargets?.react?.status, `${prefix}.exportTargets.react.status is required.`, errors);
      assert(component.exportTargets?.powerBi?.status, `${prefix}.exportTargets.powerBi.status is required.`, errors);
    }
  }

  assert(spec.dataContract && typeof spec.dataContract === 'object', 'dataContract is required.', errors);
  assert(Array.isArray(spec.dataContract?.metrics), 'dataContract.metrics must be an array.', errors);
  assert(Array.isArray(spec.dataContract?.dimensions), 'dataContract.dimensions must be an array.', errors);
  assert(Array.isArray(spec.dataContract?.fields), 'dataContract.fields must be an array.', errors);

  return errors;
};

const summarizeSpec = (spec) => {
  const components = (spec.views || []).flatMap((view) => view.components || []);
  const byPowerBiStatus = components.reduce((acc, component) => {
    const status = component.exportTargets?.powerBi?.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return {
    specVersion: spec.specVersion,
    mode: spec.mode,
    scenario: spec.project?.scenario,
    views: spec.views?.length || 0,
    components: components.length,
    metrics: spec.dataContract?.metrics || [],
    dimensions: spec.dataContract?.dimensions || [],
    powerBi: byPowerBiStatus,
  };
};

const getTarget = (spec) => {
  const targetIndex = args.indexOf('--target');
  const positionalTarget = args.find((arg) => ['react', 'powerBi'].includes(arg));
  const target = targetIndex >= 0 ? args[targetIndex + 1] : positionalTarget || spec.mode;
  if (!['react', 'powerBi'].includes(target)) {
    throw new Error('Readiness target must be react or powerBi.');
  }
  return target;
};

const checkReadiness = (spec, target = spec.mode) => {
  const errors = [];
  const warnings = [];
  const components = (spec.views || []).flatMap((view) => view.components || []);
  const componentIds = new Set(components.map((component) => component.id));

  if (components.length === 0) {
    errors.push({ severity: 'error', code: 'NO_COMPONENTS', message: 'Spec has no components to hand off.' });
  }

  for (const component of components) {
    const fields = component.dataRequirements?.fields || [];
    if (fields.length === 0 && !['textBox', 'banner'].includes(component.type)) {
      warnings.push({
        severity: 'warning',
        code: 'NO_DATA_REQUIREMENTS',
        message: `${component.title} has no detected data requirements.`,
        componentId: component.id,
      });
    }

    if (target === 'powerBi') {
      const status = component.exportTargets?.powerBi?.status;
      if (status === 'unsupported') {
        errors.push({
          severity: 'error',
          code: 'POWER_BI_UNSUPPORTED_VISUAL',
          message: `${component.title} is design-only and cannot be treated as Power BI-ready.`,
          componentId: component.id,
        });
      }
      if (status === 'approximate') {
        warnings.push({
          severity: 'warning',
          code: 'POWER_BI_APPROXIMATE_VISUAL',
          message: `${component.title} has approximate Power BI support and needs implementation notes.`,
          componentId: component.id,
        });
      }
    }
  }

  for (const action of spec.interactions?.drillActions || []) {
    if (!componentIds.has(action.sourceComponentId)) {
      errors.push({
        severity: 'error',
        code: 'BROKEN_DRILL_SOURCE',
        message: `${action.label} references a missing source component.`,
        drillActionId: action.id,
      });
    }
    if ((action.context || []).length === 0) {
      warnings.push({
        severity: 'warning',
        code: 'DRILL_ACTION_WITHOUT_CONTEXT',
        message: `${action.label} does not pass any context to its target.`,
        drillActionId: action.id,
      });
    }
  }

  if (spec.project?.designEntryPoint === 'figma-led' && (spec.project?.designSources || []).length === 0) {
    warnings.push({
      severity: 'warning',
      code: 'FIGMA_LED_WITHOUT_SOURCE',
      message: 'Project is marked Figma-led but has no linked design sources.',
    });
  }

  return {
    target,
    ready: errors.length === 0,
    errors,
    warnings,
  };
};

try {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    usage();
    process.exit(0);
  }

  if (!['validate', 'summary', 'readiness'].includes(command)) {
    throw new Error(`Unknown command: ${command}`);
  }

  const spec = await readSpec(specPath);
  const errors = validateSpec(spec);

  if (command === 'validate') {
    if (errors.length > 0) {
      console.error(JSON.stringify({ valid: false, errors }, null, 2));
      process.exit(1);
    }
    console.log(JSON.stringify({ valid: true, errors: [] }, null, 2));
  }

  if (command === 'summary') {
    if (errors.length > 0) {
      console.error(JSON.stringify({ valid: false, errors }, null, 2));
      process.exit(1);
    }
    console.log(JSON.stringify(summarizeSpec(spec), null, 2));
  }

  if (command === 'readiness') {
    if (errors.length > 0) {
      console.error(JSON.stringify({ valid: false, errors }, null, 2));
      process.exit(1);
    }
    const report = checkReadiness(spec, getTarget(spec));
    const output = JSON.stringify(report, null, 2);
    if (report.ready) {
      console.log(output);
    } else {
      console.error(output);
      process.exit(1);
    }
  }
} catch (error) {
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exit(1);
}
