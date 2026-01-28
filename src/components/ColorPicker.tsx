import React from 'react';
import {
  makeStyles,
  shorthands,
  Dropdown,
  Option,
} from '@fluentui/react-components';
import { useThemeStore, PALETTES } from '../store/useThemeStore';

const useStyles = makeStyles({
  container: {
    ...shorthands.padding('12px'),
    borderBottom: '1px solid #E1DFDD',
  },
  header: {
    fontWeight: '600',
    fontSize: '12px',
    color: '#252423',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  swatches: {
    display: 'flex',
    gap: '4px',
    marginTop: '8px',
    flexWrap: 'wrap',
  },
  swatch: {
    width: '20px',
    height: '20px',
    ...shorthands.borderRadius('2px'),
    ...shorthands.border('1px', 'solid', 'rgba(0,0,0,0.1)'),
  },
  dropdown: {
    width: '100%',
    minWidth: 'unset',
  },
});

export const ColorPicker: React.FC = () => {
  const styles = useStyles();
  const { activePalette, setPalette } = useThemeStore();

  return (
    <div className={styles.container}>
      <div className={styles.header}>Theme</div>
      <Dropdown
        className={styles.dropdown}
        value={activePalette.name}
        selectedOptions={[activePalette.name]}
        onOptionSelect={(_, data) => {
          const palette = PALETTES.find((p) => p.name === data.optionValue);
          if (palette) setPalette(palette);
        }}
      >
        {PALETTES.map((palette) => (
          <Option key={palette.name} value={palette.name}>
            {palette.name}
          </Option>
        ))}
      </Dropdown>
      <div className={styles.swatches}>
        {activePalette.colors.slice(0, 8).map((color, i) => (
          <div
            key={i}
            className={styles.swatch}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};
