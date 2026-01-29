import React, { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { useStore, useFilteredSales } from '../store/useStore';
import { useThemeStore } from '../store/useThemeStore';
import { formatMetricValue, getDimensionValue, getMetricValue } from '../utils/chartUtils';

// TopoJSON URLs for maps
const US_GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';
const WORLD_GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// US State name to abbreviation mapping
const US_STATE_ABBREV: Record<string, string> = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
  'District of Columbia': 'DC'
};

// Reverse mapping: abbreviation to full name
const ABBREV_TO_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(US_STATE_ABBREV).map(([k, v]) => [v, k])
);

// Common region names used in demo data
const REGION_MAPPING: Record<string, string[]> = {
  'North': ['New York', 'Massachusetts', 'Connecticut', 'Pennsylvania', 'New Jersey', 'Maine', 'Vermont', 'New Hampshire', 'Rhode Island'],
  'South': ['Texas', 'Florida', 'Georgia', 'North Carolina', 'South Carolina', 'Virginia', 'Tennessee', 'Alabama', 'Mississippi', 'Louisiana', 'Arkansas', 'Kentucky'],
  'East': ['New York', 'New Jersey', 'Pennsylvania', 'Massachusetts', 'Connecticut', 'Maryland', 'Delaware', 'Virginia', 'North Carolina', 'South Carolina', 'Florida', 'Georgia'],
  'West': ['California', 'Washington', 'Oregon', 'Nevada', 'Arizona', 'Utah', 'Colorado', 'New Mexico', 'Montana', 'Idaho', 'Wyoming'],
  'Midwest': ['Illinois', 'Ohio', 'Michigan', 'Indiana', 'Wisconsin', 'Minnesota', 'Iowa', 'Missouri', 'Kansas', 'Nebraska', 'North Dakota', 'South Dakota'],
  'Central': ['Illinois', 'Ohio', 'Michigan', 'Indiana', 'Wisconsin', 'Minnesota', 'Iowa', 'Missouri'],
  'Northeast': ['New York', 'Massachusetts', 'Connecticut', 'Pennsylvania', 'New Jersey', 'Maine', 'Vermont', 'New Hampshire', 'Rhode Island', 'Maryland', 'Delaware'],
  'Southeast': ['Florida', 'Georgia', 'North Carolina', 'South Carolina', 'Virginia', 'Tennessee', 'Alabama', 'Mississippi', 'Louisiana'],
  'Southwest': ['Texas', 'Arizona', 'New Mexico', 'Nevada', 'Oklahoma'],
  'Northwest': ['Washington', 'Oregon', 'Idaho', 'Montana', 'Wyoming'],
  // World regions
  'Americas': ['United States', 'Canada', 'Mexico', 'Brazil', 'Argentina'],
  'Europe': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Poland'],
  'Asia': ['China', 'Japan', 'India', 'South Korea', 'Singapore', 'Hong Kong', 'Taiwan', 'Thailand', 'Vietnam', 'Indonesia'],
  'APAC': ['China', 'Japan', 'Australia', 'India', 'South Korea', 'Singapore', 'New Zealand', 'Thailand', 'Vietnam', 'Indonesia', 'Malaysia', 'Philippines'],
  'EMEA': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'South Africa', 'United Arab Emirates', 'Saudi Arabia', 'Israel', 'Egypt']
};

