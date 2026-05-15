#!/usr/bin/env node
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [, , command, specPath, ...args] = process.argv;

const usage = () => {
  console.log(`Phantom Spec CLI

Usage:
  npm run phantom:spec -- validate <spec.json>
  npm run phantom:spec -- summary <spec.json>
  npm run phantom:spec -- diff <before.json> <after.json>
  npm run phantom:spec -- readiness <spec.json> react|powerBi
  npm run phantom:spec -- export-react <spec.json> <dir>
  npm run phantom:spec -- export-data-contract <spec.json> <dir>
  npm run phantom:spec -- export-powerbi-guide <spec.json> <dir>
  npm run phantom:spec -- export-handoff-pack <spec.json> <dir>
  npm run phantom:spec -- inspect <spec.json> components|drill-actions|data-requirements|data-path|design-sources|design-mapping|design-workflow|design-handoff|approval|implementation-gate|workshop-intent|react-backlog|powerbi-build-matrix|handoff-summary
  npm run phantom:spec -- import-design-source <spec.json> figmaFrame "Client frame" <url> <frame-id> "notes" <out-spec.json>
  npm run phantom:spec -- import-data-source <spec.json> dbt "Orders mart" mart_orders Region,revenue visual-1 <out-spec.json>
  node tools/phantom-spec-cli.mjs import-design-source <spec.json> --type figmaFrame --name "Client frame" --url <url> --frame-id <frame-id> --views main --components kpi-1,chart-1 --out <out-spec.json>
  node tools/phantom-spec-cli.mjs import-data-source <spec.json> --type dbt --name "Orders mart" --model mart_orders --fields Region,revenue --components visual-1 --out <out-spec.json>

Commands:
  validate             Validate a Phantom Spec JSON file for agent/build handoff.
  summary              Print a compact machine-readable summary.
  diff                 Compare two Phantom Spec JSON files.
  readiness            Check React or Power BI handoff readiness.
  export-react         Generate a minimal React starter scaffold from a ready spec.
  export-data-contract Generate JSON and Markdown data contract handoff files.
  export-powerbi-guide Generate a Power BI implementation guide.
  export-handoff-pack  Generate a bundled React and Power BI handoff pack.
  inspect              Print a focused machine-readable view of a spec section.
  import-design-source Add or update a Figma/screenshot/reference design source in a spec.
  import-data-source   Add or update an API/warehouse/dbt/semantic/file data source in a spec.
`);
};

const readSpec = async (path) => {
  if (!path) {
    throw new Error('Missing spec path.');
  }
  const fullPath = resolve(path);
  const raw = await readFile(fullPath, 'utf8');
  return JSON.parse(raw.replace(/^\uFEFF/, ''));
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

const byId = (items) => new Map(items.map((item) => [item.id, item]));

const arrayDiff = (before = [], after = []) => ({
  added: after.filter((item) => !before.includes(item)),
  removed: before.filter((item) => !after.includes(item)),
});

const changedKeys = (before, after, keys) =>
  keys.filter((key) => JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key]));

const diffSpecs = (before, after) => {
  const beforeComponents = (before.views || []).flatMap((view) => view.components || []);
  const afterComponents = (after.views || []).flatMap((view) => view.components || []);
  const beforeById = byId(beforeComponents);
  const afterById = byId(afterComponents);
  const beforeDrills = before.interactions?.drillActions || [];
  const afterDrills = after.interactions?.drillActions || [];
  const beforeDrillById = byId(beforeDrills);
  const afterDrillById = byId(afterDrills);
  const addedComponents = afterComponents.filter((component) => !beforeById.has(component.id));
  const removedComponents = beforeComponents.filter((component) => !afterById.has(component.id));
  const changedComponents = afterComponents
    .filter((component) => beforeById.has(component.id))
    .map((component) => {
      const previous = beforeById.get(component.id);
      const changes = changedKeys(previous, component, ['title', 'type', 'layout', 'props', 'dataRequirements', 'exportTargets']);
      return changes.length > 0 ? {
        id: component.id,
        title: component.title,
        changes,
        beforePowerBiStatus: previous.exportTargets?.powerBi?.status || 'unknown',
        afterPowerBiStatus: component.exportTargets?.powerBi?.status || 'unknown',
      } : null;
    })
    .filter(Boolean);
  const changedDrillActions = afterDrills
    .filter((action) => beforeDrillById.has(action.id))
    .map((action) => {
      const previous = beforeDrillById.get(action.id);
      const changes = changedKeys(previous, action, ['label', 'sourceComponentId', 'trigger', 'targetType', 'targetId', 'context', 'preserveFilters', 'notes']);
      return changes.length > 0 ? { id: action.id, label: action.label, changes } : null;
    })
    .filter(Boolean);

  return {
    before: summarizeSpec(before),
    after: summarizeSpec(after),
    projectChanges: changedKeys(before.project, after.project, ['scenario', 'themePalette', 'designEntryPoint', 'designSources']),
    modeChanged: before.mode !== after.mode,
    dataRequirements: {
      metrics: arrayDiff(before.dataContract?.metrics || [], after.dataContract?.metrics || []),
      dimensions: arrayDiff(before.dataContract?.dimensions || [], after.dataContract?.dimensions || []),
      fields: arrayDiff(before.dataContract?.fields || [], after.dataContract?.fields || []),
    },
    components: {
      added: addedComponents.map((component) => ({ id: component.id, title: component.title, type: component.type })),
      removed: removedComponents.map((component) => ({ id: component.id, title: component.title, type: component.type })),
      changed: changedComponents,
    },
    drillActions: {
      added: afterDrills.filter((action) => !beforeDrillById.has(action.id)),
      removed: beforeDrills.filter((action) => !afterDrillById.has(action.id)),
      changed: changedDrillActions,
    },
  };
};

const inspectSpec = (spec, subject) => {
  const components = (spec.views || []).flatMap((view) =>
    (view.components || []).map((component) => ({
      viewId: view.id,
      viewName: view.name,
      id: component.id,
      title: component.title,
      type: component.type,
      fields: component.dataRequirements?.fields || [],
      metrics: component.dataRequirements?.metrics || [],
      dimensions: component.dataRequirements?.dimensions || [],
      reactStatus: component.exportTargets?.react?.status || 'unknown',
      powerBiStatus: component.exportTargets?.powerBi?.status || 'unknown',
      powerBiNotes: component.exportTargets?.powerBi?.notes || [],
    })),
  );

  if (subject === 'components') {
    return {
      subject,
      count: components.length,
      components,
    };
  }

  if (subject === 'drill-actions') {
    return {
      subject,
      count: spec.interactions?.drillActions?.length || 0,
      drillActions: spec.interactions?.drillActions || [],
    };
  }

  if (subject === 'data-requirements') {
    const contract = createDataContract(spec);
    return {
      subject,
      metrics: contract.metrics,
      dimensions: contract.dimensions,
      fields: contract.fields,
      components: contract.components.map((component) => ({
        componentId: component.componentId,
        title: component.title,
        fields: component.fields,
        metrics: component.metrics,
        dimensions: component.dimensions,
      })),
    };
  }

  if (subject === 'data-path') {
    return createDataPath(spec);
  }

  if (subject === 'design-sources') {
    return {
      subject,
      designEntryPoint: spec.project?.designEntryPoint || 'phantom-led',
      count: spec.project?.designSources?.length || 0,
      designSources: spec.project?.designSources || [],
    };
  }

  if (subject === 'design-mapping') {
    return {
      subject,
      designEntryPoint: spec.project?.designEntryPoint || 'phantom-led',
      ...createDesignMappingSummary(spec.project?.designSources || []),
    };
  }

  if (subject === 'design-workflow') {
    return createDesignWorkflow(spec);
  }

  if (subject === 'design-handoff') {
    return createDesignHandoff(spec);
  }

  if (subject === 'approval') {
    return createApprovalStatus(spec);
  }

  if (subject === 'implementation-gate') {
    return createImplementationGate(spec);
  }

  if (subject === 'workshop-intent') {
    const workshopIntent = createWorkshopIntent(spec.project?.specification);
    return {
      subject,
      ...workshopIntent,
      completeness: createWorkshopIntentCompleteness(workshopIntent),
    };
  }

  if (subject === 'react-backlog') {
    const tasks = createReactBacklog(spec);
    return {
      subject,
      count: tasks.length,
      tasks,
    };
  }

  if (subject === 'powerbi-build-matrix') {
    const guide = createPowerBiGuide(spec);
    return {
      subject,
      readiness: guide.readiness,
      summary: guide.summary,
      components: guide.components,
      drillActions: guide.drillActions,
      buildChecklist: guide.buildChecklist,
    };
  }

  if (subject === 'handoff-summary') {
    const contract = createDataContract(spec);
    const reactBacklog = createReactBacklog(spec);
    const powerBiGuide = createPowerBiGuide(spec);
    const reactReadiness = checkReadiness(spec, 'react');
    const handoffRecommendation = getHandoffRecommendation(reactReadiness.ready, powerBiGuide.readiness.ready);
    const nextActions = getHandoffNextActions(reactReadiness, powerBiGuide.readiness);
    const workshopIntent = createWorkshopIntent(spec.project?.specification);
    return {
      subject,
      project: {
        scenario: spec.project?.scenario,
        mode: spec.mode,
        signOffStatus: spec.project?.specification?.signOffStatus || 'draft',
        designEntryPoint: spec.project?.designEntryPoint || 'phantom-led',
        designSources: spec.project?.designSources || [],
      },
      approval: createApprovalStatus(spec),
      implementationGate: createImplementationGate(spec),
      dataPath: createDataPath(spec),
      designWorkflow: createDesignWorkflow(spec),
      designHandoff: createDesignHandoff(spec),
      designMapping: createDesignMappingSummary(spec.project?.designSources || []),
      workshopIntent,
      workshopCompleteness: createWorkshopIntentCompleteness(workshopIntent),
      readiness: {
        react: reactReadiness,
        powerBi: powerBiGuide.readiness,
      },
      handoffRecommendation,
      counts: {
        views: spec.views?.length || 0,
        components: (spec.views || []).flatMap((view) => view.components || []).length,
        fields: contract.fields.length,
        metrics: contract.metrics.length,
        dimensions: contract.dimensions.length,
        drillActions: spec.interactions?.drillActions?.length || 0,
        reactImplementationTasks: reactBacklog.length,
        powerBiReadyVisuals: powerBiGuide.summary.readyVisuals,
        powerBiApproximateVisuals: powerBiGuide.summary.approximateVisuals,
        powerBiUnsupportedVisuals: powerBiGuide.summary.unsupportedVisuals,
      },
      nextActions,
    };
  }

  throw new Error('Inspect subject must be components, drill-actions, data-requirements, data-path, design-sources, design-mapping, design-workflow, design-handoff, approval, implementation-gate, workshop-intent, react-backlog, powerbi-build-matrix, or handoff-summary.');
};

