import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Palette, Minus, Plus, Eraser } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface DrawingToolsProps {
  currentTool: {
    color: string;
    strokeWidth: number;
    mode: 'draw' | 'erase';
  };
  onToolChange: (tool: { color: string; strokeWidth: number; mode: 'draw' | 'erase' }) => void;
}

const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000',
];

const strokeWidths = [1, 2, 4, 6, 8, 12];

export function DrawingTools({ currentTool, onToolChange }: DrawingToolsProps) {
  const { theme } = useTheme();

  const handleColorChange = (color: string) => {
    onToolChange({ ...currentTool, color, mode: 'draw' });
  };

  const handleStrokeWidthChange = (strokeWidth: number) => {
    onToolChange({ ...currentTool, strokeWidth });
  };

  const handleModeChange = (mode: 'draw' | 'erase') => {
    onToolChange({ ...currentTool, mode });
  };

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: theme.surface,
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.onSurface,
      marginBottom: 8,
    },
    toolModeContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    modeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: theme.surfaceVariant,
      borderWidth: 2,
      borderColor: 'transparent',
      gap: 8,
    },
    modeButtonActive: {
      backgroundColor: theme.primaryContainer,
      borderColor: theme.primary,
    },
    modeButtonText: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.onSurfaceVariant,
    },
    modeButtonTextActive: {
      color: theme.onPrimaryContainer,
    },
    colorsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    colorButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 2,
      borderColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorButtonActive: {
      borderColor: theme.primary,
      borderWidth: 3,
    },
    colorButtonDisabled: {
      opacity: 0.5,
    },
    colorSwatch: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.outline,
    },
    strokeWidthContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    strokeButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 12,
      backgroundColor: theme.surfaceVariant,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    strokeButtonActive: {
      backgroundColor: theme.primaryContainer,
      borderColor: theme.primary,
    },
    strokePreview: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.onSurfaceVariant,
      marginBottom: 4,
    },
    strokeButtonText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.onSurfaceVariant,
    },
    strokeButtonTextActive: {
      color: theme.onPrimaryContainer,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Tool Mode Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tool</Text>
        <View style={styles.toolModeContainer}>
          <TouchableOpacity
            style={[
              styles.modeButton,
              currentTool.mode === 'draw' && styles.modeButtonActive,
            ]}
            onPress={() => handleModeChange('draw')}
          >
            <Palette 
              size={18} 
              color={currentTool.mode === 'draw' ? theme.onPrimaryContainer : theme.onSurfaceVariant} 
            />
            <Text
              style={[
                styles.modeButtonText,
                currentTool.mode === 'draw' && styles.modeButtonTextActive,
              ]}
            >
              Draw
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeButton,
              currentTool.mode === 'erase' && styles.modeButtonActive,
            ]}
            onPress={() => handleModeChange('erase')}
          >
            <Eraser 
              size={18} 
              color={currentTool.mode === 'erase' ? theme.onPrimaryContainer : theme.onSurfaceVariant} 
            />
            <Text
              style={[
                styles.modeButtonText,
                currentTool.mode === 'erase' && styles.modeButtonTextActive,
              ]}
            >
              Erase
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Colors - only show when in draw mode */}
      {currentTool.mode === 'draw' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Colors</Text>
          <View style={styles.colorsContainer}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorButton,
                  currentTool.color === color && styles.colorButtonActive,
                ]}
                onPress={() => handleColorChange(color)}
              >
                <View
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Brush/Eraser Size */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {currentTool.mode === 'draw' ? 'Brush Size' : 'Eraser Size'}
        </Text>
        <View style={styles.strokeWidthContainer}>
          {strokeWidths.map((width) => (
            <TouchableOpacity
              key={width}
              style={[
                styles.strokeButton,
                currentTool.strokeWidth === width && styles.strokeButtonActive,
              ]}
              onPress={() => handleStrokeWidthChange(width)}
            >
              <View
                style={[
                  styles.strokePreview,
                  {
                    width: Math.max(width * 2, 8),
                    height: Math.max(width * 2, 8),
                    borderRadius: Math.max(width, 4),
                    backgroundColor: currentTool.strokeWidth === width 
                      ? theme.onPrimaryContainer 
                      : theme.onSurfaceVariant,
                  },
                ]}
              />
              <Text
                style={[
                  styles.strokeButtonText,
                  currentTool.strokeWidth === width && styles.strokeButtonTextActive,
                ]}
              >
                {width}px
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}