import React, { useCallback, useRef, useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import {
  Canvas,
  Path,
  SkPath,
  Skia,
  TouchInfo,
  useTouchHandler,
  Group,
  Paint,
  PaintStyle,
  StrokeCap,
  StrokeJoin,
  vec,
  SkPoint,
} from '@shopify/react-native-skia';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface DrawingStroke {
  id: string;
  path: SkPath;
  color: string;
  strokeWidth: number;
  points: SkPoint[];
  smoothedPoints: SkPoint[];
  timestamp: number;
}

export interface DrawingCanvasProps {
  strokes: DrawingStroke[];
  onStrokesChange: (strokes: DrawingStroke[]) => void;
  currentTool: {
    color: string;
    strokeWidth: number;
    mode: 'draw' | 'erase';
  };
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

// Utility functions for path smoothing and manipulation
const createSmoothPath = (points: SkPoint[], tension: number = 0.3): SkPath => {
  if (points.length < 2) return Skia.Path.Make();

  const path = Skia.Path.Make();
  path.moveTo(points[0].x, points[0].y);

  if (points.length === 2) {
    path.lineTo(points[1].x, points[1].y);
    return path;
  }

  // Catmull-Rom spline smoothing
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const current = points[i];
    const next = points[i + 1];

    const cp1x = current.x + (next.x - prev.x) * tension;
    const cp1y = current.y + (next.y - prev.y) * tension;
    const cp2x = next.x - (next.x - current.x) * tension;
    const cp2y = next.y - (next.y - current.y) * tension;

    path.cubicTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
  }

  return path;
};

const simplifyPoints = (points: SkPoint[], tolerance: number = 2): SkPoint[] => {
  if (points.length <= 2) return points;

  const simplified: SkPoint[] = [points[0]];
  let lastPoint = points[0];

  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i];
    const distance = Math.sqrt(
      Math.pow(current.x - lastPoint.x, 2) + Math.pow(current.y - lastPoint.y, 2)
    );

    if (distance > tolerance) {
      simplified.push(current);
      lastPoint = current;
    }
  }

  simplified.push(points[points.length - 1]);
  return simplified;
};