// US State centroids for bubble placement
const US_STATE_CENTROIDS: Record<string, [number, number]> = {
  'Alabama': [-86.9023, 32.3182], 'Alaska': [-153.4937, 64.2008], 'Arizona': [-111.0937, 34.0489],
  'Arkansas': [-92.3731, 34.7465], 'California': [-119.4179, 36.7783], 'Colorado': [-105.3111, 39.0598],
  'Connecticut': [-72.7554, 41.5978], 'Delaware': [-75.5277, 39.1582], 'Florida': [-81.5158, 27.6648],
  'Georgia': [-83.6431, 32.1656], 'Hawaii': [-155.5828, 19.8968], 'Idaho': [-114.7420, 44.0682],
  'Illinois': [-89.3985, 40.6331], 'Indiana': [-86.1349, 40.2672], 'Iowa': [-93.0977, 41.8780],
  'Kansas': [-98.4842, 39.0119], 'Kentucky': [-84.2700, 37.8393], 'Louisiana': [-91.8623, 30.9843],
  'Maine': [-69.4455, 45.2538], 'Maryland': [-76.6413, 39.0458], 'Massachusetts': [-71.3824, 42.4072],
  'Michigan': [-85.6024, 44.3148], 'Minnesota': [-94.6859, 46.7296], 'Mississippi': [-89.3985, 32.3547],
  'Missouri': [-91.8318, 37.9643], 'Montana': [-110.3626, 46.8797], 'Nebraska': [-99.9018, 41.4925],
  'Nevada': [-116.4194, 38.8026], 'New Hampshire': [-71.5724, 43.1939], 'New Jersey': [-74.4057, 40.0583],
  'New Mexico': [-106.2485, 34.5199], 'New York': [-74.2179, 43.2994], 'North Carolina': [-79.0193, 35.7596],
  'North Dakota': [-101.0020, 47.5515], 'Ohio': [-82.9071, 40.4173], 'Oklahoma': [-97.0929, 35.0078],
  'Oregon': [-120.5542, 43.8041], 'Pennsylvania': [-77.1945, 41.2033], 'Rhode Island': [-71.4774, 41.5801],
  'South Carolina': [-81.1637, 33.8361], 'South Dakota': [-99.9018, 43.9695], 'Tennessee': [-86.5804, 35.5175],
  'Texas': [-99.9018, 31.9686], 'Utah': [-111.0937, 39.3210], 'Vermont': [-72.5778, 44.5588],
  'Virginia': [-78.1697, 37.4316], 'Washington': [-120.7401, 47.7511], 'West Virginia': [-80.4549, 38.5976],
  'Wisconsin': [-89.6385, 43.7844], 'Wyoming': [-107.2903, 43.0760], 'District of Columbia': [-77.0369, 38.9072]
};

interface MapChartProps {
  geoDimension: string;
  metric: string;
  mapType?: 'us' | 'world';
  displayMode?: 'choropleth' | 'bubble';
  manualData?: Array<{ region: string; value: number }>;
}

