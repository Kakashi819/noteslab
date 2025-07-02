import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Pen, Eraser, Move, ZoomIn, ZoomOut } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Slider } from './Slider';

export type Tool = 'draw' | 'erase' | 'pan';

interface ToolbarProps {
  currentTool: Tool;
  onToolChange: (tool: Tool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  color: string;
  onColorChange: (color: string) => void;
  strokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  eraserSize: number;
  onEraserSizeChange: (size: number) => void;
}

const COLORS = ['#000000', '#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FFFFFF'];

export function Toolbar({
  currentTool,
  onToolChange,
  onZoomIn,
  onZoomOut,
  color,
  onColorChange,
  strokeWidth,
  onStrokeWidthChange,
  eraserSize,
  onEraserSizeChange,
}: ToolbarProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.outlineVariant,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginBottom: 12,
    },
    toolButton: {
      padding: 8,
      borderRadius: 8,
    },
    activeTool: {
      backgroundColor: theme.primaryContainer,
    },
    colorButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    activeColor: {
      borderColor: theme.primary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.toolButton, currentTool === 'draw' && styles.activeTool]}
          onPress={() => onToolChange('draw')}
        >
          <Pen size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolButton, currentTool === 'erase' && styles.activeTool]}
          onPress={() => onToolChange('erase')}
        >
          <Eraser size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolButton, currentTool === 'pan' && styles.activeTool]}
          onPress={() => onToolChange('pan')}
        >
          <Move size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={onZoomIn}>
          <ZoomIn size={24} color={theme.onSurface} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={onZoomOut}>
          <ZoomOut size={24} color={theme.onSurface} />
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c}
            style={[
              styles.colorButton,
              { backgroundColor: c },
              color === c && styles.activeColor,
            ]}
            onPress={() => onColorChange(c)}
          />
        ))}
      </View>
      {currentTool === 'draw' && (
        <Slider
          label="Stroke Width"
          value={strokeWidth}
          onValueChange={onStrokeWidthChange}
          minimumValue={1}
          maximumValue={20}
          step={1}
        />
      )}
      {currentTool === 'erase' && (
        <Slider
          label="Eraser Size"
          value={eraserSize}
          onValueChange={onEraserSizeChange}
          minimumValue={10}
          maximumValue={100}
          step={5}
        />
      )}
    </View>
  );
}