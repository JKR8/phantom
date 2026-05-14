import React from 'react';
import { makeStyles, shorthands } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'transparent',
    boxSizing: 'border-box',
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
    ...shorthands.overflow('hidden'),
  },
  text: {
    width: '100%',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  },
});

export interface TextBoxProps {
  /** Text content */
  text?: string;
  /** Font size in pixels */
  fontSize?: number;
  /** Font family */
  fontFamily?: string;
  /** Text color */
  fontColor?: string;
  /** Bold text */
  bold?: boolean;
  /** Text alignment */
  alignment?: 'left' | 'center' | 'right';
  /** Background color */
  backgroundColor?: string;
  /** Padding in pixels */
  padding?: number;
}

export const TextBox: React.FC<TextBoxProps> = ({
  text = 'Text Box',
  fontSize = 14,
  fontFamily = '"Segoe UI", sans-serif',
  fontColor = '#252423',
  bold = false,
  alignment = 'left',
  backgroundColor = 'transparent',
  padding = 8,
}) => {
  const styles = useStyles();

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor,
        padding: `${padding}px`,
        justifyContent: alignment === 'center' ? 'center' : alignment === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      <div
        className={styles.text}
        style={{
          fontSize: `${fontSize}px`,
          fontFamily,
          color: fontColor,
          fontWeight: bold ? 600 : 400,
          textAlign: alignment,
        }}
      >
        {text}
      </div>
    </div>
  );
};
