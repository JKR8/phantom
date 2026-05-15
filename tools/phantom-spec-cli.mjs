#!/usr/bin/env node
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [, , command, specPath, ...args] = process.argv;

const usage = () => {
  console.log(`Phantom Spec CLI

Usage:
  npm run phantom:spec -- validate <spec.json>
  npm run phantom:spec -- summary <spec.json>
  npm run phantom:spec -- readiness <spec.json> react|powerBi
  npm run phantom:spec -- export-react <spec.json> <dir>

Commands:
  validate  Validate a Phantom Spec JSON file for agent/build handoff.
  summary   Print a compact machine-readable summary.
  readiness Check React or Power BI handoff readiness.
  export-react Generate a minimal React starter scaffold from a ready spec.
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

const toIdentifier = (value) => {
  const cleaned = String(value || 'View')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return cleaned || 'View';
};

const getOutDir = () => {
  const outIndex = args.indexOf('--out');
  const outDir = outIndex >= 0 ? args[outIndex + 1] : args[0];
  if (!outDir) {
    throw new Error('Missing output directory for export-react.');
  }
  return resolve(outDir);
};

const writeReactStarter = async (spec, outDir) => {
  const components = (spec.views || []).flatMap((view) => view.components || []);
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
import './styles.css';

const ComponentCard = ({ component }: { component: any }) => (
  <section className="component-card">
    <div className="component-header">
      <strong>{component.title}</strong>
      <span>{component.type}</span>
    </div>
    <pre>{JSON.stringify(component.dataRequirements, null, 2)}</pre>
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
- a React/Vite shell
- one placeholder card per Phantom component
- data requirements visible in the UI

## Next Steps

1. Replace placeholder cards with production components.
2. Wire data requirements to the client API, warehouse/dbt model, or semantic API.
3. Implement drill actions from \`spec.interactions.drillActions\`.
4. Apply any Figma/design-source references from \`spec.project.designSources\`.
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
  await writeFile(`${outDir}/README.md`, readme);

  return {
    outDir,
    files: ['package.json', 'index.html', 'tsconfig.json', 'vite.config.ts', 'src/App.tsx', 'src/styles.css', 'src/phantom-spec.json', 'README.md'],
    components: components.length,
  };
};

try {
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    usage();
    process.exit(0);
  }

  if (!['validate', 'summary', 'readiness', 'export-react'].includes(command)) {
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
    console.log(JSON.stringify(await writeReactStarter(spec, getOutDir()), null, 2));
  }
} catch (error) {
  console.error(JSON.stringify({ error: error.message }, null, 2));
  process.exit(1);
}
