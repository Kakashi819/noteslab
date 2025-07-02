import React, { useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions, Text, PanResponder } from 'react-native';
import Svg, { Defs, Pattern, Rect, Circle, Line, Path, G } from 'react-native-svg';
import { useTheme } from '@/contexts/ThemeContext';
import { DrawPath } from '@/app/note/[id]';

interface InfiniteCanvasProps {
  template: 'blank' | 'dotted' | 'lined' | 'grid';
  paths: DrawPath[];
  onPathsChange: (paths: DrawPath[]) => void;
  currentTool: {
    color: string;
    strokeWidth: number;
    mode: 'draw' | 'erase' | 'pan';
    eraserSize?: number;
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function InfiniteCanvas({ template, paths, onPathsChange, currentTool }: InfiniteCanvasProps) {
  const { theme } = useTheme();
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const pathIdRef = useRef(0);
  
  // Gesture state refs
  const lastTouch = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const isZooming = useRef(false);
  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });
  const initialDistance = useRef(0);
  const zoomCenter = useRef({ x: 0, y: 0 });

  // Utility: get visible bounds in canvas coordinates
  const getVisibleBounds = () => {
    const left = (-translate.x) / scale;
    const top = (-translate.y) / scale;
    const right = (screenWidth - translate.x) / scale;
    const bottom = (screenHeight - translate.y) / scale;
    return { left, top, right, bottom };
  };

  // Utility: screen to canvas coordinates
  const screenToCanvas = (screenX: number, screenY: number) => {
    return {
      x: (screenX - translate.x) / scale,
      y: (screenY - translate.y) / scale,
    };
  };

  // Utility: canvas to screen coordinates
  const canvasToScreen = (canvasX: number, canvasY: number) => {
    return {
      x: canvasX * scale + translate.x,
      y: canvasY * scale + translate.y,
    };
  };

  // Grid rendering
  const renderGrid = () => {
    const { left, top, right, bottom } = getVisibleBounds();
    const gridSpacing = template === 'dotted' ? 40 : template === 'lined' ? 40 : 40;
    const lines: React.ReactNode[] = [];
    const dots: React.ReactNode[] = [];
    const color = theme.outlineVariant;

    // Vertical lines
    if (template === 'grid' || template === 'lined') {
      const startX = Math.floor(left / gridSpacing) * gridSpacing;
      for (let x = startX; x < right; x += gridSpacing) {
        lines.push(
          <Line
            key={`v-${x}`}
            x1={x}
            y1={top}
            x2={x}
            y2={bottom}
            stroke={color}
            strokeWidth={0.5 / scale}
          />
        );
      }
    }
    // Horizontal lines
    if (template === 'grid' || template === 'lined') {
      const startY = Math.floor(top / gridSpacing) * gridSpacing;
      for (let y = startY; y < bottom; y += gridSpacing) {
        lines.push(
          <Line
            key={`h-${y}`}
            x1={left}
            y1={y}
            x2={right}
            y2={y}
            stroke={color}
            strokeWidth={0.5 / scale}
          />
        );
      }
    }
    // Dots
    if (template === 'dotted') {
      const startX = Math.floor(left / gridSpacing) * gridSpacing;
      const startY = Math.floor(top / gridSpacing) * gridSpacing;
      for (let x = startX; x < right; x += gridSpacing) {
        for (let y = startY; y < bottom; y += gridSpacing) {
          dots.push(
            <Circle
              key={`d-${x}-${y}`}
              cx={x}
              cy={y}
              r={1.5 / scale}
              fill={color}
            />
          );
        }
      }
    }
    return <>{lines}{dots}</>;
  };

