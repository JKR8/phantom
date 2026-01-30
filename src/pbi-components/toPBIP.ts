/**
 * Props to PBIP Converter
 *
 * Converts constrained PBI component props to PBIP visual.json object format.
 * This ensures the exported PBIP files have correctly formatted property values.
 */

import type {
  PBIBarChartProps,
  PBILineChartProps,
  PBICardProps,
  PBISlicerProps,
} from '../pbi-constraints';
import {
  makeLiteral,
  makeSolidColor,
  makeFontSize,
  makeFontFamily,
  makeDecimalLiteral,
  makeIntegerLiteral,
  MOKKUP_BRAND_COLORS,
} from '../pbi-constraints';

/**
 * Convert bar chart props to PBIP objects format
 */
export function barChartToPBIPObjects(props: PBIBarChartProps): Record<string, any> {
  const objects: Record<string, any> = {};

  // Title
  if (props.title) {
    objects.title = [{
      properties: {
        show: makeLiteral(props.title.show),
        ...(props.title.text && { text: makeLiteral(props.title.text) }),
        ...(props.title.fontFamily && { fontFamily: makeFontFamily(props.title.fontFamily) }),
        ...(props.title.fontSize && { fontSize: makeFontSize(props.title.fontSize) }),
        ...(props.title.fontColor && { fontColor: makeSolidColor(props.title.fontColor) }),
        ...(props.title.alignment && { alignment: makeLiteral(props.title.alignment) }),
      },
    }];
  }

  // Legend
  if (props.legend) {
    objects.legend = [{
      properties: {
        show: makeLiteral(props.legend.show),
        ...(props.legend.position && { position: makeLiteral(props.legend.position) }),
        ...(props.legend.fontSize && { fontSize: makeIntegerLiteral(props.legend.fontSize) }),
        ...(props.legend.fontColor && { fontColor: makeSolidColor(props.legend.fontColor) }),
        ...(props.legend.showTitle !== undefined && { showTitle: makeLiteral(props.legend.showTitle) }),
      },
    }];
  }

  // Category axis
  if (props.categoryAxis) {
    objects.categoryAxis = [{
      properties: {
        show: makeLiteral(props.categoryAxis.show),
        ...(props.categoryAxis.showAxisTitle !== undefined && { showAxisTitle: makeLiteral(props.categoryAxis.showAxisTitle) }),
        ...(props.categoryAxis.labelFontSize && { fontSize: makeIntegerLiteral(props.categoryAxis.labelFontSize) }),
        ...(props.categoryAxis.labelFontColor && { fontColor: makeSolidColor(props.categoryAxis.labelFontColor) }),
        ...(props.categoryAxis.innerPadding !== undefined && { innerPadding: makeIntegerLiteral(props.categoryAxis.innerPadding) }),
        ...(props.categoryAxis.preferredCategoryWidth !== undefined && { preferredCategoryWidth: makeDecimalLiteral(props.categoryAxis.preferredCategoryWidth) }),
      },
    }];
  }

  // Value axis
  if (props.valueAxis) {
    objects.valueAxis = [{
      properties: {
        show: makeLiteral(props.valueAxis.show),
        ...(props.valueAxis.showAxisTitle !== undefined && { showAxisTitle: makeLiteral(props.valueAxis.showAxisTitle) }),
        ...(props.valueAxis.gridlineShow !== undefined && { gridlineShow: makeLiteral(props.valueAxis.gridlineShow) }),
        ...(props.valueAxis.gridlineColor && { gridlineColor: makeSolidColor(props.valueAxis.gridlineColor) }),
        ...(props.valueAxis.gridlineStyle && { gridlineStyle: makeLiteral(props.valueAxis.gridlineStyle) }),
        ...(props.valueAxis.start !== undefined && { start: makeDecimalLiteral(props.valueAxis.start) }),
        ...(props.valueAxis.end !== undefined && { end: makeDecimalLiteral(props.valueAxis.end) }),
      },
    }];
  }

  // Data point
  if (props.dataPoint) {
    const dataPointProps: Record<string, any> = {};
    if (props.dataPoint.fill) {
      dataPointProps.fill = makeSolidColor(props.dataPoint.fill);
    }
    if (props.dataPoint.fillTransparency !== undefined) {
      dataPointProps.fillTransparency = makeDecimalLiteral(props.dataPoint.fillTransparency);
    }
    if (Object.keys(dataPointProps).length > 0) {
      objects.dataPoint = [{ properties: dataPointProps }];
    }
  }

  // Labels
  if (props.labels) {
    objects.labels = [{
      properties: {
        show: makeLiteral(props.labels.show),
        ...(props.labels.position && { labelPosition: makeLiteral(props.labels.position) }),
        ...(props.labels.fontSize && { fontSize: makeDecimalLiteral(props.labels.fontSize) }),
        ...(props.labels.fontColor && { fontColor: makeSolidColor(props.labels.fontColor) }),
        ...(props.labels.displayUnits !== undefined && { labelDisplayUnits: makeDecimalLiteral(props.labels.displayUnits) }),
        ...(props.labels.precision !== undefined && { labelPrecision: makeIntegerLiteral(props.labels.precision) }),
      },
    }];
  }

  return objects;
}

