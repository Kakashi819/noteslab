import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface DrawingTool {
  color: string;
  strokeWidth: number;
  mode: 'draw' | 'erase' | 'pan';
}

interface DrawingToolsProps {
  currentTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClear: () => void;
  onSave: () => void;
}

const COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#008000', // Dark Green
  '#800000', // Maroon
  '#000080', // Navy
];

const BRUSH_SIZES = [2, 4, 6, 8, 12, 16, 20, 24];

export function DrawingTools({
  currentTool,
  onToolChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onClear,
  onSave,
}: DrawingToolsProps) {
  const { theme } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBrushSizes, setShowBrushSizes] = useState(false);

  const handleColorSelect = useCallback((color: string) => {
    onToolChange({ ...currentTool, color });
    setShowColorPicker(false);
  }, [currentTool, onToolChange]);

  const handleBrushSizeSelect = useCallback((strokeWidth: number) => {
    onToolChange({ ...currentTool, strokeWidth });
    setShowBrushSizes(false);
  }, [currentTool, onToolChange]);

  const handleModeToggle = useCallback(() => {
    const modes: ('draw' | 'erase' | 'pan')[] = ['draw', 'erase', 'pan'];
    const currentIndex = modes.indexOf(currentTool.mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onToolChange({ ...currentTool, mode: modes[nextIndex] });
  }, [currentTool, onToolChange]);

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      left: 20,
      top: 100,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 12,
      elevation: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    toolSection: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.onSurface,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    colorButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: theme.outline,
    },
    colorButtonSelected: {
      borderColor: theme.primary,
      borderWidth: 3,
    },
    brushSizeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    brushSizeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.background,
      borderWidth: 2,
      borderColor: theme.outline,
      justifyContent: 'center',
      alignItems: 'center',
    },
    brushSizeButtonSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.primary,
    },
    brushSizeIndicator: {
      backgroundColor: theme.onSurface,
      borderRadius: 50,
    },
    actionButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.background,
      borderWidth: 2,
      borderColor: theme.outline,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    actionButtonActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primary,
    },
    actionButtonDisabled: {
      opacity: 0.5,
    },
    actionButtonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.onSurface,
    },
    actionButtonTextActive: {
      color: theme.onPrimary,
    },
    modeToggle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: currentTool.mode === 'erase' ? theme.error : currentTool.mode === 'pan' ? theme.secondary : theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    modeToggleText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.onPrimary,
    },
    currentColor: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 3,
      borderColor: theme.outline,
      marginBottom: 8,
    },
    currentBrushSize: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.background,
      borderWidth: 2,
      borderColor: theme.outline,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
  });

  return (
    <View style={styles.container}>
      {/* Current Color Display */}
      <TouchableOpacity
        style={[styles.currentColor, { backgroundColor: currentTool.color }]}
        onPress={() => setShowColorPicker(!showColorPicker)}
      />

      {/* Color Picker */}
      {showColorPicker && (
        <View style={styles.toolSection}>
          <Text style={styles.sectionTitle}>Colors</Text>
          <View style={styles.colorGrid}>
            {COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  { backgroundColor: color },
                  currentTool.color === color && styles.colorButtonSelected,
                ]}
                onPress={() => handleColorSelect(color)}
              />
            ))}
          </View>
        </View>
      )}

      {/* Current Brush Size Display */}
      <TouchableOpacity
        style={styles.currentBrushSize}
        onPress={() => setShowBrushSizes(!showBrushSizes)}
      >
        <View
          style={[
            styles.brushSizeIndicator,
            {
              width: currentTool.strokeWidth,
              height: currentTool.strokeWidth,
            },
          ]}
        />
      </TouchableOpacity>

      {/* Brush Size Picker */}
      {showBrushSizes && (
        <View style={styles.toolSection}>
          <Text style={styles.sectionTitle}>Brush Size</Text>
          <View style={styles.brushSizeGrid}>
            {BRUSH_SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.brushSizeButton,
                  currentTool.strokeWidth === size && styles.brushSizeButtonSelected,
                ]}
                onPress={() => handleBrushSizeSelect(size)}
              >
                <View
                  style={[
                    styles.brushSizeIndicator,
                    {
                      width: size,
                      height: size,
                      backgroundColor: currentTool.strokeWidth === size 
                        ? theme.onPrimary 
                        : theme.onSurface,
                    },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Mode Toggle (Draw/Erase/Pan) */}
      <TouchableOpacity style={styles.modeToggle} onPress={handleModeToggle}>
        <Text style={styles.modeToggleText}>
          {currentTool.mode === 'draw' ? '✏️' : currentTool.mode === 'erase' ? '🧽' : '✋'}
        </Text>
      </TouchableOpacity>

      {/* Action Buttons */}
      <TouchableOpacity
        style={[styles.actionButton, !canUndo && styles.actionButtonDisabled]}
        onPress={onUndo}
        disabled={!canUndo}
      >
        <Text style={styles.actionButtonText}>↶</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, !canRedo && styles.actionButtonDisabled]}
        onPress={onRedo}
        disabled={!canRedo}
      >
        <Text style={styles.actionButtonText}>↷</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onClear}>
        <Text style={styles.actionButtonText}>🗑️</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionButton} onPress={onSave}>
        <Text style={styles.actionButtonText}>💾</Text>
      </TouchableOpacity>
    </View>
  );
}