export const MapChart: React.FC<MapChartProps> = ({
  geoDimension,
  metric,
  mapType = 'us',
  displayMode = 'choropleth',
  manualData
}) => {
  const filteredSales = useFilteredSales(geoDimension);
  const stores = useStore((state) => state.stores);
  const products = useStore((state) => state.products);
  const customers = useStore((state) => state.customers);
  const setFilter = useStore((state) => state.setFilter);
  const activeFilters = useStore((state) => state.filters);
  const { getColor, highlightColor } = useThemeStore();
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Aggregate data by geography
  const { dataByRegion, maxValue, minValue } = useMemo(() => {
    const aggregation: Record<string, number> = {};

    if (manualData && manualData.length > 0) {
      manualData.forEach((d) => {
        aggregation[d.region] = d.value;
      });
    } else {
      filteredSales.forEach((sale) => {
        const region = getDimensionValue(sale, geoDimension, { stores, products, customers });
        aggregation[region] = (aggregation[region] || 0) + getMetricValue(sale, metric);
      });
    }

    const values = Object.values(aggregation);
    return {
      dataByRegion: aggregation,
      maxValue: Math.max(...values, 1),
      minValue: Math.min(...values, 0)
    };
  }, [manualData, filteredSales, geoDimension, metric, stores, products, customers]);

  // Color scale for choropleth
  const getColorForValue = (value: number) => {
    if (value === 0) return '#F3F2F1';
    const ratio = (value - minValue) / (maxValue - minValue || 1);
    // Use theme primary color with opacity based on value
    const baseColor = getColor(0);
    // Parse hex color and interpolate
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    // Interpolate from light (243, 242, 241) to full color
    const lightR = 243, lightG = 242, lightB = 241;
    const finalR = Math.round(lightR + (r - lightR) * ratio);
    const finalG = Math.round(lightG + (g - lightG) * ratio);
    const finalB = Math.round(lightB + (b - lightB) * ratio);
    return `rgb(${finalR}, ${finalG}, ${finalB})`;
  };

  // Bubble size scale
  const getBubbleSize = (value: number) => {
    if (value === 0) return 0;
    const ratio = (value - minValue) / (maxValue - minValue || 1);
    return 4 + ratio * 20; // Min size 4, max size 24
  };

  // Match geography name to data
  const getValueForGeo = (geoName: string): number => {
    // Direct match
    if (dataByRegion[geoName] !== undefined) {
      return dataByRegion[geoName];
    }
    // Abbreviation match for US
    if (US_STATE_ABBREV[geoName]) {
      const abbrev = US_STATE_ABBREV[geoName];
      if (dataByRegion[abbrev] !== undefined) return dataByRegion[abbrev];
    }
    if (ABBREV_TO_STATE[geoName]) {
      const fullName = ABBREV_TO_STATE[geoName];
      if (dataByRegion[fullName] !== undefined) return dataByRegion[fullName];
    }
    // Region name expansion
    for (const [regionName, states] of Object.entries(REGION_MAPPING)) {
      if (dataByRegion[regionName] !== undefined && states.includes(geoName)) {
        // Distribute region value equally across its states
        return dataByRegion[regionName] / states.length;
      }
    }
    return 0;
  };

  const handleGeoClick = (geoName: string) => {
    const currentFilter = activeFilters[geoDimension];
    if (currentFilter === geoName) {
      setFilter(geoDimension, null);
    } else {
      setFilter(geoDimension, geoName);
    }
  };

  const handleMouseMove = (e: React.MouseEvent, name: string, value: number) => {
    setTooltipContent(`${name}: ${formatMetricValue(metric, value)}`);
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setTooltipContent(null);
  };

  const geoUrl = mapType === 'us' ? US_GEO_URL : WORLD_GEO_URL;
  const projection = mapType === 'us' ? 'geoAlbersUsa' : 'geoMercator';

  // Get bubble data for bubble mode
  const bubbleData = useMemo(() => {
    if (displayMode !== 'bubble') return [];

    const bubbles: Array<{ name: string; coords: [number, number]; value: number }> = [];

    Object.entries(dataByRegion).forEach(([region, value]) => {
      // Try to get centroid for this region
      let coords: [number, number] | null = null;

      // Check if it's a US state
      if (US_STATE_CENTROIDS[region]) {
        coords = US_STATE_CENTROIDS[region];
      } else if (ABBREV_TO_STATE[region] && US_STATE_CENTROIDS[ABBREV_TO_STATE[region]]) {
        coords = US_STATE_CENTROIDS[ABBREV_TO_STATE[region]];
      } else if (REGION_MAPPING[region] && mapType === 'us') {
        // For regions, use a representative state centroid
        const firstState = REGION_MAPPING[region][0];
        if (US_STATE_CENTROIDS[firstState]) {
          coords = US_STATE_CENTROIDS[firstState];
        }
      }

      if (coords && value > 0) {
        bubbles.push({ name: region, coords, value });
      }
    });

    return bubbles;
  }, [dataByRegion, displayMode, mapType]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ComposableMap
        projection={projection}
        projectionConfig={mapType === 'us' ? { scale: 1000 } : { scale: 140, center: [0, 40] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const geoName = geo.properties.name;
                const value = getValueForGeo(geoName);
                const isSelected = activeFilters[geoDimension] === geoName;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={displayMode === 'choropleth' ? (isSelected ? highlightColor : getColorForValue(value)) : '#E1DFDD'}
                    stroke="#FFFFFF"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', fill: isSelected ? highlightColor : getColor(0), cursor: 'pointer' },
                      pressed: { outline: 'none' }
                    }}
                    onClick={() => handleGeoClick(geoName)}
                    onMouseMove={(e: React.MouseEvent) => handleMouseMove(e, geoName, value)}
                    onMouseLeave={handleMouseLeave}
                  />
                );
              })
            }
          </Geographies>
          {displayMode === 'bubble' && bubbleData.map((bubble, index) => (
            <Marker
              key={`bubble-${index}`}
              coordinates={bubble.coords}
              onClick={() => handleGeoClick(bubble.name)}
              onMouseMove={(e: any) => handleMouseMove(e, bubble.name, bubble.value)}
              onMouseLeave={handleMouseLeave}
            >
              <circle
                r={getBubbleSize(bubble.value)}
                fill={activeFilters[geoDimension] === bubble.name ? highlightColor : getColor(0)}
                fillOpacity={0.7}
                stroke="#FFFFFF"
                strokeWidth={1}
                style={{ cursor: 'pointer' }}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
      {tooltipContent && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPos.x + 10,
            top: tooltipPos.y - 10,
            backgroundColor: 'white',
            padding: '6px 10px',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            fontSize: '11px',
            pointerEvents: 'none',
            zIndex: 1000,
            border: '1px solid #E1DFDD'
          }}
        >
          {tooltipContent}
        </div>
      )}
    </div>
  );
};
