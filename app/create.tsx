import React, { useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { SimpleDrawingCanvas } from '@/components/SimpleDrawingCanvas';

export default function CreateScreen() {
  const { theme } = useTheme();
  const [totalStrokes, setTotalStrokes] = useState(0);

  const handleStrokeAdd = () => {
    setTotalStrokes(prev => prev + 1);
  };

  const handleClear = () => {
    setTotalStrokes(0);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.outlineVariant,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.onSurface,
      textAlign: 'center',
    },
    infoText: {
      fontSize: 14,
      color: theme.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 4,
    },
    canvasContainer: {
      flex: 1,
      position: 'relative',
    },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Create Drawing',
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.onSurface,
        }}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Drawing Canvas</Text>
        <Text style={styles.infoText}>
          Total Strokes: {totalStrokes} • Tap + to add strokes
        </Text>
      </View>

      <View style={styles.canvasContainer}>
        <SimpleDrawingCanvas
          onStrokeAdd={handleStrokeAdd}
          onClear={handleClear}
        />
      </View>
    </View>
  );
} 