#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [, , command, specPath] = process.argv;

const usage = () => {
  console.log(`Phantom Spec CLI

Usage:
  npm run phantom:spec -- validate <spec.json>
  npm run phantom:spec -- summary <spec.json>

Commands:
  validate  Validate a Phantom Spec JSON file for agent/build handoff.
  summary   Print a compact machine-readable summary.
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

try {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    usage();
    process.exit(0);
  }

  if (!['validate', 'summary'].includes(command)) {
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
} catch (error) {
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exit(1);
}
