import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface SimpleDrawingCanvasProps {
  onStrokeAdd?: () => void;
  onClear?: () => void;
}

export function SimpleDrawingCanvas({ onStrokeAdd, onClear }: SimpleDrawingCanvasProps) {
  const { theme } = useTheme();
  const [strokeCount, setStrokeCount] = useState(0);

  const handleAddStroke = () => {
    setStrokeCount(prev => prev + 1);
    onStrokeAdd?.();
  };

  const handleClear = () => {
    setStrokeCount(0);
    onClear?.();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 18,
      color: theme.onSurface,
      textAlign: 'center',
      marginBottom: 20,
    },
    controls: {
      position: 'absolute',
      right: 20,
      bottom: 100,
      flexDirection: 'row',
      gap: 10,
    },
    controlButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    controlText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.onSurface,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Simple Drawing Canvas</Text>
      <Text style={styles.text}>Strokes: {strokeCount}</Text>
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={handleAddStroke}>
          <Text style={styles.controlText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleClear}>
          <Text style={styles.controlText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 