const optionValue = (name) => {
  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  const npmConfigName = `npm_config_${name.replace(/^--/, '').replace(/-/g, '_')}`;
  const value = process.env[npmConfigName];
  return value && value !== 'true' ? value : undefined;
};

const positionalOptions = () =>
  args.filter((arg, index) => !arg.startsWith('--') && !args[index - 1]?.startsWith('--'));

const slug = (value) =>
  String(value || 'design-source')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'design-source';

const csvOption = (...names) => {
  const value = names.map((name) => optionValue(name)).find(Boolean);
  return value
    ? value.split(',').map((item) => item.trim()).filter(Boolean)
    : [];
};

const uniqueSorted = (values) => [...new Set(values.filter(Boolean))].sort();

const createApprovalStatus = (spec) => {
  const signOffStatus = spec.project?.specification?.signOffStatus || 'draft';
  const approvedForImplementation = signOffStatus === 'approved';

  return {
    subject: 'approval',
    signOffStatus,
    approvedForImplementation,
    guidance: approvedForImplementation
      ? 'Spec is approved for implementation handoff.'
      : `Spec sign-off is ${signOffStatus}; confirm client approval before treating this as an implementation contract.`,
    requiredNextSteps: approvedForImplementation
      ? []
      : ['Move sign-off status to approved after client or delivery lead review.'],
  };
};

const createDesignWorkflow = (spec) => {
  const entryPoint = spec.project?.designEntryPoint || 'phantom-led';
  const mapping = createDesignMappingSummary(spec.project?.designSources || []);
  const isFigmaLed = entryPoint === 'figma-led';
  const status = !isFigmaLed
    ? 'ready'
    : mapping.totalSources === 0
      ? 'needs-design-source'
      : mapping.unmappedSources > 0
        ? 'needs-mapping'
        : 'ready';
  const agentCommands = [
    'npm run phantom:spec -- inspect <spec.json> design-workflow',
    'npm run phantom:spec -- inspect <spec.json> implementation-gate',
    'npm run phantom:spec -- inspect <spec.json> handoff-summary',
    'npm run phantom:spec -- export-handoff-pack <spec.json> <out-dir>',
  ];

  if (isFigmaLed) {
    agentCommands.splice(
      1,
      0,
      'npm run phantom:spec -- import-design-source <spec.json> --type figmaFrame --name "<name>" --url <figma-url> --views main --components <ids> --out <out-spec.json>',
    );
  }

  return {
    subject: 'design-workflow',
    entryPoint,
    designPlane: isFigmaLed ? 'figma' : 'phantom',
    phantomRole: isFigmaLed
      ? 'Import or link Figma frames/components, then attach analytics workflow, data contracts, drill-throughs, readiness checks, and React or Power BI handoff.'
      : 'Use Phantom defaults for layout, analytical components, data contracts, drill-throughs, readiness checks, and React or Power BI handoff without requiring Figma.',
    status,
    mapping,
    handoffModes: ['react-product', 'power-bi'],
    requiredNextSteps: [
      ...(isFigmaLed && mapping.totalSources === 0
        ? ['Import or link at least one Figma frame, Figma component, screenshot, or external design reference.']
        : []),
      ...(isFigmaLed && mapping.unmappedSources > 0
        ? ['Map every design source to at least one Phantom view or component before engineering handoff.']
        : []),
      'Capture workshop intent: business questions, audience, decisions/actions, and acceptance criteria.',
      'Choose React Product Mode for custom analytical apps, Power BI Mode for constrained Power BI-safe report specs, or keep both tracks for comparison.',
      'Export the handoff pack and use the generated readiness report, data contract, React backlog, and Power BI build matrix as the implementation source of truth.',
    ],
    agentCommands,
  };
};

const createDesignHandoff = (spec) => {
  const workflow = createDesignWorkflow(spec);
  const isFigmaLed = workflow.entryPoint === 'figma-led';
  const views = spec.views || [];
  const designSources = spec.project?.designSources || [];
  const components = views.flatMap((view) =>
    (view.components || []).map((component) => {
      const linkedSources = designSources.filter((source) =>
        (source.linkedViewIds || []).includes(view.id) || (source.linkedComponentIds || []).includes(component.id),
      );
      const missingDesignSource = isFigmaLed && linkedSources.length === 0;
      const status = missingDesignSource
        ? 'missing-design-source'
        : linkedSources.length > 0
          ? 'mapped-to-design-source'
          : 'phantom-default';

      return {
        componentId: component.id,
        title: component.title,
        type: component.type,
        viewId: view.id,
        designSourceIds: linkedSources.map((source) => source.id),
        designSourceNames: linkedSources.map((source) => source.name),
        usesPhantomDefaults: linkedSources.length === 0,
        status,
        implementationNotes: [
          ...(linkedSources.length > 0
            ? [`Apply visual direction from: ${linkedSources.map((source) => source.name).join(', ')}.`]
            : ['Use Phantom defaults for layout, spacing, interaction states, and component styling.']),
          ...(missingDesignSource
            ? ['Map this component to a Figma frame/component, screenshot, or explicit Phantom default before engineering handoff.']
            : []),
          'Keep this component ID stable for data bindings, tests, drill actions, and agent automation.',
        ],
      };
    }),
  );
  const missingMappings = components
    .filter((component) => component.status === 'missing-design-source')
    .map((component) => component.componentId);
  const hasMappedComponents = components.some((component) => component.designSourceIds.length > 0);
  const sourceMode = !isFigmaLed
    ? 'phantom-defaults'
    : designSources.length === 0
      ? 'needs-source'
      : missingMappings.length > 0 && hasMappedComponents
        ? 'mixed'
        : 'figma-imported';

  return {
    subject: 'design-handoff',
    entryPoint: workflow.entryPoint,
    designPlane: workflow.designPlane,
    workflowStatus: workflow.status,
    sourceMode,
    canSkipFigma: !isFigmaLed,
    designSources,
    components,
    missingMappings,
    requiredNextSteps: uniqueSorted([
      ...workflow.requiredNextSteps,
      ...(missingMappings.length > 0
        ? [`Map design sources or confirm Phantom defaults for components: ${missingMappings.join(', ')}.`]
        : []),
    ]),
    agentCommands: [
      'npm run phantom:spec -- inspect <spec.json> design-handoff',
      ...workflow.agentCommands,
    ],
  };
};

const mergeDesignSource = (spec) => {
  const positional = positionalOptions();
  const type = optionValue('--type') || positional[0] || 'figmaFrame';
  const allowedTypes = new Set(['phantomDefault', 'figmaFrame', 'figmaComponent', 'screenshot', 'externalReference']);
  if (!allowedTypes.has(type)) {
    throw new Error('Design source type must be phantomDefault, figmaFrame, figmaComponent, screenshot, or externalReference.');
  }

  const name = optionValue('--name') || positional[1];
  const url = optionValue('--url') || positional[2];
  const frameId = optionValue('--frame-id') || (positional.length >= 6 ? positional[3] : undefined);
  const componentId = optionValue('--component-id');
  const linkedViewIds = csvOption('--views', '--view-ids', '--linked-view-ids');
  const linkedComponentIds = csvOption('--components', '--component-ids', '--linked-component-ids');
  const notes = optionValue('--notes') || (positional.length >= 6 ? positional[4] : positional.length === 5 ? positional[3] : undefined);
  const id = optionValue('--id') || `${type}-${slug(frameId || componentId || name || url)}`;
  const outPath = optionValue('--out') || (positional.length >= 4 ? positional[positional.length - 1] : undefined);
  if (!outPath) {
    throw new Error('Missing --out path for import-design-source.');
  }
  if (!name && !url && !frameId && !componentId) {
    throw new Error('Provide at least one of --name, --url, --frame-id, or --component-id.');
  }

  const designSource = {
    id,
    type,
    name: name || frameId || componentId || url || 'Design source',
    ...(url ? { url } : {}),
    ...(frameId ? { frameId } : {}),
    ...(componentId ? { componentId } : {}),
    ...(linkedViewIds.length ? { linkedViewIds } : {}),
    ...(linkedComponentIds.length ? { linkedComponentIds } : {}),
    ...(notes ? { notes } : {}),
  };
  const existingSources = spec.project?.designSources || [];
  const nextSources = [
    ...existingSources.filter((source) => source.id !== id),
    designSource,
  ];
  const designEntryPoint = type === 'phantomDefault' ? (spec.project?.designEntryPoint || 'phantom-led') : 'figma-led';
  const specification = {
    ...(spec.project?.specification || {}),
    designEntryPoint,
    designSources: nextSources,
  };

  return {
    nextSpec: {
      ...spec,
      project: {
        ...spec.project,
        specification,
        designEntryPoint,
        designSources: nextSources,
      },
    },
    outPath: resolve(outPath),
    designSource,
  };
};

