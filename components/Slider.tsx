import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import SliderComponent from '@react-native-community/slider';

interface SliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
}

export function Slider({
  label,
  value,
  onValueChange,
  minimumValue = 1,
  maximumValue = 100,
  step = 1,
}: SliderProps) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
    },
    label: {
      fontSize: 16,
      color: theme.onSurface,
      marginBottom: 8,
    },
    slider: {
      width: '100%',
      height: 40,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <SliderComponent
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={theme.primary}
        maximumTrackTintColor={theme.outlineVariant}
        thumbTintColor={theme.primary}
      />
    </View>
  );
}