export function AdvancedDrawingCanvas({
  strokes,
  onStrokesChange,
  currentTool,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: DrawingCanvasProps) {
  const { theme } = useTheme();
  
  // Canvas state
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingStroke | null>(null);
  const [currentPoints, setCurrentPoints] = useState<SkPoint[]>([]);
  
  // Refs for gesture handling
  const strokeIdRef = useRef(0);
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);

  // Generate unique stroke ID
  const generateStrokeId = useCallback(() => {
    strokeIdRef.current += 1;
    return `stroke_${strokeIdRef.current}_${Date.now()}`;
  }, []);

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const canvasX = (screenX - translateX.value) / scale.value;
    const canvasY = (screenY - translateY.value) / scale.value;
    return vec(canvasX, canvasY);
  }, [translateX, translateY, scale]);

  // Create a new stroke
  const startStroke = useCallback((point: SkPoint) => {
    const newStroke: DrawingStroke = {
      id: generateStrokeId(),
      path: Skia.Path.Make(),
      color: currentTool.color,
      strokeWidth: currentTool.strokeWidth,
      points: [point],
      smoothedPoints: [point],
      timestamp: Date.now(),
    };

    setCurrentStroke(newStroke);
    setCurrentPoints([point]);
    setIsDrawing(true);
  }, [currentTool, generateStrokeId]);

  // Update current stroke
  const updateStroke = useCallback((point: SkPoint) => {
    if (!currentStroke) return;

    const newPoints = [...currentPoints, point];
    setCurrentPoints(newPoints);

    // Simplify points for performance
    const simplifiedPoints = simplifyPoints(newPoints);
    
    // Create smoothed path
    const smoothedPath = createSmoothPath(simplifiedPoints);
    
    const updatedStroke: DrawingStroke = {
      ...currentStroke,
      path: smoothedPath,
      points: newPoints,
      smoothedPoints: simplifiedPoints,
    };

    setCurrentStroke(updatedStroke);
  }, [currentStroke, currentPoints]);

  // Finish current stroke
  const finishStroke = useCallback(() => {
    if (!currentStroke) return;

    const finalStroke = {
      ...currentStroke,
      points: currentPoints,
      smoothedPoints: simplifyPoints(currentPoints),
    };

    // Add stroke to the list
    onStrokesChange([...strokes, finalStroke]);

    // Reset state
    setCurrentStroke(null);
    setCurrentPoints([]);
    setIsDrawing(false);
  }, [currentStroke, currentPoints, strokes, onStrokesChange]);

  // Drawing gesture
  const drawingGesture = useMemo(() =>
    Gesture.Pan()
      .minDistance(1)
      .onStart((event) => {
        'worklet';
        if (currentTool.mode === 'draw') {
          const point = screenToCanvas(event.x, event.y);
          runOnJS(startStroke)(point);
        }
      })
      .onUpdate((event) => {
        'worklet';
        if (currentTool.mode === 'draw' && isDrawing) {
          const point = screenToCanvas(event.x, event.y);
          runOnJS(updateStroke)(point);
        }
      })
      .onEnd(() => {
        'worklet';
        if (currentTool.mode === 'draw') {
          runOnJS(finishStroke)();
        }
      }),
    [currentTool.mode, isDrawing, screenToCanvas, startStroke, updateStroke, finishStroke]
  );

  // Canvas navigation gesture
  const navigationGesture = useMemo(() =>
    Gesture.Pan()
      .minDistance(10)
      .onStart(() => {
        'worklet';
        lastTranslateX.current = translateX.value;
        lastTranslateY.current = translateY.value;
      })
      .onUpdate((event) => {
        'worklet';
        if (!isDrawing) {
          translateX.value = lastTranslateX.current + event.translationX;
          translateY.value = lastTranslateY.current + event.translationY;
        }
      }),
    [isDrawing, translateX, translateY]
  );

  // Pinch gesture for zoom
  const pinchGesture = useMemo(() =>
    Gesture.Pinch()
      .onStart(() => {
        'worklet';
        lastScale.current = scale.value;
      })
      .onUpdate((event) => {
        'worklet';
        const newScale = Math.min(Math.max(lastScale.current * event.scale, 0.1), 10);
        scale.value = newScale;
      }),
    [scale]
  );

  // Combine gestures
  const composedGesture = useMemo(() =>
    Gesture.Race(
      Gesture.Simultaneous(pinchGesture, navigationGesture),
      drawingGesture
    ),
    [pinchGesture, navigationGesture, drawingGesture]
  );

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  // Paint for drawing
  const paint = useMemo(() => {
    const p = Skia.Paint();
    p.setStyle(PaintStyle.Stroke);
    p.setStrokeCap(StrokeCap.Round);
    p.setStrokeJoin(StrokeJoin.Round);
    p.setAntiAlias(true);
    return p;
  }, []);

  // Touch handler for additional touch events
  const touchHandler = useTouchHandler({
    onStart: (touchInfo: TouchInfo) => {
      if (currentTool.mode === 'draw') {
        const point = screenToCanvas(touchInfo.x, touchInfo.y);
        startStroke(point);
      }
    },
    onActive: (touchInfo: TouchInfo) => {
      if (currentTool.mode === 'draw' && isDrawing) {
        const point = screenToCanvas(touchInfo.x, touchInfo.y);
        updateStroke(point);
      }
    },
    onEnd: () => {
      if (currentTool.mode === 'draw') {
        finishStroke();
      }
    },
  });

  // Reset zoom and pan
  const resetView = useCallback(() => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    scale.value = withSpring(1);
  }, [translateX, translateY, scale]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    canvas: {
      flex: 1,
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
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.canvas, animatedStyle]}>
          <Canvas style={StyleSheet.absoluteFill} onTouch={touchHandler}>
            <Group>
              {/* Render all completed strokes */}
              {strokes.map((stroke) => (
                <Path
                  key={stroke.id}
                  path={stroke.path}
                  paint={paint}
                  color={stroke.color}
                  strokeWidth={stroke.strokeWidth}
                />
              ))}
              
              {/* Render current stroke */}
              {currentStroke && (
                <Path
                  path={currentStroke.path}
                  paint={paint}
                  color={currentStroke.color}
                  strokeWidth={currentStroke.strokeWidth}
                />
              )}
            </Group>
          </Canvas>
        </Animated.View>
      </GestureDetector>

      {/* Control buttons */}
      <View style={styles.controls}>
        <View style={styles.controlButton} onTouchEnd={onUndo}>
          <Text style={[styles.controlText, { opacity: canUndo ? 1 : 0.5 }]}>↶</Text>
        </View>
        <View style={styles.controlButton} onTouchEnd={onRedo}>
          <Text style={[styles.controlText, { opacity: canRedo ? 1 : 0.5 }]}>↷</Text>
        </View>
        <View style={styles.controlButton} onTouchEnd={resetView}>
          <Text style={styles.controlText}>⌂</Text>
        </View>
      </View>
    </GestureHandlerRootView>
  );
} 