const mergeDataSource = (spec) => {
  const positional = positionalOptions();
  const type = optionValue('--type') || positional[0] || 'dbt';
  const allowedTypes = new Set(['api', 'graphql', 'warehouse', 'dbt', 'semantic', 'file', 'manual', 'unknown']);
  if (!allowedTypes.has(type)) {
    throw new Error('Data source type must be api, graphql, warehouse, dbt, semantic, file, manual, or unknown.');
  }

  const name = optionValue('--name') || positional[1];
  const model = optionValue('--model') || positional[2];
  const url = optionValue('--url');
  const query = optionValue('--query');
  const description = optionValue('--description') || optionValue('--notes');
  const positionalFields = positional[3] ? positional[3].split(',').map((item) => item.trim()).filter(Boolean) : [];
  const positionalComponents = positional[4] && positional.length >= 6
    ? positional[4].split(',').map((item) => item.trim()).filter(Boolean)
    : [];
  const linkedFieldsOption = csvOption('--fields', '--field-ids', '--linked-fields');
  const linkedComponentsOption = csvOption('--components', '--component-ids', '--linked-component-ids');
  const linkedFields = linkedFieldsOption.length ? linkedFieldsOption : positionalFields;
  const linkedComponentIds = linkedComponentsOption.length ? linkedComponentsOption : positionalComponents;
  const id = optionValue('--id') || `${type}-${slug(model || name || url || query)}`;
  const outPath = optionValue('--out') || (positional.length >= 4 ? positional[positional.length - 1] : undefined);
  if (!outPath) {
    throw new Error('Missing --out path for import-data-source.');
  }
  if (!name && !model && !url && !query) {
    throw new Error('Provide at least one of --name, --model, --url, or --query.');
  }

  const dataSource = {
    id,
    type,
    name: name || model || url || query || 'Data source',
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
    ...(model ? { model } : {}),
    ...(query ? { query } : {}),
    ...(linkedComponentIds.length ? { linkedComponentIds } : {}),
    ...(linkedFields.length ? { linkedFields } : {}),
  };
  const existingSources = spec.project?.specification?.dataSources || [];
  const nextSources = [
    ...existingSources.filter((source) => source.id !== id),
    dataSource,
  ];
  const specification = {
    ...(spec.project?.specification || {}),
    dataSources: nextSources,
  };

  return {
    nextSpec: {
      ...spec,
      project: {
        ...spec.project,
        specification,
      },
    },
    outPath: resolve(outPath),
    dataSource,
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

const getHandoffRecommendation = (reactReady, powerBiReady) => {
  if (reactReady && powerBiReady) {
    return {
      target: 'dual-track',
      guidance: 'Ready for both React Product Mode and Power BI Mode handoff.',
    };
  }
  if (reactReady) {
    return {
      target: 'react-product',
      guidance: 'Use React Product Mode for this handoff; resolve Power BI blockers before treating it as Power BI-ready.',
    };
  }
  if (powerBiReady) {
    return {
      target: 'power-bi',
      guidance: 'Use Power BI Mode for this handoff; resolve React blockers before generating React implementation work.',
    };
  }
  return {
    target: 'fix-before-handoff',
    guidance: 'Resolve readiness blockers before using this spec for implementation handoff.',
  };
};

const getHandoffNextActions = (reactReadiness, powerBiReadiness) => [
  ...reactReadiness.errors.map((issue) => `React blocker: ${issue.message}`),
  ...reactReadiness.warnings.map((issue) => `React warning: ${issue.message}`),
  ...powerBiReadiness.errors.map((issue) => `Power BI blocker: ${issue.message}`),
  ...powerBiReadiness.warnings.map((issue) => `Power BI warning: ${issue.message}`),
];

const createImplementationGate = (spec) => {
  const approval = createApprovalStatus(spec);
  const designWorkflow = createDesignWorkflow(spec);
  const dataPath = createDataPath(spec);
  const workshopIntent = createWorkshopIntent(spec.project?.specification);
  const workshopCompleteness = createWorkshopIntentCompleteness(workshopIntent);
  const reactReadiness = checkReadiness(spec, 'react');
  const powerBiReadiness = checkReadiness(spec, 'powerBi');
  const recommendation = getHandoffRecommendation(reactReadiness.ready, powerBiReadiness.ready);
  const targetReady = recommendation.target === 'dual-track'
    ? reactReadiness.ready && powerBiReadiness.ready
    : recommendation.target === 'react-product'
      ? reactReadiness.ready
      : recommendation.target === 'power-bi'
        ? powerBiReadiness.ready
        : false;
  const designGateSteps = [
    ...(designWorkflow.status === 'needs-design-source'
      ? ['Import or link at least one Figma frame, Figma component, screenshot, or external design reference.']
      : []),
    ...(designWorkflow.status === 'needs-mapping'
      ? ['Map every design source to at least one Phantom view or component before engineering handoff.']
      : []),
  ];
  const blockingReasons = uniqueSorted([
    ...(!approval.approvedForImplementation ? [approval.guidance] : []),
    ...designGateSteps,
    ...dataPath.requiredNextSteps,
    ...(!workshopCompleteness.complete
      ? [`Workshop intent is missing: ${workshopCompleteness.missing.join(', ')}.`]
      : []),
    ...(recommendation.target === 'fix-before-handoff' ? [recommendation.guidance] : []),
    ...reactReadiness.errors.map((issue) => `React blocker: ${issue.message}`),
    ...powerBiReadiness.errors.map((issue) => `Power BI blocker: ${issue.message}`),
  ]);
  const warnings = uniqueSorted([
    ...reactReadiness.warnings.map((issue) => `React warning: ${issue.message}`),
    ...powerBiReadiness.warnings.map((issue) => `Power BI warning: ${issue.message}`),
  ]);

  return {
    subject: 'implementation-gate',
    target: recommendation.target,
    readyForImplementation: approval.approvedForImplementation
      && designWorkflow.status === 'ready'
      && dataPath.requiredNextSteps.length === 0
      && workshopCompleteness.complete
      && targetReady,
    approvedForImplementation: approval.approvedForImplementation,
    designReady: designWorkflow.status === 'ready',
    dataPathReady: dataPath.requiredNextSteps.length === 0,
    workshopIntentComplete: workshopCompleteness.complete,
    reactReady: reactReadiness.ready,
    powerBiReady: powerBiReadiness.ready,
    blockingReasons,
    warnings,
    requiredNextSteps: uniqueSorted([
      ...approval.requiredNextSteps,
      ...designGateSteps,
      ...dataPath.requiredNextSteps,
      ...(!workshopCompleteness.complete
        ? [`Capture missing workshop intent: ${workshopCompleteness.missing.join(', ')}.`]
        : []),
      ...reactReadiness.errors.map((issue) => `React blocker: ${issue.message}`),
      ...powerBiReadiness.errors.map((issue) => `Power BI blocker: ${issue.message}`),
    ]),
  };
};

const checkReadiness = (spec, target = spec.mode) => {
  const errors = [];
  const warnings = [];
  const components = (spec.views || []).flatMap((view) => view.components || []);
  const componentIds = new Set(components.map((component) => component.id));
  const viewIds = new Set((spec.views || []).map((view) => view.id));

  if (components.length === 0) {
    errors.push({ severity: 'error', code: 'NO_COMPONENTS', message: 'Spec has no components to hand off.' });
  }

  if (spec.project?.specification?.signOffStatus !== 'approved') {
    warnings.push({
      severity: 'warning',
      code: 'SPEC_NOT_APPROVED',
      message: `Spec sign-off is ${spec.project?.specification?.signOffStatus || 'draft'}; confirm client approval before treating this as an implementation contract.`,
    });
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

  for (const source of spec.project?.designSources || []) {
    const missingViewIds = (source.linkedViewIds || []).filter((viewId) => !viewIds.has(viewId));
    const missingComponentIds = (source.linkedComponentIds || []).filter((componentId) => !componentIds.has(componentId));
    const isUnmapped = (source.linkedViewIds || []).length === 0 && (source.linkedComponentIds || []).length === 0;

    if (spec.project?.designEntryPoint === 'figma-led' && isUnmapped) {
      warnings.push({
        severity: 'warning',
        code: 'UNMAPPED_DESIGN_SOURCE',
        message: `${source.name} is not mapped to any Phantom view or component.`,
      });
    }

    if (missingViewIds.length > 0) {
      warnings.push({
        severity: 'warning',
        code: 'BROKEN_DESIGN_SOURCE_VIEW_LINK',
        message: `${source.name} maps to missing Phantom view IDs: ${missingViewIds.join(', ')}.`,
      });
    }

    if (missingComponentIds.length > 0) {
      warnings.push({
        severity: 'warning',
        code: 'BROKEN_DESIGN_SOURCE_COMPONENT_LINK',
        message: `${source.name} maps to missing Phantom component IDs: ${missingComponentIds.join(', ')}.`,
      });
    }
  }

  if (!hasText(spec.project?.specification?.businessQuestions)) {
    warnings.push({
      severity: 'warning',
      code: 'MISSING_BUSINESS_QUESTIONS',
      message: 'Workshop intent has no business questions; implementation teams may not know what decisions the experience must support.',
    });
  }

  if (!hasText(spec.project?.specification?.audience)) {
    warnings.push({
      severity: 'warning',
      code: 'MISSING_AUDIENCE',
      message: 'Workshop intent has no audience; UX, density, and distribution decisions are underspecified.',
    });
  }

  if (!hasText(spec.project?.specification?.decisions)) {
    warnings.push({
      severity: 'warning',
      code: 'MISSING_DECISIONS',
      message: 'Workshop intent has no decisions or actions; implementation teams may not know what the experience should help users do.',
    });
  }

  if (!hasText(spec.project?.specification?.acceptanceCriteria)) {
    warnings.push({
      severity: 'warning',
      code: 'MISSING_ACCEPTANCE_CRITERIA',
      message: 'Workshop intent has no acceptance criteria for client sign-off or implementation QA.',
    });
  }

  return {
    target,
    ready: errors.length === 0,
    errors,
    warnings,
  };
};

const toIdentifier = (value) => {
  const cleaned = String(value || 'View')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return cleaned || 'View';
};

const getOutDir = (commandName) => {
  const outIndex = args.indexOf('--out');
  const outDir = outIndex >= 0 ? args[outIndex + 1] : args[0];
  if (!outDir) {
    throw new Error(`Missing output directory for ${commandName}.`);
  }
  return resolve(outDir);
};

const writeReactStarter = async (spec, outDir) => {
  const components = (spec.views || []).flatMap((view) => view.components || []);
  const dataContract = createDataContract(spec);
  const backlog = createReactBacklog(spec);
  const designMapping = createDesignMappingSummary(spec.project?.designSources || []);
  const designWorkflow = createDesignWorkflow(spec);
  const designHandoff = createDesignHandoff(spec);
  const implementationGate = createImplementationGate(spec);
  const routeDefinitions = (spec.views || []).map((view, index) => ({
    viewId: view.id,
    name: view.name,
    path: index === 0 ? '/' : `/${slug(view.name || view.id)}`,
    componentIds: (view.components || []).map((component) => component.id),
    drillTargets: (spec.interactions?.drillActions || [])
      .filter((action) => action.targetType === 'view' && action.targetId === view.id)
      .map((action) => action.id),
  }));
  const componentContracts = components.map((component) => ({
    id: component.id,
    title: component.title,
    type: component.type,
    viewId: (spec.views || []).find((view) => (view.components || []).some((item) => item.id === component.id))?.id,
    layout: component.layout,
    props: component.props || {},
    dataRequirements: component.dataRequirements,
    exportTargets: component.exportTargets,
    designSources: (spec.project?.designSources || [])
      .filter((source) => (source.linkedComponentIds || []).includes(component.id))
      .map((source) => source.id),
  }));
  await rm(outDir, { recursive: true, force: true });
  await mkdir(`${outDir}/src`, { recursive: true });

  const packageJson = {
    name: `${String(spec.project?.scenario || 'phantom').toLowerCase()}-phantom-starter`,
    private: true,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: 'tsc && vite build',
      preview: 'vite preview',
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
    },
    devDependencies: {
      '@vitejs/plugin-react-swc': '^3.5.0',
      typescript: '^5.2.2',
      vite: '^5.0.8',
      '@types/react': '^18.2.43',
      '@types/react-dom': '^18.2.17',
    },
  };

  const appTsx = `import React from 'react';
import { createRoot } from 'react-dom/client';
import spec from './phantom-spec.json';
import dataContract from './phantom-data-contract.json';
import designWorkflow from './design-workflow.json';
import designHandoff from './design-handoff.json';
import implementationGate from './implementation-gate.json';
import { getComponentDataRequest } from './data-adapter';
import { componentContractsById, type ComponentContract } from './component-contracts';
import { drillActions } from './drill-actions';
import { routeDefinitions } from './routes';
import './styles.css';

const ComponentCard = ({ component }: { component: ComponentContract }) => (
  <section className="component-card">
    <div className="component-header">
      <strong>{component.title}</strong>
      <span>{component.type}</span>
    </div>
    <pre>{JSON.stringify(getComponentDataRequest(component.id), null, 2)}</pre>
  </section>
);

const App = () => (
  <main>
    <header>
      <p>Phantom React Starter</p>
      <h1>{spec.project.scenario} Analytical App</h1>
      <div className="meta">
        <span>{spec.mode}</span>
        <span>{dataContract.project.signOffStatus || 'draft'}</span>
        <span>{spec.project.designEntryPoint}</span>
        <span>{designWorkflow.designPlane}</span>
        <span>{designWorkflow.status}</span>
        <span>{designHandoff.sourceMode}</span>
        <span>{implementationGate.readyForImplementation ? 'ready' : 'blocked'}</span>
        <span>{routeDefinitions.length} route(s)</span>
        <span>{dataContract.fields.length} field(s)</span>
        <span>{drillActions.length} drill action(s)</span>
      </div>
    </header>
    {routeDefinitions.map((route) => (
      <div key={route.viewId}>
        <h2>{route.name}</h2>
        <p className="route-meta">{route.path} - {route.componentIds.length} component(s) - {route.drillTargets.length} incoming drill action(s)</p>
        <div className="grid">
          {route.componentIds.map((componentId) => (
            <ComponentCard key={componentId} component={componentContractsById[componentId]} />
          ))}
        </div>
      </div>
    ))}
  </main>
);

createRoot(document.getElementById('root')!).render(<App />);
`;

  const styles = `:root {
  color: #1f2937;
  background: #f6f7f9;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  margin: 0;
}

main {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px;
}

header {
  margin-bottom: 28px;
}

h1 {
  margin: 4px 0 12px;
  font-size: 34px;
}

.meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.meta span {
  border: 1px solid #d6dae1;
  background: white;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
}

.route-meta {
  color: #64748b;
  font-size: 13px;
  margin: -8px 0 14px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.component-card {
  background: white;
  border: 1px solid #dde2ea;
  border-radius: 8px;
  padding: 14px;
  min-height: 150px;
}

.component-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

pre {
  overflow: auto;
  background: #f8fafc;
  border-radius: 6px;
  padding: 10px;
  font-size: 12px;
}
`;

  const readme = `# ${spec.project?.scenario || 'Phantom'} React Starter

Generated from Phantom Spec ${spec.specVersion}.

## What This Is

This is a minimal implementation starting point, not a finished analytics app.

It includes:

- the exported Phantom Spec
- the exported Phantom data contract
- a typed data adapter stub
- route/view definitions
- typed component prop contracts
- drill action definitions for routes/detail panels
- a machine-readable design workflow contract
- a component-level design handoff contract for Figma imports or Phantom defaults
- a standalone implementation gate contract
- a React/Vite shell
- one placeholder card per Phantom component
- data requirements visible in the UI

## Next Steps

1. Replace placeholder cards with production components.
2. Wire \`src/data-adapter.ts\` to the client API, warehouse/dbt model, or semantic API.
3. Implement routes from \`src/routes.ts\` and component props from \`src/component-contracts.ts\`.
4. Implement drill actions from \`spec.interactions.drillActions\`.
5. Review \`src/design-workflow.json\` before deciding whether to pull from Figma or continue with Phantom defaults.
6. Review \`src/design-handoff.json\` to see which components map to Figma/design sources and which use Phantom defaults.
7. Review \`src/implementation-gate.json\` before treating the starter as implementation-ready.
8. Confirm sign-off status is approved before treating the starter as an implementation contract.
9. Apply any Figma/design-source references from \`spec.project.designSources\`.

## Project Status

- Sign-off: ${dataContract.project.signOffStatus || 'draft'}

## Implementation Gate

- Ready for implementation: ${implementationGate.readyForImplementation ? 'Yes' : 'No'}
- Approved for implementation: ${implementationGate.approvedForImplementation ? 'Yes' : 'No'}
- Design ready: ${implementationGate.designReady ? 'Yes' : 'No'}
- Data path ready: ${implementationGate.dataPathReady ? 'Yes' : 'No'}
- Workshop intent complete: ${implementationGate.workshopIntentComplete ? 'Yes' : 'No'}
- React ready: ${implementationGate.reactReady ? 'Yes' : 'No'}
- Power BI ready: ${implementationGate.powerBiReady ? 'Yes' : 'No'}

### Implementation Gate Next Steps

${markdownList(implementationGate.requiredNextSteps)}

## Design Workflow

- Design plane: ${designWorkflow.designPlane}
- Phantom role: ${designWorkflow.phantomRole}
- Status: ${designWorkflow.status}
- Handoff modes: ${designWorkflow.handoffModes.join(', ')}

### Design Workflow Next Steps

${markdownList(designWorkflow.requiredNextSteps)}

## Workshop Intent

- Business questions: ${dataContract.workshopIntent.businessQuestions || 'Not specified'}
- Audience: ${dataContract.workshopIntent.audience || 'Not specified'}
- Decisions/actions: ${dataContract.workshopIntent.decisions || 'Not specified'}
- Acceptance criteria: ${dataContract.workshopIntent.acceptanceCriteria || 'Not specified'}
- Build notes: ${dataContract.workshopIntent.buildNotes || 'Not specified'}

## Design Sources

${designSourcesMarkdown(spec.project?.designSources || [])}

## Design Mapping

- Sources: ${designMapping.totalSources}
- Mapped sources: ${designMapping.mappedSources}
- Unmapped sources: ${designMapping.unmappedSources}
- Linked views: ${designMapping.linkedViewIds.join(', ') || 'None'}
- Linked components: ${designMapping.linkedComponentIds.join(', ') || 'None'}

## Component Design Handoff

- Source mode: ${designHandoff.sourceMode}
- Can skip Figma: ${designHandoff.canSkipFigma ? 'Yes' : 'No'}
- Missing component mappings: ${designHandoff.missingMappings.join(', ') || 'None'}

## Component Backlog

See \`REACT_IMPLEMENTATION_BACKLOG.md\` for the component-by-component implementation checklist.
`;

  const dataAdapterTs = `import dataContract from './phantom-data-contract.json';

export type DataFieldKind = 'metric' | 'dimension' | 'field';

export type DataField = {
  name: string;
  kind: DataFieldKind;
  requiredBy: string[];
};

export type ComponentDataRequest = {
  componentId: string;
  title: string;
  type: string;
  fields: string[];
  metrics: string[];
  dimensions: string[];
  filters: unknown;
  expectedGrain: unknown;
};

export const dataFields = dataContract.fields as DataField[];
export const componentDataRequests = dataContract.components as ComponentDataRequest[];

export const getComponentDataRequest = (componentId: string) =>
  componentDataRequests.find((request) => request.componentId === componentId);

export async function fetchComponentData(componentId: string): Promise<unknown[]> {
  const request = getComponentDataRequest(componentId);
  if (!request) {
    throw new Error(\`Unknown Phantom component: \${componentId}\`);
  }

  // Replace this stub with a client API, warehouse/dbt, or semantic endpoint call.
  // Keep component IDs stable so drill actions and tests can target the same visual.
  return [];
}
`;

  const drillActionsTs = `export type DrillActionContextMap = {
  source: string;
  target: string;
};

export type DrillAction = {
  id: string;
  sourceComponentId: string;
  trigger: 'click' | 'rowClick' | 'pointClick' | 'markClick';
  targetType: 'view' | 'detailPanel' | 'modal' | 'entityProfile' | 'externalUrl';
  targetId: string;
  label: string;
  context: DrillActionContextMap[];
  preserveFilters: boolean;
  notes?: string;
};

export const drillActions = ${JSON.stringify(spec.interactions?.drillActions || [], null, 2)} satisfies DrillAction[];
`;

  const routesTs = `export type PhantomRouteDefinition = {
  viewId: string;
  name: string;
  path: string;
  componentIds: string[];
  drillTargets: string[];
};

export const routeDefinitions = ${JSON.stringify(routeDefinitions, null, 2)} satisfies PhantomRouteDefinition[];

export const routeDefinitionsByViewId = Object.fromEntries(
  routeDefinitions.map((route) => [route.viewId, route]),
) as Record<string, PhantomRouteDefinition>;
`;

  const componentContractsTs = `export type PhantomLayout = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type PhantomComponentDataRequirements = {
  fields: string[];
  metrics: string[];
  dimensions: string[];
};

export type PhantomComponentExportStatus = 'ready' | 'approximate' | 'unsupported';

export type PhantomComponentExportTargets = {
  react: { status: PhantomComponentExportStatus; notes?: string[] };
  powerBi: { status: PhantomComponentExportStatus; notes?: string[] };
};

export type ComponentContract = {
  id: string;
  title: string;
  type: string;
  viewId: string;
  layout: PhantomLayout;
  props: Record<string, unknown>;
  dataRequirements: PhantomComponentDataRequirements;
  exportTargets: PhantomComponentExportTargets;
  designSources: string[];
};

export const componentContracts = ${JSON.stringify(componentContracts, null, 2)} satisfies ComponentContract[];

export const componentContractsById = Object.fromEntries(
  componentContracts.map((component) => [component.id, component]),
) as Record<string, ComponentContract>;
`;

  await writeFile(`${outDir}/package.json`, `${JSON.stringify(packageJson, null, 2)}\n`);
  await writeFile(`${outDir}/index.html`, '<div id="root"></div><script type="module" src="/src/App.tsx"></script>\n');
  await writeFile(`${outDir}/tsconfig.json`, `${JSON.stringify({
    compilerOptions: {
      target: 'ES2020',
      useDefineForClassFields: true,
      lib: ['DOM', 'DOM.Iterable', 'ES2020'],
      allowJs: false,
      skipLibCheck: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      module: 'ESNext',
      moduleResolution: 'Node',
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
    },
    include: ['src'],
    references: [],
  }, null, 2)}\n`);
  await writeFile(`${outDir}/vite.config.ts`, `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
});
`);
  await writeFile(`${outDir}/src/App.tsx`, appTsx);
  await writeFile(`${outDir}/src/styles.css`, styles);
  await writeFile(`${outDir}/src/phantom-spec.json`, `${JSON.stringify(spec, null, 2)}\n`);
  await writeFile(`${outDir}/src/phantom-data-contract.json`, `${JSON.stringify(dataContract, null, 2)}\n`);
  await writeFile(`${outDir}/src/design-workflow.json`, `${JSON.stringify(designWorkflow, null, 2)}\n`);
  await writeFile(`${outDir}/src/design-handoff.json`, `${JSON.stringify(designHandoff, null, 2)}\n`);
  await writeFile(`${outDir}/src/implementation-gate.json`, `${JSON.stringify(implementationGate, null, 2)}\n`);
  await writeFile(`${outDir}/src/data-adapter.ts`, dataAdapterTs);
  await writeFile(`${outDir}/src/drill-actions.ts`, drillActionsTs);
  await writeFile(`${outDir}/src/routes.ts`, routesTs);
  await writeFile(`${outDir}/src/component-contracts.ts`, componentContractsTs);
  await writeFile(`${outDir}/react-implementation-backlog.json`, `${JSON.stringify(backlog, null, 2)}\n`);
  await writeFile(`${outDir}/REACT_IMPLEMENTATION_BACKLOG.md`, `# React Implementation Backlog\n\n${reactBacklogMarkdown(backlog)}\n`);
  await writeFile(`${outDir}/README.md`, readme);

  return {
    outDir,
    files: ['package.json', 'index.html', 'tsconfig.json', 'vite.config.ts', 'src/App.tsx', 'src/styles.css', 'src/phantom-spec.json', 'src/phantom-data-contract.json', 'src/design-workflow.json', 'src/design-handoff.json', 'src/implementation-gate.json', 'src/data-adapter.ts', 'src/drill-actions.ts', 'src/routes.ts', 'src/component-contracts.ts', 'react-implementation-backlog.json', 'REACT_IMPLEMENTATION_BACKLOG.md', 'README.md'],
    components: components.length,
    fields: dataContract.fields.length,
    drillActions: dataContract.drillActions.length,
    reactImplementationTasks: backlog.length,
  };
};

const fieldKind = (field, spec) => {
  if ((spec.dataContract?.metrics || []).includes(field)) return 'metric';
  if ((spec.dataContract?.dimensions || []).includes(field)) return 'dimension';
  return 'field';
};

const createDataContract = (spec) => {
  const components = (spec.views || []).flatMap((view) =>
    (view.components || []).map((component) => {
      const designSources = (spec.project?.designSources || [])
        .filter((source) => (source.linkedComponentIds || []).includes(component.id))
        .map((source) => source.id);

      return {
        viewId: view.id,
        viewName: view.name,
        componentId: component.id,
        title: component.title,
        type: component.type,
        designSources,
        fields: component.dataRequirements?.fields || [],
        metrics: component.dataRequirements?.metrics || [],
        dimensions: component.dataRequirements?.dimensions || [],
        filters: component.props?.filters || [],
        expectedGrain: component.props?.grain || null,
        exportTargets: component.exportTargets,
      };
    }),
  );
  const allFields = [...new Set([
    ...(spec.dataContract?.fields || []),
    ...components.flatMap((component) => component.fields),
  ])].sort();

  return {
    contractVersion: '0.1.0',
    sourceSpecVersion: spec.specVersion,
    generatedAt: new Date().toISOString(),
    project: {
      scenario: spec.project?.scenario,
      mode: spec.mode,
      signOffStatus: spec.project?.specification?.signOffStatus || 'draft',
      designEntryPoint: spec.project?.designEntryPoint,
      designSources: spec.project?.designSources || [],
    },
    designWorkflow: createDesignWorkflow(spec),
    workshopIntent: createWorkshopIntent(spec.project?.specification),
    dataSources: normalizeDataSources(spec.project?.specification),
    fields: allFields.map((name) => ({
      name,
      kind: fieldKind(name, spec),
      requiredBy: components
        .filter((component) => component.fields.includes(name))
        .map((component) => component.componentId),
    })),
    metrics: spec.dataContract?.metrics || [],
    dimensions: spec.dataContract?.dimensions || [],
    filters: spec.filters || {},
    components,
    drillActions: spec.interactions?.drillActions || [],
    implementationNotes: [
      'Map each component to a client-owned API, warehouse/dbt model, or optional semantic endpoint.',
      'Preserve component IDs in implementation so tests, agents, and drill actions can reference stable targets.',
      'Use designSources for Figma-led visual fidelity, but treat this contract as the source of truth for analytical behavior.',
    ],
  };
};

const markdownList = (items) => (items.length ? items.map((item) => `- ${item}`).join('\n') : '- None specified');

const createWorkshopIntent = (specification = {}) => ({
  businessQuestions: specification.businessQuestions,
  audience: specification.audience,
  decisions: specification.decisions,
  acceptanceCriteria: specification.acceptanceCriteria,
  buildNotes: specification.buildNotes,
});

const hasText = (value) => typeof value === 'string' && value.trim().length > 0;

const workshopIntentRequiredFields = [
  { key: 'businessQuestions', label: 'business questions' },
  { key: 'audience', label: 'audience' },
  { key: 'decisions', label: 'decisions/actions' },
  { key: 'acceptanceCriteria', label: 'acceptance criteria' },
];

const createWorkshopIntentCompleteness = (intent = {}) => {
  const present = workshopIntentRequiredFields
    .filter((field) => hasText(intent[field.key]))
    .map((field) => field.label);
  const missing = workshopIntentRequiredFields
    .filter((field) => !hasText(intent[field.key]))
    .map((field) => field.label);

  return {
    complete: missing.length === 0,
    present,
    missing,
  };
};

const parseSourceSystems = (sourceSystems) =>
  String(sourceSystems || '')
    .split(/[\n,;]+/)
    .map((source) => source.trim())
    .filter(Boolean);

const normalizeDataSources = (specification = {}) =>
  Array.isArray(specification.dataSources) ? specification.dataSources : [];

const createDataPath = (spec) => {
  const dataSources = normalizeDataSources(spec.project?.specification);
  const components = (spec.views || []).flatMap((view) => view.components || []).map((component) => {
    const fields = component.dataRequirements?.fields || [];
    const candidateDataSources = dataSources
      .filter((source) => {
        const linkedComponent = (source.linkedComponentIds || []).includes(component.id);
        const linkedField = fields.some((field) => (source.linkedFields || []).includes(field));
        return linkedComponent || linkedField;
      })
      .map((source) => source.id);

    return {
      componentId: component.id,
      title: component.title,
      fields,
      metrics: component.dataRequirements?.metrics || [],
      dimensions: component.dataRequirements?.dimensions || [],
      candidateDataSources,
    };
  });
  const mappedFields = new Set(dataSources.flatMap((source) => source.linkedFields || []));
  const unmappedFields = (spec.dataContract?.fields || []).filter((field) => !mappedFields.has(field));
  const unmappedComponents = components
    .filter((component) => component.candidateDataSources.length === 0)
    .map((component) => component.componentId);
  const sourceSystems = parseSourceSystems(spec.project?.specification?.sourceSystems);
  const hasAnySourceContext = sourceSystems.length > 0 || dataSources.length > 0;

  return {
    subject: 'data-path',
    grain: spec.project?.specification?.grain,
    refreshCadence: spec.project?.specification?.refreshCadence,
    sourceSystems,
    dataSources,
    components,
    unmappedComponents,
    unmappedFields,
    requiredNextSteps: [
      ...(!hasAnySourceContext
        ? ['Capture at least one source system or structured data source before implementation handoff.']
        : []),
      ...(unmappedComponents.length > 0
        ? ['Map each component to a client API, warehouse/dbt model, semantic API, file, or manual source.']
        : []),
      ...(unmappedFields.length > 0
        ? ['Map required fields to structured data sources or confirm they come from shared source systems.']
        : []),
      ...(!spec.project?.specification?.grain ? ['Confirm expected data grain.'] : []),
      ...(!spec.project?.specification?.refreshCadence ? ['Confirm refresh cadence.'] : []),
    ],
  };
};

const designSourcesMarkdown = (designSources = []) => {
  if (!designSources.length) return '- None specified';
  return designSources
    .map((source) => {
      const details = [
        `type: ${source.type}`,
      source.url ? `url: ${source.url}` : null,
      source.frameId ? `frame: ${source.frameId}` : null,
      source.componentId ? `component: ${source.componentId}` : null,
      source.linkedViewIds?.length ? `views: ${source.linkedViewIds.join(', ')}` : null,
      source.linkedComponentIds?.length ? `components: ${source.linkedComponentIds.join(', ')}` : null,
      source.notes ? `notes: ${source.notes}` : null,
    ].filter(Boolean);
      return `- ${source.name} (${details.join('; ')})`;
    })
    .join('\n');
};

const dataSourcesMarkdown = (dataSources = []) => {
  if (!dataSources.length) return '- None specified';

  return dataSources
    .map((source) => {
      const details = [
        `type: ${source.type}`,
        source.model ? `model: ${source.model}` : null,
        source.url ? `url: ${source.url}` : null,
        source.linkedComponentIds?.length ? `components: ${source.linkedComponentIds.join(', ')}` : null,
        source.linkedFields?.length ? `fields: ${source.linkedFields.join(', ')}` : null,
        source.description ? `description: ${source.description}` : null,
      ].filter(Boolean);
      return `- ${source.name} (${details.join('; ')})`;
    })
    .join('\n');
};

const createDesignMappingSummary = (designSources = []) => {
  const mappedSources = designSources.filter((source) =>
    (source.linkedViewIds || []).length > 0 || (source.linkedComponentIds || []).length > 0,
  );

  return {
    totalSources: designSources.length,
    mappedSources: mappedSources.length,
    unmappedSources: designSources.length - mappedSources.length,
    linkedViewIds: uniqueSorted(designSources.flatMap((source) => source.linkedViewIds || [])),
    linkedComponentIds: uniqueSorted(designSources.flatMap((source) => source.linkedComponentIds || [])),
    sourceIdsWithoutMappings: designSources
      .filter((source) => (source.linkedViewIds || []).length === 0 && (source.linkedComponentIds || []).length === 0)
      .map((source) => source.id),
  };
};

const reactComponentName = (type) =>
  `${String(type || 'Analytical')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') || 'Analytical'}Component`;

const createReactBacklog = (spec) =>
  (spec.views || []).flatMap((view) => (view.components || []).map((component) => {
    const fields = component.dataRequirements?.fields || [];
    const powerBiStatus = component.exportTargets?.powerBi?.status || 'unknown';
    const linkedDesignSources = (spec.project?.designSources || [])
      .filter((source) => (source.linkedComponentIds || []).includes(component.id))
      .map((source) => source.id);
    const workItems = [
      `Replace placeholder with ${reactComponentName(component.type)}.`,
      fields.length
        ? `Bind data fields: ${fields.join(', ')}.`
        : 'Confirm whether this component is design-only or needs a data binding.',
      'Apply interaction, filter, and drill behavior from the Phantom Spec.',
    ];
    if ((spec.project?.designSources || []).length > 0) {
      workItems.push('Apply linked design-source guidance for visual fidelity.');
    }
    if (powerBiStatus !== 'ready') {
      workItems.push(`React implementation can exceed Power BI constraints; Power BI status is ${powerBiStatus}.`);
    }

    return {
      componentId: component.id,
      title: component.title,
      type: component.type,
      suggestedComponent: reactComponentName(component.type),
      designSources: linkedDesignSources,
      fields,
      metrics: component.dataRequirements?.metrics || [],
      dimensions: component.dataRequirements?.dimensions || [],
      powerBiStatus,
      workItems,
    };
  }));

const reactBacklogMarkdown = (tasks = []) => {
  if (!tasks.length) return '- No components to implement.';
  return tasks
    .map((task) => `### ${task.title}

- Component ID: ${task.componentId}
- Type: ${task.type}
- Suggested React component: ${task.suggestedComponent}
- Linked design sources: ${(task.designSources || []).join(', ') || 'None'}
- Required fields: ${task.fields.join(', ') || 'None'}
- Metrics: ${task.metrics.join(', ') || 'None'}
- Dimensions: ${task.dimensions.join(', ') || 'None'}
- Power BI compatibility: ${task.powerBiStatus}

${task.workItems.map((item) => `- [ ] ${item}`).join('\n')}`)
    .join('\n\n');
};

const formatDrillContext = (context = []) =>
  context.map((item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') return `${item.source || ''}->${item.target || ''}`;
    return String(item);
  }).filter(Boolean).join(', ') || 'None';

const writeDataContract = async (spec, outDir) => {
  await mkdir(outDir, { recursive: true });
  const contract = createDataContract(spec);
  const componentRows = contract.components
    .map((component) => `| ${component.componentId} | ${component.title} | ${component.type} | ${(component.designSources || []).join(', ') || 'None'} | ${component.fields.join(', ') || 'None'} |`)
    .join('\n');
  const drillRows = contract.drillActions
    .map((action) => `| ${action.id} | ${action.label} | ${action.sourceComponentId} | ${action.targetType}:${action.targetId} | ${formatDrillContext(action.context)} |`)
    .join('\n');
  const fieldRows = contract.fields
    .map((field) => `| ${field.name} | ${field.kind} | ${field.requiredBy.join(', ') || 'None'} |`)
    .join('\n');

  const markdown = `# ${contract.project.scenario} Data Contract

Generated from Phantom Spec ${contract.sourceSpecVersion}.

## Project

- Mode: ${contract.project.mode}
- Sign-off: ${contract.project.signOffStatus || 'draft'}
- Entry point: ${contract.project.designEntryPoint}
- Design sources: ${contract.project.designSources.length}

## Design Sources

${designSourcesMarkdown(contract.project.designSources)}

## Design Workflow

- Design plane: ${contract.designWorkflow.designPlane}
- Phantom role: ${contract.designWorkflow.phantomRole}
- Status: ${contract.designWorkflow.status}
- Handoff modes: ${contract.designWorkflow.handoffModes.join(', ')}

### Design Workflow Next Steps

${markdownList(contract.designWorkflow.requiredNextSteps)}

## Workshop Intent

- Business questions: ${contract.workshopIntent.businessQuestions || 'Not specified'}
- Audience: ${contract.workshopIntent.audience || 'Not specified'}
- Decisions/actions: ${contract.workshopIntent.decisions || 'Not specified'}
- Acceptance criteria: ${contract.workshopIntent.acceptanceCriteria || 'Not specified'}
- Build notes: ${contract.workshopIntent.buildNotes || 'Not specified'}

## Data Sources

${dataSourcesMarkdown(contract.dataSources)}

## Metrics

${markdownList(contract.metrics)}

## Dimensions

${markdownList(contract.dimensions)}

## Fields

| Field | Kind | Required By |
| --- | --- | --- |
${fieldRows || '| None | field | None |'}

## Components

| Component ID | Title | Type | Design Sources | Required Fields |
| --- | --- | --- | --- | --- |
${componentRows || '| None | None | None | None | None |'}

## Drill Actions

| Action ID | Label | Source | Target | Context |
| --- | --- | --- | --- | --- |
${drillRows || '| None | None | None | None | None |'}

## Implementation Notes

${markdownList(contract.implementationNotes)}
`;

  await writeFile(`${outDir}/data-contract.json`, `${JSON.stringify(contract, null, 2)}\n`);
  await writeFile(`${outDir}/DATA_CONTRACT.md`, markdown);

  return {
    outDir,
    files: ['data-contract.json', 'DATA_CONTRACT.md'],
    components: contract.components.length,
    fields: contract.fields.length,
    drillActions: contract.drillActions.length,
  };
};

const createPowerBiGuide = (spec) => {
  const components = (spec.views || []).flatMap((view) => view.components || []);
  const readiness = checkReadiness(spec, 'powerBi');
  const countStatus = (status) => components.filter((component) => component.exportTargets?.powerBi?.status === status).length;

  return {
    guideVersion: '0.1.0',
    sourceSpecVersion: spec.specVersion,
    generatedAt: new Date().toISOString(),
    project: {
      scenario: spec.project?.scenario,
      sourceMode: spec.mode,
      signOffStatus: spec.project?.specification?.signOffStatus || 'draft',
      designEntryPoint: spec.project?.designEntryPoint,
      designSources: spec.project?.designSources || [],
    },
    designWorkflow: createDesignWorkflow(spec),
    workshopIntent: createWorkshopIntent(spec.project?.specification),
    implementationGate: createImplementationGate(spec),
    readiness,
    summary: {
      views: spec.views?.length || 0,
      components: components.length,
      readyVisuals: countStatus('ready'),
      approximateVisuals: countStatus('approximate'),
      unsupportedVisuals: countStatus('unsupported'),
      drillActions: spec.interactions?.drillActions?.length || 0,
    },
    components: components.map((component) => ({
      id: component.id,
      title: component.title,
      type: component.type,
      powerBiStatus: component.exportTargets?.powerBi?.status || 'unknown',
      designSources: (spec.project?.designSources || [])
        .filter((source) => (source.linkedComponentIds || []).includes(component.id))
        .map((source) => source.id),
      fields: component.dataRequirements?.fields || [],
      metrics: component.dataRequirements?.metrics || [],
      dimensions: component.dataRequirements?.dimensions || [],
      notes: component.exportTargets?.powerBi?.notes || [],
    })),
    drillActions: spec.interactions?.drillActions || [],
    buildChecklist: [
      'Confirm every unsupported visual has been replaced with a Power BI-safe alternative or moved to React Product Mode.',
      'Review approximate visuals and choose the nearest native Power BI visual or document a custom visual requirement.',
      'Create field wells from each component data requirement before styling visuals.',
      'Implement drill-through pages or buttons for supported drill actions and document any behavior that requires bookmarks or custom navigation.',
      'Apply theme palette, typography, spacing, and design-source references after data bindings are correct.',
      'Run a final Power BI readiness check before client handoff.',
    ],
  };
};

const powerBiGuideMarkdown = (guide) => {
  const componentRows = guide.components
    .map((component) => `| ${component.id} | ${component.title} | ${component.type} | ${component.powerBiStatus} | ${(component.designSources || []).join(', ') || 'None'} | ${component.fields.join(', ') || 'None'} | ${component.notes.join(' ') || 'None'} |`)
    .join('\n');
  const drillRows = guide.drillActions
    .map((action) => `| ${action.id} | ${action.label} | ${action.sourceComponentId} | ${action.targetType}:${action.targetId} | ${formatDrillContext(action.context)} | ${action.preserveFilters ? 'Yes' : 'No'} |`)
    .join('\n');
  const issues = [
    ...guide.readiness.errors.map((issue) => `- ERROR ${issue.code}: ${issue.message}`),
    ...guide.readiness.warnings.map((issue) => `- WARNING ${issue.code}: ${issue.message}`),
  ];

  return `# ${guide.project.scenario} Power BI Implementation Guide

Generated from Phantom Spec ${guide.sourceSpecVersion}.

## Readiness

- Ready for Power BI handoff: ${guide.readiness.ready ? 'Yes' : 'No'}
- Ready for implementation: ${guide.implementationGate.readyForImplementation ? 'Yes' : 'No'}
- Source mode: ${guide.project.sourceMode}
- Sign-off: ${guide.project.signOffStatus || 'draft'}
- Entry point: ${guide.project.designEntryPoint}
- Design sources: ${guide.project.designSources.length}
- Components: ${guide.summary.components}
- Ready visuals: ${guide.summary.readyVisuals}
- Approximate visuals: ${guide.summary.approximateVisuals}
- Unsupported visuals: ${guide.summary.unsupportedVisuals}
- Drill actions: ${guide.summary.drillActions}

## Implementation Gate

- Approved for implementation: ${guide.implementationGate.approvedForImplementation ? 'Yes' : 'No'}
- Design ready: ${guide.implementationGate.designReady ? 'Yes' : 'No'}
- Data path ready: ${guide.implementationGate.dataPathReady ? 'Yes' : 'No'}
- Workshop intent complete: ${guide.implementationGate.workshopIntentComplete ? 'Yes' : 'No'}
- React ready: ${guide.implementationGate.reactReady ? 'Yes' : 'No'}
- Power BI ready: ${guide.implementationGate.powerBiReady ? 'Yes' : 'No'}

### Implementation Gate Next Steps

${markdownList(guide.implementationGate.requiredNextSteps)}

## Design Sources

${designSourcesMarkdown(guide.project.designSources)}

## Design Workflow

- Design plane: ${guide.designWorkflow.designPlane}
- Phantom role: ${guide.designWorkflow.phantomRole}
- Status: ${guide.designWorkflow.status}
- Handoff modes: ${guide.designWorkflow.handoffModes.join(', ')}

### Design Workflow Next Steps

${markdownList(guide.designWorkflow.requiredNextSteps)}

## Workshop Intent

- Business questions: ${guide.workshopIntent.businessQuestions || 'Not specified'}
- Audience: ${guide.workshopIntent.audience || 'Not specified'}
- Decisions/actions: ${guide.workshopIntent.decisions || 'Not specified'}
- Acceptance criteria: ${guide.workshopIntent.acceptanceCriteria || 'Not specified'}
- Build notes: ${guide.workshopIntent.buildNotes || 'Not specified'}

## Issues

${issues.length ? issues.join('\n') : '- None'}

## Visual Build Matrix

| Component ID | Title | Type | Power BI Status | Design Sources | Required Fields | Notes |
| --- | --- | --- | --- | --- | --- | --- |
${componentRows || '| None | None | None | ready | None | None | None |'}

## Drill-Through And Navigation

| Action ID | Label | Source | Target | Context | Preserve Filters |
| --- | --- | --- | --- | --- | --- |
${drillRows || '| None | None | None | None | None | No |'}

## Build Checklist

${markdownList(guide.buildChecklist)}
`;
};

const writePowerBiGuide = async (spec, outDir) => {
  await mkdir(outDir, { recursive: true });
  const guide = createPowerBiGuide(spec);
  await writeFile(`${outDir}/power-bi-implementation-guide.json`, `${JSON.stringify(guide, null, 2)}\n`);
  await writeFile(`${outDir}/POWER_BI_IMPLEMENTATION_GUIDE.md`, powerBiGuideMarkdown(guide));

  return {
    outDir,
    files: ['power-bi-implementation-guide.json', 'POWER_BI_IMPLEMENTATION_GUIDE.md'],
    ready: guide.readiness.ready,
    components: guide.summary.components,
    approximateVisuals: guide.summary.approximateVisuals,
    unsupportedVisuals: guide.summary.unsupportedVisuals,
    drillActions: guide.summary.drillActions,
  };
};

const writeHandoffPack = async (spec, outDir) => {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const dataContractDir = `${outDir}/data-contract`;
  const powerBiDir = `${outDir}/power-bi`;
  const reactDir = `${outDir}/react-starter`;
  const dataContract = await writeDataContract(spec, dataContractDir);
  const powerBiGuide = await writePowerBiGuide(spec, powerBiDir);
  const reactStarter = await writeReactStarter(spec, reactDir);
  const readiness = {
    react: checkReadiness(spec, 'react'),
    powerBi: checkReadiness(spec, 'powerBi'),
  };
  const handoffRecommendation = getHandoffRecommendation(readiness.react.ready, readiness.powerBi.ready);
  const nextActions = getHandoffNextActions(readiness.react, readiness.powerBi);
  const handoffSummary = inspectSpec(spec, 'handoff-summary');
  const designHandoff = createDesignHandoff(spec);
  const manifest = {
    manifestVersion: '0.1.0',
    sourceSpecVersion: spec.specVersion,
    generatedAt: new Date().toISOString(),
    project: {
      scenario: spec.project?.scenario,
      mode: spec.mode,
      designEntryPoint: spec.project?.designEntryPoint,
      designSources: spec.project?.designSources || [],
    },
    readiness,
    handoffRecommendation,
    approval: handoffSummary.approval,
    implementationGate: handoffSummary.implementationGate,
    dataPath: handoffSummary.dataPath,
    designWorkflow: handoffSummary.designWorkflow,
    designHandoff,
    designMapping: handoffSummary.designMapping,
    workshopIntent: handoffSummary.workshopIntent,
    workshopCompleteness: handoffSummary.workshopCompleteness,
    nextActions,
    artifacts: {
      spec: 'phantom-spec.json',
      handoffSummary: 'handoff-summary.json',
      implementationGate: 'implementation-gate.json',
      designHandoff: 'design-handoff.json',
      dataContract: dataContract.files.map((file) => `data-contract/${file}`),
      powerBiGuide: powerBiGuide.files.map((file) => `power-bi/${file}`),
      reactStarter: reactStarter.files.map((file) => `react-starter/${file}`),
    },
    summary: {
      components: reactStarter.components,
      fields: reactStarter.fields,
      drillActions: reactStarter.drillActions,
      reactImplementationTasks: reactStarter.reactImplementationTasks,
      powerBiApproximateVisuals: powerBiGuide.approximateVisuals,
      powerBiUnsupportedVisuals: powerBiGuide.unsupportedVisuals,
    },
  };
const readme = `# ${spec.project?.scenario || 'Phantom'} Handoff Pack

Generated from Phantom Spec ${spec.specVersion}.

## Project

- Mode: ${spec.mode}
- Sign-off: ${spec.project?.specification?.signOffStatus || 'draft'}
- Entry point: ${spec.project?.designEntryPoint || 'phantom-led'}
- Design sources: ${(spec.project?.designSources || []).length}

## Design Sources

${designSourcesMarkdown(spec.project?.designSources || [])}

## Implementation Gate

- Ready for implementation: ${handoffSummary.implementationGate.readyForImplementation ? 'Yes' : 'No'}
- Approved for implementation: ${handoffSummary.implementationGate.approvedForImplementation ? 'Yes' : 'No'}
- Design ready: ${handoffSummary.implementationGate.designReady ? 'Yes' : 'No'}
- Data path ready: ${handoffSummary.implementationGate.dataPathReady ? 'Yes' : 'No'}
- Workshop intent complete: ${handoffSummary.implementationGate.workshopIntentComplete ? 'Yes' : 'No'}
- React ready: ${handoffSummary.implementationGate.reactReady ? 'Yes' : 'No'}
- Power BI ready: ${handoffSummary.implementationGate.powerBiReady ? 'Yes' : 'No'}

### Implementation Gate Blockers

${markdownList(handoffSummary.implementationGate.blockingReasons)}

### Implementation Gate Required Next Steps

${markdownList(handoffSummary.implementationGate.requiredNextSteps)}

## Data Path

- Grain: ${handoffSummary.dataPath.grain || 'Not specified'}
- Refresh cadence: ${handoffSummary.dataPath.refreshCadence || 'Not specified'}
- Source systems: ${handoffSummary.dataPath.sourceSystems.join(', ') || 'None'}
- Structured data sources: ${handoffSummary.dataPath.dataSources.length}
- Unmapped components: ${handoffSummary.dataPath.unmappedComponents.join(', ') || 'None'}
- Unmapped fields: ${handoffSummary.dataPath.unmappedFields.join(', ') || 'None'}

## Design Workflow

- Design plane: ${handoffSummary.designWorkflow.designPlane}
- Phantom role: ${handoffSummary.designWorkflow.phantomRole}
- Status: ${handoffSummary.designWorkflow.status}
- Handoff modes: ${handoffSummary.designWorkflow.handoffModes.join(', ')}

### Design Workflow Next Steps

${markdownList(handoffSummary.designWorkflow.requiredNextSteps)}

## Design Mapping

- Sources: ${handoffSummary.designMapping.totalSources}
- Mapped sources: ${handoffSummary.designMapping.mappedSources}
- Unmapped sources: ${handoffSummary.designMapping.unmappedSources}
- Linked views: ${handoffSummary.designMapping.linkedViewIds.join(', ') || 'None'}
- Linked components: ${handoffSummary.designMapping.linkedComponentIds.join(', ') || 'None'}

## Design Handoff

- Source mode: ${designHandoff.sourceMode}
- Can skip Figma: ${designHandoff.canSkipFigma ? 'Yes' : 'No'}
- Missing component mappings: ${designHandoff.missingMappings.join(', ') || 'None'}

## Workshop Intent

- Business questions: ${handoffSummary.workshopIntent.businessQuestions || 'Not specified'}
- Audience: ${handoffSummary.workshopIntent.audience || 'Not specified'}
- Decisions/actions: ${handoffSummary.workshopIntent.decisions || 'Not specified'}
- Acceptance criteria: ${handoffSummary.workshopIntent.acceptanceCriteria || 'Not specified'}
- Build notes: ${handoffSummary.workshopIntent.buildNotes || 'Not specified'}

## Workshop Completeness

- Complete: ${handoffSummary.workshopCompleteness.complete ? 'Yes' : 'No'}
- Present: ${handoffSummary.workshopCompleteness.present.join(', ') || 'None'}
- Missing: ${handoffSummary.workshopCompleteness.missing.join(', ') || 'None'}

## Contents

- \`phantom-spec.json\`: canonical workshop/spec artifact.
- \`data-contract/\`: JSON and Markdown data contract for APIs, warehouse/dbt models, or semantic endpoints.
- \`power-bi/\`: Power BI implementation guide with readiness, visual statuses, fields, drill-through notes, and blockers.
- \`react-starter/\`: Vite/React starter app with the spec, data contract, and typed drill actions embedded.
- \`handoff-summary.json\`: first-pass implementation gate, readiness, recommendation, counts, and next actions for agents.
- \`implementation-gate.json\`: standalone go/no-go decision for approval, design, data, workshop intent, and target-mode readiness.
- \`design-handoff.json\`: component-level Figma/default provenance and missing design mappings for agents and engineers.
- \`HANDOFF_MANIFEST.json\`: machine-readable index for agents and implementation pipelines.

## Readiness

- React ready: ${readiness.react.ready ? 'Yes' : 'No'}
- Power BI ready: ${readiness.powerBi.ready ? 'Yes' : 'No'}
- Power BI warnings: ${readiness.powerBi.warnings.length}
- Power BI errors: ${readiness.powerBi.errors.length}
- Recommended handoff: ${handoffRecommendation.target}
- Guidance: ${handoffRecommendation.guidance}

## Next Actions

${markdownList(nextActions)}

## Suggested Flow

1. Review \`HANDOFF_MANIFEST.json\`.
2. Use \`data-contract/\` to confirm fields and API/warehouse/dbt mappings.
3. For React Product Mode, start from \`react-starter/\`.
4. For Power BI Mode, use \`power-bi/POWER_BI_IMPLEMENTATION_GUIDE.md\` before building visuals.
`;

  await writeFile(`${outDir}/phantom-spec.json`, `${JSON.stringify(spec, null, 2)}\n`);
  await writeFile(`${outDir}/handoff-summary.json`, `${JSON.stringify(handoffSummary, null, 2)}\n`);
  await writeFile(`${outDir}/implementation-gate.json`, `${JSON.stringify(handoffSummary.implementationGate, null, 2)}\n`);
  await writeFile(`${outDir}/design-handoff.json`, `${JSON.stringify(designHandoff, null, 2)}\n`);
  await writeFile(`${outDir}/HANDOFF_MANIFEST.json`, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(`${outDir}/README.md`, readme);

  return {
    outDir,
    files: ['phantom-spec.json', 'handoff-summary.json', 'implementation-gate.json', 'design-handoff.json', 'HANDOFF_MANIFEST.json', 'README.md'],
    directories: ['data-contract', 'power-bi', 'react-starter'],
    readiness: {
      react: readiness.react.ready,
      powerBi: readiness.powerBi.ready,
    },
    summary: manifest.summary,
  };
};

try {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    usage();
    process.exit(0);
  }

  if (!['validate', 'summary', 'diff', 'readiness', 'export-react', 'export-data-contract', 'export-powerbi-guide', 'export-handoff-pack', 'inspect', 'import-design-source', 'import-data-source'].includes(command)) {
    throw new Error(`Unknown command: ${command}`);
  }

  if (command === 'diff') {
    const beforeSpec = await readSpec(specPath);
    const afterSpec = await readSpec(args[0]);
    const beforeErrors = validateSpec(beforeSpec);
    const afterErrors = validateSpec(afterSpec);
    if (beforeErrors.length > 0 || afterErrors.length > 0) {
      console.error(JSON.stringify({ valid: false, beforeErrors, afterErrors }, null, 2));
      process.exit(1);
    }
    console.log(JSON.stringify(diffSpecs(beforeSpec, afterSpec), null, 2));
    process.exit(0);
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

  if (command === 'inspect') {
    if (errors.length > 0) {
      console.error(JSON.stringify({ valid: false, errors }, null, 2));
      process.exit(1);
    }
    console.log(JSON.stringify(inspectSpec(spec, args[0]), null, 2));
  }

  if (command === 'import-design-source') {
    if (errors.length > 0) {
      console.error(JSON.stringify({ valid: false, errors }, null, 2));
      process.exit(1);
    }
    const { nextSpec, outPath, designSource } = mergeDesignSource(spec);
    await writeFile(outPath, `${JSON.stringify(nextSpec, null, 2)}\n`);
    console.log(JSON.stringify({
      outPath,
      designEntryPoint: nextSpec.project.designEntryPoint,
      designSources: nextSpec.project.designSources.length,
      imported: designSource,
    }, null, 2));
  }

  if (command === 'import-data-source') {
    if (errors.length > 0) {
      console.error(JSON.stringify({ valid: false, errors }, null, 2));
      process.exit(1);
    }
    const { nextSpec, outPath, dataSource } = mergeDataSource(spec);
    await writeFile(outPath, `${JSON.stringify(nextSpec, null, 2)}\n`);
    console.log(JSON.stringify({
      outPath,
      dataSources: nextSpec.project.specification.dataSources.length,
      imported: dataSource,
      dataPath: createDataPath(nextSpec),
    }, null, 2));
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

  if (command === 'export-react') {
    if (errors.length > 0) {
      console.error(JSON.stringify({ valid: false, errors }, null, 2));
      process.exit(1);
    }
    const report = checkReadiness(spec, 'react');
    if (!report.ready) {
      console.error(JSON.stringify(report, null, 2));
      process.exit(1);
    }
    console.log(JSON.stringify(await writeReactStarter(spec, getOutDir(command)), null, 2));
  }

  if (command === 'export-data-contract') {
    if (errors.length > 0) {
      console.error(JSON.stringify({ valid: false, errors }, null, 2));
      process.exit(1);
    }
    console.log(JSON.stringify(await writeDataContract(spec, getOutDir(command)), null, 2));
  }

  if (command === 'export-powerbi-guide') {
    if (errors.length > 0) {
      console.error(JSON.stringify({ valid: false, errors }, null, 2));
      process.exit(1);
    }
    console.log(JSON.stringify(await writePowerBiGuide(spec, getOutDir(command)), null, 2));
  }

  if (command === 'export-handoff-pack') {
    if (errors.length > 0) {
      console.error(JSON.stringify({ valid: false, errors }, null, 2));
      process.exit(1);
    }
    console.log(JSON.stringify(await writeHandoffPack(spec, getOutDir(command)), null, 2));
  }
} catch (error) {
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exit(1);
}
