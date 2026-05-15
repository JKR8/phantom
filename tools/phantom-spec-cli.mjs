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
  npm run phantom:spec -- inspect <spec.json> components|drill-actions|data-requirements|design-sources|react-backlog|powerbi-build-matrix|handoff-summary
  npm run phantom:spec -- import-design-source <spec.json> figmaFrame "Client frame" <url> <frame-id> "notes" <out-spec.json>

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

  if (subject === 'design-sources') {
    return {
      subject,
      designEntryPoint: spec.project?.designEntryPoint || 'phantom-led',
      count: spec.project?.designSources?.length || 0,
      designSources: spec.project?.designSources || [],
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
    return {
      subject,
      project: {
        scenario: spec.project?.scenario,
        mode: spec.mode,
        designEntryPoint: spec.project?.designEntryPoint || 'phantom-led',
        designSources: spec.project?.designSources || [],
      },
      readiness: {
        react: reactReadiness,
        powerBi: powerBiGuide.readiness,
      },
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
      nextActions: [
        ...reactReadiness.errors.map((issue) => `React blocker: ${issue.message}`),
        ...powerBiGuide.readiness.errors.map((issue) => `Power BI blocker: ${issue.message}`),
        ...powerBiGuide.readiness.warnings.map((issue) => `Power BI warning: ${issue.message}`),
      ],
    };
  }

  throw new Error('Inspect subject must be components, drill-actions, data-requirements, design-sources, react-backlog, powerbi-build-matrix, or handoff-summary.');
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
import { getComponentDataRequest } from './data-adapter';
import { drillActions } from './drill-actions';
import './styles.css';

const ComponentCard = ({ component }: { component: any }) => (
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
        <span>{spec.project.designEntryPoint}</span>
        <span>{spec.views.length} view(s)</span>
        <span>{dataContract.fields.length} field(s)</span>
        <span>{drillActions.length} drill action(s)</span>
      </div>
    </header>
    {spec.views.map((view: any) => (
      <div key={view.id}>
        <h2>{view.name}</h2>
        <div className="grid">
          {view.components.map((component: any) => (
            <ComponentCard key={component.id} component={component} />
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
- drill action definitions for routes/detail panels
- a React/Vite shell
- one placeholder card per Phantom component
- data requirements visible in the UI

## Next Steps

1. Replace placeholder cards with production components.
2. Wire \`src/data-adapter.ts\` to the client API, warehouse/dbt model, or semantic API.
3. Implement drill actions from \`spec.interactions.drillActions\`.
4. Apply any Figma/design-source references from \`spec.project.designSources\`.

## Design Sources

${designSourcesMarkdown(spec.project?.designSources || [])}

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
  await writeFile(`${outDir}/src/data-adapter.ts`, dataAdapterTs);
  await writeFile(`${outDir}/src/drill-actions.ts`, drillActionsTs);
  await writeFile(`${outDir}/react-implementation-backlog.json`, `${JSON.stringify(backlog, null, 2)}\n`);
  await writeFile(`${outDir}/REACT_IMPLEMENTATION_BACKLOG.md`, `# React Implementation Backlog\n\n${reactBacklogMarkdown(backlog)}\n`);
  await writeFile(`${outDir}/README.md`, readme);

  return {
    outDir,
    files: ['package.json', 'index.html', 'tsconfig.json', 'vite.config.ts', 'src/App.tsx', 'src/styles.css', 'src/phantom-spec.json', 'src/phantom-data-contract.json', 'src/data-adapter.ts', 'src/drill-actions.ts', 'react-implementation-backlog.json', 'REACT_IMPLEMENTATION_BACKLOG.md', 'README.md'],
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
    (view.components || []).map((component) => ({
      viewId: view.id,
      viewName: view.name,
      componentId: component.id,
      title: component.title,
      type: component.type,
      fields: component.dataRequirements?.fields || [],
      metrics: component.dataRequirements?.metrics || [],
      dimensions: component.dataRequirements?.dimensions || [],
      filters: component.props?.filters || [],
      expectedGrain: component.props?.grain || null,
      exportTargets: component.exportTargets,
    })),
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
      designEntryPoint: spec.project?.designEntryPoint,
      designSources: spec.project?.designSources || [],
    },
    dataSources: spec.project?.specification?.dataSources || [],
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

const designSourcesMarkdown = (designSources = []) => {
  if (!designSources.length) return '- None specified';
  return designSources
    .map((source) => {
      const details = [
        `type: ${source.type}`,
        source.url ? `url: ${source.url}` : null,
        source.frameId ? `frame: ${source.frameId}` : null,
        source.componentId ? `component: ${source.componentId}` : null,
        source.notes ? `notes: ${source.notes}` : null,
      ].filter(Boolean);
      return `- ${source.name} (${details.join('; ')})`;
    })
    .join('\n');
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
    .map((component) => `| ${component.componentId} | ${component.title} | ${component.type} | ${component.fields.join(', ') || 'None'} |`)
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
- Entry point: ${contract.project.designEntryPoint}
- Design sources: ${contract.project.designSources.length}

## Design Sources

${designSourcesMarkdown(contract.project.designSources)}

## Metrics

${markdownList(contract.metrics)}

## Dimensions

${markdownList(contract.dimensions)}

## Fields

| Field | Kind | Required By |
| --- | --- | --- |
${fieldRows || '| None | field | None |'}

## Components

| Component ID | Title | Type | Required Fields |
| --- | --- | --- | --- |
${componentRows || '| None | None | None | None |'}

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
      designEntryPoint: spec.project?.designEntryPoint,
      designSources: spec.project?.designSources || [],
    },
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
    .map((component) => `| ${component.id} | ${component.title} | ${component.type} | ${component.powerBiStatus} | ${component.fields.join(', ') || 'None'} | ${component.notes.join(' ') || 'None'} |`)
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
- Source mode: ${guide.project.sourceMode}
- Entry point: ${guide.project.designEntryPoint}
- Design sources: ${guide.project.designSources.length}
- Components: ${guide.summary.components}
- Ready visuals: ${guide.summary.readyVisuals}
- Approximate visuals: ${guide.summary.approximateVisuals}
- Unsupported visuals: ${guide.summary.unsupportedVisuals}
- Drill actions: ${guide.summary.drillActions}

## Design Sources

${designSourcesMarkdown(guide.project.designSources)}

## Issues

${issues.length ? issues.join('\n') : '- None'}

## Visual Build Matrix

| Component ID | Title | Type | Power BI Status | Required Fields | Notes |
| --- | --- | --- | --- | --- | --- |
${componentRows || '| None | None | None | ready | None | None |'}

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
    artifacts: {
      spec: 'phantom-spec.json',
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
- Entry point: ${spec.project?.designEntryPoint || 'phantom-led'}
- Design sources: ${(spec.project?.designSources || []).length}

## Design Sources

${designSourcesMarkdown(spec.project?.designSources || [])}

## Contents

- \`phantom-spec.json\`: canonical workshop/spec artifact.
- \`data-contract/\`: JSON and Markdown data contract for APIs, warehouse/dbt models, or semantic endpoints.
- \`power-bi/\`: Power BI implementation guide with readiness, visual statuses, fields, drill-through notes, and blockers.
- \`react-starter/\`: Vite/React starter app with the spec, data contract, and typed drill actions embedded.
- \`HANDOFF_MANIFEST.json\`: machine-readable index for agents and implementation pipelines.

## Readiness

- React ready: ${readiness.react.ready ? 'Yes' : 'No'}
- Power BI ready: ${readiness.powerBi.ready ? 'Yes' : 'No'}
- Power BI warnings: ${readiness.powerBi.warnings.length}
- Power BI errors: ${readiness.powerBi.errors.length}

## Suggested Flow

1. Review \`HANDOFF_MANIFEST.json\`.
2. Use \`data-contract/\` to confirm fields and API/warehouse/dbt mappings.
3. For React Product Mode, start from \`react-starter/\`.
4. For Power BI Mode, use \`power-bi/POWER_BI_IMPLEMENTATION_GUIDE.md\` before building visuals.
`;

  await writeFile(`${outDir}/phantom-spec.json`, `${JSON.stringify(spec, null, 2)}\n`);
  await writeFile(`${outDir}/HANDOFF_MANIFEST.json`, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(`${outDir}/README.md`, readme);

  return {
    outDir,
    files: ['phantom-spec.json', 'HANDOFF_MANIFEST.json', 'README.md'],
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

  if (!['validate', 'summary', 'diff', 'readiness', 'export-react', 'export-data-contract', 'export-powerbi-guide', 'export-handoff-pack', 'inspect', 'import-design-source'].includes(command)) {
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