/**
 * Convert line chart props to PBIP objects format
 */
export function lineChartToPBIPObjects(props: PBILineChartProps): Record<string, any> {
  const objects: Record<string, any> = {};

  // Title
  if (props.title) {
    objects.title = [{
      properties: {
        show: makeLiteral(props.title.show),
        ...(props.title.text && { text: makeLiteral(props.title.text) }),
        ...(props.title.fontFamily && { fontFamily: makeFontFamily(props.title.fontFamily) }),
        ...(props.title.fontSize && { fontSize: makeFontSize(props.title.fontSize) }),
        ...(props.title.fontColor && { fontColor: makeSolidColor(props.title.fontColor) }),
        ...(props.title.alignment && { alignment: makeLiteral(props.title.alignment) }),
      },
    }];
  }

  // Legend
  if (props.legend) {
    objects.legend = [{
      properties: {
        show: makeLiteral(props.legend.show),
        ...(props.legend.position && { position: makeLiteral(props.legend.position) }),
      },
    }];
  }

  // Category axis
  if (props.categoryAxis) {
    objects.categoryAxis = [{
      properties: {
        show: makeLiteral(props.categoryAxis.show),
        ...(props.categoryAxis.showAxisTitle !== undefined && { showAxisTitle: makeLiteral(props.categoryAxis.showAxisTitle) }),
      },
    }];
  }

  // Value axis
  if (props.valueAxis) {
    objects.valueAxis = [{
      properties: {
        show: makeLiteral(props.valueAxis.show),
        ...(props.valueAxis.showAxisTitle !== undefined && { showAxisTitle: makeLiteral(props.valueAxis.showAxisTitle) }),
        ...(props.valueAxis.gridlineShow !== undefined && { gridlineShow: makeLiteral(props.valueAxis.gridlineShow) }),
        ...(props.valueAxis.gridlineStyle && { gridlineStyle: makeLiteral(props.valueAxis.gridlineStyle) }),
      },
    }];
  }

  // Line styles
  if (props.lineStyles) {
    objects.lineStyles = [{
      properties: {
        ...(props.lineStyles.lineStyle && { lineStyle: makeLiteral(props.lineStyles.lineStyle) }),
        ...(props.lineStyles.lineChartType && { lineChartType: makeLiteral(props.lineStyles.lineChartType) }),
        ...(props.lineStyles.strokeWidth && { strokeWidth: makeIntegerLiteral(props.lineStyles.strokeWidth) }),
        ...(props.lineStyles.showMarker !== undefined && { showMarker: makeLiteral(props.lineStyles.showMarker) }),
        ...(props.lineStyles.markerSize && { markerSize: makeDecimalLiteral(props.lineStyles.markerSize) }),
      },
    }];
  }

  // Data point
  if (props.dataPoint) {
    objects.dataPoint = [{
      properties: {
        ...(props.dataPoint.fill && { fill: makeSolidColor(props.dataPoint.fill) }),
      },
    }];
  }

  // Labels
  if (props.labels) {
    objects.labels = [{
      properties: {
        show: makeLiteral(props.labels.show),
      },
    }];
  }

  return objects;
}

/**
 * Convert card props to PBIP objects format
 */
