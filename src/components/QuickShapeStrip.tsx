import React from 'react';
import { makeStyles, shorthands, Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem, RadioGroup, Radio, Text, Checkbox } from '@fluentui/react-components';
import { ArrowSortDownRegular, ArrowSortUpRegular, TextAlignLeftRegular } from '@fluentui/react-icons';
import { useStore } from '../store/useStore';
import { ScenarioType, ScenarioFields, RecommendedDimensions, RecommendedMeasures } from '../store/semanticLayer';
import { generateSmartTitle } from '../store/bindingRecipes';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    ...shorthands.padding('4px', '8px'),
    ...shorthands.borderRadius('4px'),
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    position: 'absolute',
    zIndex: 1000,
    gap: '8px',
  },
  divider: {
    width: '1px',
    height: '24px',
    backgroundColor: '#E0E0E0',
  },
  label: {
    fontSize: '11px',
    fontWeight: 'semibold',
    color: '#605E5C',
  },
  group: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  }
});

interface QuickShapeStripProps {
    containerWidth: number;
    rowHeight: number;
    cols: number;
    margin: [number, number];
}

// Visual types that show the strip
const STRIP_TYPES = [
  'bar', 'column', 'stackedBar', 'stackedColumn',
  'line', 'area',
  'pie', 'donut', 'funnel', 'treemap',
  'card',
  'table',
  'waterfall', 'scatter', 'slicer',
];

// Types that use bar-style controls
const BAR_TYPES = ['bar', 'column', 'stackedBar', 'stackedColumn'];
// Types that use pie-style controls
const PIE_TYPES = ['pie', 'donut', 'funnel', 'treemap'];
// Types that use line-style controls
const LINE_TYPES = ['line', 'area'];

function sortByRecommended(items: string[], recommended: string[]): string[] {
  const order = new Map(recommended.map((name, idx) => [name, idx]));
  return [...items].sort((a, b) => {
    const ia = order.get(a) ?? 999;
    const ib = order.get(b) ?? 999;
    return ia - ib;
  });
}

