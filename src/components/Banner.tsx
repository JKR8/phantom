import React from 'react';
import { makeStyles, shorthands } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
    fontFamily: '"Segoe UI", "Segoe UI Web (West European)", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
    ...shorthands.overflow('hidden'),
  },
  // Thin line style (default) - transparent with thin colored bottom border
  thinLine: {
    backgroundColor: 'transparent',
    borderBottom: '2px solid #0078D4',
  },
  // Subtle background style
  subtleBackground: {
    backgroundColor: 'rgba(0, 120, 212, 0.05)',
    borderBottom: '1px solid rgba(0, 120, 212, 0.2)',
  },
  // Gradient style
  gradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  // Filled style (legacy)
  filled: {
    // Uses backgroundColor from props
  },
  logoContainer: {
    marginRight: '16px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 700,
    ...shorthands.borderRadius('4px'),
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    minWidth: 0,
    flex: 1,
  },
  title: {
    fontWeight: 600,
    letterSpacing: '-0.3px',
    lineHeight: 1.2,
    ...shorthands.overflow('hidden'),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  subtitle: {
    opacity: 0.7,
    lineHeight: 1.3,
    ...shorthands.overflow('hidden'),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: 400,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
  },
});

export type BannerVariant = 'thinLine' | 'subtle' | 'gradient' | 'filled';

export interface BannerProps {
  /** Banner title */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
  /** Banner visual style variant */
  variant?: BannerVariant;
  /** Accent color for thin line and logo */
  accentColor?: string;
  /** Background color (used only with 'filled' variant) */
  backgroundColor?: string;
  /** Text color */
  fontColor?: string;
  /** Title font size */
  titleFontSize?: number;
  /** Subtitle font size */
  subtitleFontSize?: number;
  /** Vertical padding */
  paddingY?: number;
  /** Horizontal padding */
  paddingX?: number;
  /** Show logo/icon placeholder */
  showLogo?: boolean;
  /** Show left accent bar */
  showAccentBar?: boolean;
}

export const Banner: React.FC<BannerProps> = ({
  title = 'Report Title',
  subtitle,
  variant = 'thinLine',
  accentColor = '#0078D4',
  backgroundColor = '#0078D4',
  fontColor,
  titleFontSize = 20,
  subtitleFontSize = 12,
  paddingY = 12,
  paddingX = 20,
  showLogo = false,
  showAccentBar = false,
}) => {
  const styles = useStyles();

  // Determine text color based on variant
  const getTextColor = () => {
    if (fontColor) return fontColor;
    switch (variant) {
      case 'filled':
      case 'gradient':
        return '#FFFFFF';
      case 'thinLine':
      case 'subtle':
      default:
        return '#323130'; // Dark text for transparent variants
    }
  };

  // Get variant-specific styles
  const getVariantStyle = (): React.CSSProperties => {
    switch (variant) {
      case 'thinLine':
        return {
          backgroundColor: 'transparent',
          borderBottom: `2px solid ${accentColor}`,
        };
      case 'subtle':
        return {
          backgroundColor: `${accentColor}08`,
          borderBottom: `1px solid ${accentColor}20`,
        };
      case 'gradient':
        return {
          background: `linear-gradient(90deg, ${accentColor} 0%, ${accentColor}99 100%)`,
        };
      case 'filled':
        return {
          backgroundColor,
        };
      default:
        return {};
    }
  };

  const textColor = getTextColor();
  const subtitleColor = variant === 'filled' || variant === 'gradient'
    ? 'rgba(255,255,255,0.85)'
    : '#605E5C';

  return (
    <div
      className={styles.container}
      style={{
        ...getVariantStyle(),
        padding: `${paddingY}px ${paddingX}px`,
        position: 'relative',
      }}
    >
      {showAccentBar && (
        <div
          className={styles.accentBar}
          style={{ backgroundColor: accentColor }}
        />
      )}
      {showLogo && (
        <div className={styles.logoContainer}>
          <div
            className={styles.logo}
            style={{
              backgroundColor: variant === 'thinLine' || variant === 'subtle'
                ? accentColor
                : 'rgba(255,255,255,0.2)',
              color: variant === 'thinLine' || variant === 'subtle'
                ? '#FFFFFF'
                : textColor,
            }}
          >
            {title?.charAt(0)?.toUpperCase() || 'R'}
          </div>
        </div>
      )}
      <div className={styles.textContainer}>
        <div
          className={styles.title}
          style={{
            color: textColor,
            fontSize: `${titleFontSize}px`,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            className={styles.subtitle}
            style={{
              color: fontColor ? fontColor : subtitleColor,
              fontSize: `${subtitleFontSize}px`,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