export function cardToPBIPObjects(props: PBICardProps): Record<string, any> {
  const objects: Record<string, any> = {};

  // Callout area
  if (props.calloutAreaSize) {
    objects.calloutArea = [{
      properties: {
        size: makeDecimalLiteral(props.calloutAreaSize),
      },
    }];
  }

  // Callout value
  if (props.calloutValue) {
    objects.calloutValue = [{
      properties: {
        ...(props.calloutValue.fontFamily && { fontFamily: makeFontFamily(props.calloutValue.fontFamily) }),
        ...(props.calloutValue.fontSize && { fontSize: makeFontSize(props.calloutValue.fontSize) }),
        ...(props.calloutValue.fontColor && { fontColor: makeSolidColor(props.calloutValue.fontColor) }),
        ...(props.calloutValue.horizontalAlignment && { horizontalAlignment: makeLiteral(props.calloutValue.horizontalAlignment) }),
        ...(props.calloutValue.labelDisplayUnits !== undefined && { labelDisplayUnits: makeDecimalLiteral(props.calloutValue.labelDisplayUnits) }),
      },
    }];
  }

  // Callout label
  if (props.calloutLabel) {
    objects.calloutLabel = [{
      properties: {
        show: makeLiteral(props.calloutLabel.show),
        ...(props.calloutLabel.fontFamily && { fontFamily: makeFontFamily(props.calloutLabel.fontFamily) }),
        ...(props.calloutLabel.fontSize && { fontSize: makeFontSize(props.calloutLabel.fontSize) }),
        ...(props.calloutLabel.fontColor && { fontColor: makeSolidColor(props.calloutLabel.fontColor) }),
        ...(props.calloutLabel.position && { position: makeLiteral(props.calloutLabel.position) }),
      },
    }];
  }

  // Reference labels layout
  if (props.referenceLabelsLayout) {
    objects.referenceLabelsLayout = [{
      properties: {
        ...(props.referenceLabelsLayout.position && { position: makeLiteral(props.referenceLabelsLayout.position) }),
        ...(props.referenceLabelsLayout.layout && { layout: makeLiteral(props.referenceLabelsLayout.layout) }),
        ...(props.referenceLabelsLayout.spacing !== undefined && { spacing: makeDecimalLiteral(props.referenceLabelsLayout.spacing) }),
      },
    }];
  }

  // Divider
  if (props.divider) {
    objects.divider = [{
      properties: {
        show: makeLiteral(props.divider.show),
        ...(props.divider.color && { color: makeSolidColor(props.divider.color) }),
        ...(props.divider.width !== undefined && { width: makeDecimalLiteral(props.divider.width) }),
      },
    }];
  }

  // Card background
  if (props.cardBackground) {
    objects.cardBackground = [{
      properties: {
        show: makeLiteral(props.cardBackground.show),
        ...(props.cardBackground.color && { color: makeSolidColor(props.cardBackground.color) }),
      },
    }];
  }

  // Padding
  if (props.padding) {
    objects.padding = [{
      properties: {
        ...(props.padding.top !== undefined && { top: makeDecimalLiteral(props.padding.top) }),
        ...(props.padding.bottom !== undefined && { bottom: makeDecimalLiteral(props.padding.bottom) }),
        ...(props.padding.left !== undefined && { left: makeDecimalLiteral(props.padding.left) }),
        ...(props.padding.right !== undefined && { right: makeDecimalLiteral(props.padding.right) }),
      },
    }];
  }

  return objects;
}

/**
 * Convert card props to visual container objects (for border/accent bar)
 */
export function cardToVisualContainerObjects(props: PBICardProps): Record<string, any> {
  const objects: Record<string, any> = {
    title: [{
      properties: {
        show: makeLiteral(false),
      },
    }],
  };

  // Accent bar via left border
  if (props.accentColor) {
    objects.border = [{
      properties: {
        show: makeLiteral(true),
        color: makeSolidColor(props.accentColor),
        radius: makeDecimalLiteral(2),
        width: makeDecimalLiteral(4),
        topWidth: makeDecimalLiteral(0),
        rightWidth: makeDecimalLiteral(0),
        bottomWidth: makeDecimalLiteral(0),
        leftWidth: makeDecimalLiteral(4),
      },
    }];
  }

  // Background
  objects.background = [{
    properties: {
      show: makeLiteral(true),
      color: makeSolidColor(props.cardBackground?.color || MOKKUP_BRAND_COLORS.background),
      transparency: makeDecimalLiteral(0),
    },
  }];

  // Visual header
  objects.visualHeader = [{
    properties: {
      show: makeLiteral(false),
    },
  }];

  return objects;
}

/**
 * Convert slicer props to PBIP objects format
 */
export function slicerToPBIPObjects(props: PBISlicerProps): Record<string, any> {
  const objects: Record<string, any> = {};

  // Title
  if (props.title) {
    objects.title = [{
      properties: {
        show: makeLiteral(props.title.show),
      },
    }];
  }

  // Data (mode)
  if (props.data) {
    objects.data = [{
      properties: {
        mode: makeLiteral(props.data.mode),
      },
    }];
  }

  // Header
  if (props.header) {
    objects.header = [{
      properties: {
        show: makeLiteral(props.header.show),
      },
    }];
  }

  // Selection
  if (props.selection) {
    objects.selection = [{
      properties: {
        ...(props.selection.strictSingleSelect !== undefined && { strictSingleSelect: makeLiteral(props.selection.strictSingleSelect) }),
      },
    }];
  }

  // Items
  if (props.items) {
    objects.items = [{
      properties: {
        ...(props.items.backgroundColor && { background: makeSolidColor(props.items.backgroundColor) }),
        ...(props.items.fontColor && { fontColor: makeSolidColor(props.items.fontColor) }),
        ...(props.items.fontSize && { textSize: makeDecimalLiteral(props.items.fontSize) }),
      },
    }];
  }

  return objects;
}
