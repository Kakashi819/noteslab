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
    mode: 'draw' | 'erase';
  };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function InfiniteCanvas({ template, paths, onPathsChange, currentTool }: InfiniteCanvasProps) {
  const { theme } = useTheme();
  const [currentPath, setCurrentPath] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const pathIdRef = useRef(0);
  const lastDistance = useRef(0);
  const lastCenter = useRef({ x: 0, y: 0 });

  const generatePathId = useCallback(() => {
    pathIdRef.current += 1;
    return `path_${pathIdRef.current}_${Date.now()}`;
  }, []);

  // Simple coordinate transformation
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    // Convert screen coordinates to canvas coordinates
    const canvasX = (screenX - translateX) / scale;
    const canvasY = (screenY - translateY) / scale;
    return { x: canvasX, y: canvasY };
  }, [translateX, translateY, scale]);

  const addNewPath = useCallback((pathData: string) => {
    try {
      if (pathData && pathData.length > 0 && typeof pathData === 'string') {
        const newPath: DrawPath = {
          id: generatePathId(),
          d: pathData,
          color: currentTool.color,
          strokeWidth: currentTool.strokeWidth,
        };
        onPathsChange([...paths, newPath]);
      }
    } catch (error) {
      console.log('Error adding path:', error);
    }
  }, [paths, onPathsChange, currentTool, generatePathId]);

  const calculateDistance = (touches: any[]) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].pageX - touches[1].pageX;
    const dy = touches[0].pageY - touches[1].pageY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const calculateCenter = (touches: any[]) => {
    if (touches.length < 2) return { x: 0, y: 0 };
    return {
      x: (touches[0].pageX + touches[1].pageX) / 2,
      y: (touches[0].pageY + touches[1].pageY) / 2,
    };
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return gestureState.numberActiveTouches === 1 || gestureState.numberActiveTouches === 2;
    },
    onPanResponderGrant: (evt) => {
      try {
        const { locationX, locationY } = evt.nativeEvent;
        const touches = evt.nativeEvent.touches;
        
        if (touches.length === 1) {
          // Single touch - drawing mode
          setIsDrawing(true);
          
          if (currentTool.mode === 'draw') {
            const coords = screenToCanvas(locationX, locationY);
            const pathData = `M${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
            setCurrentPath(pathData);
          }
        } else if (touches.length === 2) {
          // Two touches - zoom/pan mode
          lastDistance.current = calculateDistance(touches);
          lastCenter.current = calculateCenter(touches);
        }
      } catch (error) {
        console.log('Pan responder grant error:', error);
      }
    },
    onPanResponderMove: (evt) => {
      try {
        const touches = evt.nativeEvent.touches;
        
        if (touches.length === 1 && isDrawing) {
          // Single touch - continue drawing
          const { locationX, locationY } = evt.nativeEvent;
          
          if (currentTool.mode === 'draw') {
            const coords = screenToCanvas(locationX, locationY);
            
            setCurrentPath((prev) => {
              if (prev && typeof prev === 'string') {
                return `${prev} L${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
              }
              return `M${coords.x.toFixed(1)},${coords.y.toFixed(1)}`;
            });
          }
        } else if (touches.length === 2) {
          // Two touches - handle zoom and pan
          const currentDistance = calculateDistance(touches);
          const currentCenter = calculateCenter(touches);
          
          if (lastDistance.current > 0) {
            // Handle zoom
            const scaleFactor = currentDistance / lastDistance.current;
            const newScale = Math.min(Math.max(scale * scaleFactor, 0.5), 5);
            setScale(newScale);
            
            // Handle pan based on center movement
            const centerDeltaX = currentCenter.x - lastCenter.current.x;
            const centerDeltaY = currentCenter.y - lastCenter.current.y;
            
            setTranslateX(prev => prev + centerDeltaX);
            setTranslateY(prev => prev + centerDeltaY);
          }
          
          lastDistance.current = currentDistance;
          lastCenter.current = currentCenter;
        }
      } catch (error) {
        console.log('Pan responder move error:', error);
      }
    },
    onPanResponderRelease: (evt) => {
      try {
        const touches = evt.nativeEvent.touches;
        
        if (touches.length === 0) {
          // All touches released
          setIsDrawing(false);
          if (currentTool.mode === 'draw' && currentPath) {
            addNewPath(currentPath);
          }
          setCurrentPath('');
          lastDistance.current = 0;
        }
      } catch (error) {
        console.log('Pan responder release error:', error);
      }
    },
  });

  const resetZoom = () => {
    setScale(1);
    setTranslateX(0);
    setTranslateY(0);
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
  });

  // Calculate viewBox based on current transform
  const viewBoxX = -translateX / scale;
  const viewBoxY = -translateY / scale;
  const viewBoxWidth = screenWidth / scale;
  const viewBoxHeight = screenHeight / scale;
  const viewBox = `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

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
                {renderTemplate()}
                
                {/* Background with pattern */}
                <Rect
                  width="100%"
                  height="100%"
                  fill={getPatternFill()}
                />
                
                {/* Existing paths */}
                <G>
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

      {/* Zoom Controls */}
      <View style={styles.zoomControls}>
        <View style={styles.zoomButton} onTouchEnd={() => setScale(prev => Math.min(prev * 1.2, 5))}>
          <Text style={styles.zoomText}>+</Text>
        </View>
        <View style={styles.zoomButton} onTouchEnd={() => setScale(prev => Math.max(prev / 1.2, 0.5))}>
          <Text style={styles.zoomText}>-</Text>
        </View>
        <View style={styles.zoomButton} onTouchEnd={resetZoom}>
          <Text style={styles.zoomText}>⌂</Text>
        </View>
      </View>
    </View>
  );
}