export const QuickShapeStrip: React.FC<QuickShapeStripProps> = ({ containerWidth, rowHeight, cols, margin }) => {
  const styles = useStyles();
  const selectedItemId = useStore((state) => state.selectedItemId);
  const items = useStore((state) => state.items);
  const scenario = useStore((state) => state.scenario) as ScenarioType;
  const updateItemProps = useStore((state) => state.updateItemProps);
  const updateItemTitle = useStore((state) => state.updateItemTitle);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  if (!selectedItem) return null;

  const showStrip = STRIP_TYPES.includes(selectedItem.type);
  if (!showStrip) return null;

  const fields = ScenarioFields[scenario] || [];
  const measures = fields.filter(f => f.role === 'Measure');
  const categories = fields.filter(f => ['Category', 'Entity', 'Geography'].includes(f.role));

  // Sort using recommended ordering
  const recDims = RecommendedDimensions[scenario] || [];
  const recMeas = RecommendedMeasures[scenario] || [];
  const sortedCategories = sortByRecommended(categories.map(c => c.name), recDims);
  const sortedMeasures = sortByRecommended(measures.map(m => m.name), recMeas);

  const handleUpdate = (key: string, value: any) => {
    updateItemProps(selectedItem.id, { [key]: value });
  };

  // Title-updating handler: regenerates smart title when dimension, metric, or topN changes
  const handleTitleUpdate = (key: string, value: any) => {
    const updatedProps = { ...selectedItem.props, [key]: value };
    handleUpdate(key, value);

    // Only update title for dimension, metric, topN changes
    if (['dimension', 'metric', 'topN'].includes(key)) {
      const newTitle = generateSmartTitle(selectedItem.type, updatedProps, scenario);
      updateItemTitle(selectedItem.id, newTitle);
    }
  };

  // Calculate position
  const colWidth = (containerWidth - (margin[0] * (cols + 1))) / cols;
  const left = Math.round((selectedItem.layout.x * (colWidth + margin[0])) + margin[0]);
  const top = Math.round((selectedItem.layout.y * (rowHeight + margin[1])) - 40); // 40px above

  const renderBarControls = () => (
    <>
      <div className={styles.group}>
        <Text className={styles.label}>Bars</Text>
        <RadioGroup
            layout="horizontal"
            value={String(selectedItem.props?.topN ?? 'All')}
            onChange={(_, data) => handleTitleUpdate('topN', data.value)}
        >
          <Radio value="2" label="2" data-testid="quick-shape-bars-2" />
          <Radio value="5" label="5" data-testid="quick-shape-bars-5" />
          <Radio value="10" label="10" data-testid="quick-shape-bars-10" />
          <Radio value="All" label="All" data-testid="quick-shape-bars-all" />
        </RadioGroup>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <Checkbox
          checked={selectedItem.props?.showOther !== false}
          onChange={(_, data) => handleUpdate('showOther', !!data.checked)}
          label={<Text className={styles.label}>Other</Text>}
          data-testid="quick-shape-show-other"
        />
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <Text className={styles.label}>By</Text>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button size="small" appearance="outline" data-testid="quick-shape-dimension-trigger">{selectedItem.props?.dimension || 'Select...'}</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {sortedCategories.map(name => (
                <MenuItem key={name} onClick={() => handleTitleUpdate('dimension', name)} data-testid={`quick-shape-dim-${name}`}>
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <Text className={styles.label}>Show</Text>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button size="small" appearance="outline">{selectedItem.props?.metric || 'Select...'}</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {sortedMeasures.map(name => (
                <MenuItem key={name} onClick={() => handleTitleUpdate('metric', name)}>
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>

       <div className={styles.divider} />

       <div className={styles.group}>
         <Button icon={<ArrowSortDownRegular />} appearance="subtle" size="small" onClick={() => handleUpdate('sort', 'desc')} />
         <Button icon={<ArrowSortUpRegular />} appearance="subtle" size="small" onClick={() => handleUpdate('sort', 'asc')} />
         <Button icon={<TextAlignLeftRegular />} appearance="subtle" size="small" onClick={() => handleUpdate('sort', 'alpha')} />
       </div>
    </>
  );

  const renderLineControls = () => (
    <>
      <div className={styles.group}>
        <Text className={styles.label}>Grain</Text>
        <RadioGroup
            layout="horizontal"
            value={selectedItem.props?.timeGrain || 'month'}
            onChange={(_, data) => handleUpdate('timeGrain', data.value)}
        >
          <Radio value="month" label="Month" />
          <Radio value="quarter" label="Qtr" />
          <Radio value="year" label="Year" />
        </RadioGroup>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <Text className={styles.label}>Metric</Text>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button size="small" appearance="outline">{selectedItem.props?.metric || 'Select...'}</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {sortedMeasures.map(name => (
                <MenuItem key={name} onClick={() => handleTitleUpdate('metric', name)}>
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>

      {selectedItem.type === 'line' && (
        <>
          <div className={styles.divider} />
          <div className={styles.group}>
            <Text className={styles.label}>Compare</Text>
            <RadioGroup
                layout="horizontal"
                value={selectedItem.props?.comparison || 'both'}
                onChange={(_, data) => handleUpdate('comparison', data.value)}
            >
              <Radio value="none" label="None" />
              <Radio value="pl" label="PL" />
              <Radio value="py" label="PY" />
              <Radio value="both" label="Both" />
            </RadioGroup>
          </div>
        </>
      )}
    </>
  );

  const renderPieControls = () => (
    <>
      <div className={styles.group}>
        <Text className={styles.label}>Slices</Text>
        <RadioGroup
            layout="horizontal"
            value={String(selectedItem.props?.topN ?? 'All')}
            onChange={(_, data) => handleTitleUpdate('topN', data.value)}
        >
          <Radio value="3" label="3" />
          <Radio value="5" label="5" />
          <Radio value="6" label="6" />
          <Radio value="All" label="All" />
        </RadioGroup>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <Text className={styles.label}>By</Text>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button size="small" appearance="outline" data-testid="quick-shape-dimension-trigger">{selectedItem.props?.dimension || 'Select...'}</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {sortedCategories.map(name => (
                <MenuItem key={name} onClick={() => handleTitleUpdate('dimension', name)} data-testid={`quick-shape-dim-${name}`}>
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>

      <div className={styles.divider} />

      <div className={styles.group}>
        <Text className={styles.label}>Show</Text>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button size="small" appearance="outline">{selectedItem.props?.metric || 'Select...'}</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {sortedMeasures.map(name => (
                <MenuItem key={name} onClick={() => handleTitleUpdate('metric', name)}>
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </>
  );

  const renderCardControls = () => (
      <>
        <div className={styles.group}>
        <Text className={styles.label}>Measure</Text>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button size="small" appearance="outline">{selectedItem.props?.metric || 'Select...'}</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {sortedMeasures.map(name => (
                <MenuItem key={name} onClick={() => handleTitleUpdate('metric', name)}>
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
      <div className={styles.divider} />
      <div className={styles.group}>
        <Text className={styles.label}>Agg</Text>
        <RadioGroup
            layout="horizontal"
            value={selectedItem.props?.operation || 'sum'}
            onChange={(_, data) => handleUpdate('operation', data.value)}
        >
          <Radio value="sum" label="Sum" />
          <Radio value="avg" label="Avg" />
          <Radio value="count" label="Count" />
        </RadioGroup>
      </div>
      </>
  );

  const renderTableControls = () => (
    <>
      <div className={styles.group}>
        <Text className={styles.label}>Rows</Text>
        <RadioGroup
            layout="horizontal"
            value={String(selectedItem.props?.maxRows || 25)}
            onChange={(_, data) => handleUpdate('maxRows', data.value === 'All' ? 9999 : Number(data.value))}
        >
          <Radio value="10" label="10" />
          <Radio value="25" label="25" />
          <Radio value="50" label="50" />
          <Radio value="All" label="All" />
        </RadioGroup>
      </div>
    </>
  );

  const renderScatterControls = () => (
    <>
      <div className={styles.group}>
        <Text className={styles.label}>X</Text>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button size="small" appearance="outline">{selectedItem.props?.xMetric || 'Select...'}</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {sortedMeasures.map(name => (
                <MenuItem key={name} onClick={() => handleUpdate('xMetric', name)}>
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
      <div className={styles.divider} />
      <div className={styles.group}>
        <Text className={styles.label}>Y</Text>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button size="small" appearance="outline">{selectedItem.props?.yMetric || 'Select...'}</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {sortedMeasures.map(name => (
                <MenuItem key={name} onClick={() => handleUpdate('yMetric', name)}>
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </>
  );

  const renderSlicerControls = () => (
    <>
      <div className={styles.group}>
        <Text className={styles.label}>Field</Text>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button size="small" appearance="outline" data-testid="quick-shape-dimension-trigger">{selectedItem.props?.dimension || 'Select...'}</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {sortedCategories.map(name => (
                <MenuItem key={name} onClick={() => handleTitleUpdate('dimension', name)} data-testid={`quick-shape-dim-${name}`}>
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </>
  );

  const renderWaterfallControls = () => (
    <>
      <div className={styles.group}>
        <Text className={styles.label}>By</Text>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button size="small" appearance="outline" data-testid="quick-shape-dimension-trigger">{selectedItem.props?.dimension || 'Select...'}</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {sortedCategories.map(name => (
                <MenuItem key={name} onClick={() => handleTitleUpdate('dimension', name)} data-testid={`quick-shape-dim-${name}`}>
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
      <div className={styles.divider} />
      <div className={styles.group}>
        <Text className={styles.label}>Show</Text>
        <Menu>
          <MenuTrigger disableButtonEnhancement>
            <Button size="small" appearance="outline">{selectedItem.props?.metric || 'Select...'}</Button>
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {sortedMeasures.map(name => (
                <MenuItem key={name} onClick={() => handleTitleUpdate('metric', name)}>
                  {name}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </>
  );

  const renderControls = () => {
    if (BAR_TYPES.includes(selectedItem.type)) return renderBarControls();
    if (LINE_TYPES.includes(selectedItem.type)) return renderLineControls();
    if (PIE_TYPES.includes(selectedItem.type)) return renderPieControls();
    if (selectedItem.type === 'card') return renderCardControls();
    if (selectedItem.type === 'table') return renderTableControls();
    if (selectedItem.type === 'scatter') return renderScatterControls();
    if (selectedItem.type === 'slicer') return renderSlicerControls();
    if (selectedItem.type === 'waterfall') return renderWaterfallControls();
    return null;
  };

  return (
    <div
        className={styles.container}
        data-testid="quick-shape-strip"
        style={{
            top: `${top}px`,
            left: `${left}px`,
            width: 'max-content'
        }}
    >
        {renderControls()}
    </div>
  );
};
