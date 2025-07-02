import React, { useImperativeHandle, RefObject, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, Pattern, Rect, Circle, Line, Path, G } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { DrawPath } from '@/app/note/[id]';
import { useCanvasGestures, CanvasTool } from './useCanvasGestures';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface CanvasRef {
  zoomIn: () => void;
  zoomOut: () => void;
}

interface InfiniteCanvasProps {
  template: 'blank' | 'dotted' | 'lined' | 'grid';
  paths: DrawPath[];
  onPathsChange: (paths: DrawPath[]) => void;
  currentTool: CanvasTool;
  color: string;
  strokeWidth: number;
  eraserSize: number;
  canvasRef: RefObject<CanvasRef>;
}

export function InfiniteCanvas({
  template,
  paths,
  onPathsChange,
  currentTool,
  color,
  strokeWidth,
  eraserSize,
  canvasRef,
}: InfiniteCanvasProps) {
  const { theme } = useTheme();
  const [eraserPreview, setEraserPreview] = useState<{ x: number; y: number } | null>(null);
  const gesture = useCanvasGestures(currentTool, onPathsChange, paths, eraserSize);

  useImperativeHandle(canvasRef, () => ({
    zoomIn: gesture.zoomIn,
    zoomOut: gesture.zoomOut,
  }));

  const onErase = (x: number, y: number) => {
    setEraserPreview({ x, y });
    gesture.onErase(x, y);
  };

  const renderTemplate = () => {
    const patternSize = 20;
    const strokeColor = theme.outlineVariant;
    switch (template) {
      case 'dotted':
        return (
          <Defs>
            <Pattern
              id="dotted"
              x="0"
              y="0"
              width={patternSize.toString()}
              height={patternSize.toString()}
              patternUnits="userSpaceOnUse"
            >
              <Circle cx={(patternSize / 2).toString()} cy={(patternSize / 2).toString()} r="1" fill={strokeColor} />
            </Pattern>
          </Defs>
        );
      case 'lined':
        return (
          <Defs>
            <Pattern
              id="lined"
              x="0"
              y="0"
              width={patternSize.toString()}
              height={patternSize.toString()}
              patternUnits="userSpaceOnUse"
            >
              <Line x1="0" y1={patternSize.toString()} x2={patternSize.toString()} y2={patternSize.toString()} stroke={strokeColor} strokeWidth="0.5" />
            </Pattern>
          </Defs>
        );
      case 'grid':
        return (
          <Defs>
            <Pattern
              id="grid"
              x="0"
              y="0"
              width={patternSize.toString()}
              height={patternSize.toString()}
              patternUnits="userSpaceOnUse"
            >
              <Line x1="0" y1="0" x2="0" y2={patternSize.toString()} stroke={strokeColor} strokeWidth="0.5" />
              <Line x1="0" y1="0" x2={patternSize.toString()} y2="0" stroke={strokeColor} strokeWidth="0.5" />
            </Pattern>
          </Defs>
        );
      default:
        return null;
    }
  };

  const getPatternFill = () => {
    if (template === 'blank') return 'transparent';
    return `url(#${template})`;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    svgContainer: {
      flex: 1,
    },
  });

  return (
    <View
      style={styles.container}
      {...gesture.panResponder.panHandlers}
      onResponderMove={(evt) => {
        if (currentTool === 'erase') {
          const { pageX, pageY } = evt.nativeEvent.touches[0];
          onErase(pageX, pageY);
        }
      }}
      onResponderRelease={() => {
        setEraserPreview(null);
      }}
    >
      <Svg
        width={screenWidth}
        height={screenHeight}
        style={styles.svgContainer}
      >
        <G
          transform={`translate(${gesture.translateX}, ${gesture.translateY}) scale(${gesture.scale})`}
        >
          {renderTemplate()}
          <Rect
            x={-10000}
            y={-10000}
            width={20000}
            height={20000}
            fill={getPatternFill()}
          />
          {paths.map((path) => (
            <Path
              key={path.id}
              d={path.d}
              stroke={path.color || color}
              strokeWidth={(path.strokeWidth || strokeWidth) / gesture.scale}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {gesture.isDrawing && gesture.currentPath && (
            <Path
              d={gesture.currentPath}
              stroke={color}
              strokeWidth={strokeWidth / gesture.scale}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {eraserPreview && currentTool === 'erase' && (
            <Circle
              cx={eraserPreview.x}
              cy={eraserPreview.y}
              r={eraserSize / 2 / gesture.scale}
              fill="rgba(255, 0, 0, 0.5)"
            />
          )}
        </G>
      </Svg>
    </View>
  );
} 