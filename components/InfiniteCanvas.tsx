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
  const pathIdRef = useRef(0);

  const generatePathId = useCallback(() => {
    pathIdRef.current += 1;
    return `path_${pathIdRef.current}_${Date.now()}`;
  }, []);

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

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      try {
        const { locationX, locationY } = evt.nativeEvent;
        setIsDrawing(true);
        
        if (currentTool.mode === 'draw') {
          const pathData = `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
          setCurrentPath(pathData);
        }
      } catch (error) {
        console.log('Pan responder grant error:', error);
      }
    },
    onPanResponderMove: (evt) => {
      try {
        const { locationX, locationY } = evt.nativeEvent;
        
        if (currentTool.mode === 'draw' && isDrawing) {
          setCurrentPath((prev) => {
            if (prev && typeof prev === 'string') {
              return `${prev} L${locationX.toFixed(2)},${locationY.toFixed(2)}`;
            }
            return `M${locationX.toFixed(2)},${locationY.toFixed(2)}`;
          });
        }
      } catch (error) {
        console.log('Pan responder move error:', error);
      }
    },
    onPanResponderRelease: () => {
      try {
        setIsDrawing(false);
        if (currentTool.mode === 'draw' && currentPath) {
          addNewPath(currentPath);
        }
        setCurrentPath('');
      } catch (error) {
        console.log('Pan responder release error:', error);
      }
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
  });

  // Safety check for SVG dimensions
  const svgWidth = Math.max(1, screenWidth);
  const svgHeight = Math.max(1, screenHeight);

  return (
    <View style={styles.container}>
      <View style={styles.canvas} {...panResponder.panHandlers}>
        {(() => {
          try {
            return (
              <Svg width={svgWidth.toString()} height={svgHeight.toString()} style={styles.svgContainer}>
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
    </View>
  );
}