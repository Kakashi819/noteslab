import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function GestureTest() {
  const { theme } = useTheme();
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [debugInfo, setDebugInfo] = useState('');
  
  const initialDistance = useRef(0);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const lastScale = useRef(1);

  const calculateDistance = (touches: any[]) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const touches = evt.nativeEvent.touches;
      setDebugInfo(`Grant: ${touches.length} touches`);
      
      if (touches.length === 2) {
        initialDistance.current = calculateDistance(touches);
        lastTranslateX.current = translateX;
        lastTranslateY.current = translateY;
        lastScale.current = scale;
        setDebugInfo(`Grant: 2 touches, distance: ${initialDistance.current.toFixed(2)}`);
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      const touches = evt.nativeEvent.touches;
      
      if (touches.length === 2 && initialDistance.current > 0) {
        const currentDistance = calculateDistance(touches);
        const scaleFactor = currentDistance / initialDistance.current;
        const newScale = Math.min(Math.max(scale * scaleFactor, 0.1), 10);
        
        setScale(newScale);
        setDebugInfo(`Move: 2 touches, scale: ${newScale.toFixed(2)}`);
      } else if (touches.length === 1) {
        const { dx, dy } = gestureState;
        setTranslateX(lastTranslateX.current + dx);
        setTranslateY(lastTranslateY.current + dy);
        setDebugInfo(`Move: 1 touch, dx: ${dx.toFixed(2)}, dy: ${dy.toFixed(2)}`);
      }
    },
    onPanResponderRelease: (evt) => {
      const touches = evt.nativeEvent.touches;
      setDebugInfo(`Release: ${touches.length} touches`);
      initialDistance.current = 0;
    },
  });

  const reset = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
    setDebugInfo('Reset');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    testArea: {
      flex: 1,
      backgroundColor: theme.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      margin: 20,
      borderRadius: 12,
    },
    testText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.onSurface,
      textAlign: 'center',
    },
    debugInfo: {
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      backgroundColor: theme.surface,
      padding: 12,
      borderRadius: 8,
      fontSize: 12,
      color: theme.onSurface,
    },
    resetButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: theme.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    resetButtonText: {
      color: theme.onPrimary,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <Text style={styles.debugInfo}>
        {debugInfo}
        {'\n'}Scale: {scale.toFixed(2)}x
        {'\n'}Translate: ({translateX.toFixed(0)}, {translateY.toFixed(0)})
      </Text>
      
      <View style={[styles.testArea, {
        transform: [
          { translateX },
          { translateY },
          { scale },
        ],
      }]}>
        <Text style={styles.testText}>
          Pinch to zoom{'\n'}
          Drag to move{'\n'}
          Scale: {scale.toFixed(2)}x
        </Text>
      </View>
      
      <View style={styles.resetButton} onTouchEnd={reset}>
        <Text style={styles.resetButtonText}>Reset</Text>
      </View>
    </View>
  );
} 