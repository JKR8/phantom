import React from 'react'
import ReactDOM from 'react-dom/client'
import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthProvider';
import App from './App.tsx'
import './index.css'
import { createPBIPPackage } from './export'
import { gridToPixels } from './export/layoutConverter'
import { useStore } from './store/useStore'
import { getRecipeForVisual, generateSmartTitle } from './store/bindingRecipes'
import { generateAllMeasures, extractMetricBindings, generateBaseMeasures, generateVarianceMeasures } from './export/daxGenerator'
import { generateRetailData, generateSaaSData, generateHRData, generateLogisticsData, generatePortfolioData, generateSocialData, generateFinanceData } from './engine/dataGenerator'
import { paretoSample, logNormalSample, exponentialDecaySample, createSeededRandom, boxMuller, ar1Process, clamp, normalizeToTotal, weightedChoice } from './engine/distributions'
import { useThemeStore } from './store/useThemeStore'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FluentProvider theme={webLightTheme} style={{ height: '100vh', width: '100vw' }}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </FluentProvider>
  </React.StrictMode>,
)

if (import.meta.env.DEV) {
  // Test/debug helpers for Playwright and local inspection
  (window as any).__phantomDebug = {
    createPBIPPackage,
    gridToPixels,
    useStore,
    getRecipeForVisual,
    generateSmartTitle,
    // DAX generation
    generateAllMeasures,
    extractMetricBindings,
    generateBaseMeasures,
    generateVarianceMeasures,
    // Data generators
    generateRetailData,
    generateSaaSData,
    generateHRData,
    generateLogisticsData,
    generatePortfolioData,
    generateSocialData,
    generateFinanceData,
    // Distribution utilities
    paretoSample,
    logNormalSample,
    exponentialDecaySample,
    createSeededRandom,
    boxMuller,
    ar1Process,
    clamp,
    normalizeToTotal,
    weightedChoice,
    // Theme
    useThemeStore,
  };
}