  // PanResponder for gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length === 1) {
        lastTouch.current = { x: touches[0].pageX, y: touches[0].pageY };
        if (currentTool.mode === 'draw') {
          setIsDrawing(true);
          const coords = screenToCanvas(touches[0].pageX, touches[0].pageY);
          setCurrentPath(`M${coords.x.toFixed(1)},${coords.y.toFixed(1)}`);
        } else if (currentTool.mode === 'pan') {
          isPanning.current = true;
          lastTranslate.current = { ...translate };
        } else if (currentTool.mode === 'erase') {
          // Eraser preview handled in render
        }
      } else if (touches.length === 2) {
        isZooming.current = true;
        const [a, b] = touches;
        initialDistance.current = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
        lastScale.current = scale;
        zoomCenter.current = {
          x: (a.pageX + b.pageX) / 2,
          y: (a.pageY + b.pageY) / 2,
        };
        lastTranslate.current = { ...translate };
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      const touches = evt.nativeEvent.touches;
      if (touches.length === 1) {
        if (isDrawing && currentTool.mode === 'draw') {
          const coords = screenToCanvas(touches[0].pageX, touches[0].pageY);
          setCurrentPath((prev) => prev ? `${prev} L${coords.x.toFixed(1)},${coords.y.toFixed(1)}` : `M${coords.x.toFixed(1)},${coords.y.toFixed(1)}`);
        } else if (isPanning.current || currentTool.mode === 'pan') {
          const dx = touches[0].pageX - lastTouch.current.x;
          const dy = touches[0].pageY - lastTouch.current.y;
          setTranslate({
            x: lastTranslate.current.x + dx,
            y: lastTranslate.current.y + dy,
          });
        } else if (currentTool.mode === 'erase') {
          // Eraser logic (to be implemented in next step)
        }
      } else if (touches.length === 2 && isZooming.current) {
        const [a, b] = touches;
        const newDistance = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
        let newScale = lastScale.current * (newDistance / initialDistance.current);
        // Clamp and slow down zoom
        newScale = Math.max(0.2, Math.min(10, newScale));
        // Make zoom slower
        newScale = lastScale.current + (newScale - lastScale.current) * 0.2;
        // Keep zoom center fixed
        const center = zoomCenter.current;
        const canvasCenter = screenToCanvas(center.x, center.y);
        setScale(newScale);
        setTranslate({
          x: center.x - canvasCenter.x * newScale,
          y: center.y - canvasCenter.y * newScale,
        });
      }
    },
    onPanResponderRelease: (evt) => {
      if (isDrawing && currentTool.mode === 'draw' && currentPath) {
        // Add path
        pathIdRef.current += 1;
        onPathsChange([
          ...paths,
          {
            id: `path_${pathIdRef.current}_${Date.now()}`,
            d: currentPath,
            color: currentTool.color,
            strokeWidth: currentTool.strokeWidth,
          },
        ]);
      }
      setIsDrawing(false);
      setCurrentPath('');
      isPanning.current = false;
      isZooming.current = false;
    },
    onPanResponderTerminate: () => {
      setIsDrawing(false);
      setCurrentPath('');
      isPanning.current = false;
      isZooming.current = false;
    },
  });

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
    canvas: {
      flex: 1,
    },
    svgContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: screenWidth,
      height: screenHeight,
    },
    zoomControls: {
      position: 'absolute',
      right: 20,
      bottom: 100,
      flexDirection: 'row',
      gap: 10,
    },
    zoomButton: {
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
    zoomText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.onSurface,
    },
    infoText: {
      position: 'absolute',
      top: 20,
      left: 20,
      backgroundColor: theme.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      fontSize: 12,
      color: theme.onSurfaceVariant,
    },
  });

  // Simplified viewBox calculation for better symmetry
  const viewBox = `0 0 ${screenWidth} ${screenHeight}`;

  return (
    <View style={styles.container}>
      <View style={styles.canvas} {...panResponder.panHandlers}>
        {(() => {
          try {
            return (
              <Svg 
                width={screenWidth.toString()} 
                height={screenHeight.toString()} 
                style={styles.svgContainer}
                viewBox={viewBox}
                preserveAspectRatio="none"
              >
                {/* Apply transform to the entire canvas */}
                <G
                  transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}
                >
                  {renderTemplate()}
                  
                  {/* Background with pattern */}
                  <Rect
                    width={screenWidth}
                    height={screenHeight}
                    fill={getPatternFill()}
                  />
                  
                  {/* Existing paths */}
                  {paths.map((path) => {
                    // Validate path data before rendering
                    if (!path.d || typeof path.d !== 'string' || path.d.trim() === '') {
                      return null;
                    }
                    return (
                      <Path
                        key={path.id}
                        d={path.d}
                        stroke={path.color || '#000000'}
                        strokeWidth={path.strokeWidth ? path.strokeWidth.toString() : '2'}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  })}
                  
                  {/* Current drawing path - only show when drawing */}
                  {currentPath && currentTool.mode === 'draw' && typeof currentPath === 'string' && currentPath.trim() !== '' && (
                    <Path
                      d={currentPath}
                      stroke={currentTool.color || '#000000'}
                      strokeWidth={currentTool.strokeWidth ? currentTool.strokeWidth.toString() : '2'}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </G>
              </Svg>
            );
          } catch (error) {
            console.log('SVG rendering error:', error);
            return (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.onSurface }}>Canvas Error</Text>
              </View>
            );
          }
        })()}
      </View>

      {/* Info text */}
      <Text style={styles.infoText}>
        Scale: {scale.toFixed(2)}x | Mode: {currentTool.mode} | Zoom: {isZooming.current ? 'Yes' : 'No'}
      </Text>

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <View style={styles.zoomButton} onTouchEnd={() => setScale(Math.min(scale * 1.2, 10))}>
          <Text style={styles.zoomText}>+</Text>
        </View>
        <View style={styles.zoomButton} onTouchEnd={() => setScale(Math.max(scale / 1.2, 0.1))}>
          <Text style={styles.zoomText}>-</Text>
        </View>
        <View style={styles.zoomButton} onTouchEnd={() => {
          setScale(1);
          setTranslate({ x: 0, y: 0 });
        }}>
          <Text style={styles.zoomText}>⌂</Text>
        </View>
      </View>
    </View>
  );
}