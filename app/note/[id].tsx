import { View, StyleSheet, Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, RotateCcw, Save } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotes, Note } from '@/contexts/NotesContext';
import { InfiniteCanvas, CanvasRef } from '@/components/InfiniteCanvas/InfiniteCanvas';
import { Toolbar, Tool } from '@/components/Toolbar';

export interface DrawPath {
  id: string;
  d: string;
  color: string;
  strokeWidth: number;
}

export default function NoteScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNoteById, updateNote, setCurrentNote } = useNotes();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [paths, setPaths] = useState<DrawPath[]>([]);
  const [currentTool, setCurrentTool] = useState<Tool>('draw');
  const [color, setColor] = useState(theme.onSurface);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [eraserSize, setEraserSize] = useState(30);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const canvasRef = useRef<CanvasRef>(null);

  useEffect(() => {
    if (id) {
      const foundNote = getNoteById(id);
      if (foundNote) {
        setNote(foundNote);
        setTitle(foundNote.title);
        setPaths(foundNote.paths || []);
        setCurrentNote(foundNote);
      } else {
        Alert.alert('Error', 'Note not found', [
          { text: 'OK', onPress: () => handleGoBack() }
        ]);
      }
    }
  }, [id]);

  const handleGoBack = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/');
      }
    } catch (error) {
      console.log('Navigation error:', error);
      router.replace('/(tabs)/');
    }
  };

  const debouncedSave = (updates: Partial<Note>) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      if (note) {
        updateNote(note.id, updates);
      }
    }, 1000);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    debouncedSave({ title: newTitle });
  };

  const handlePathsChange = (newPaths: DrawPath[]) => {
    setPaths(newPaths);
    debouncedSave({ paths: newPaths });
  };

  const handleClearCanvas = () => {
    Alert.alert(
      'Clear Canvas',
      'Are you sure you want to clear all drawings? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setPaths([]);
            handlePathsChange([]);
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (note) {
      await updateNote(note.id, { title, paths });
      Alert.alert('Saved', 'Your note has been saved successfully!');
    }
  };

  const onZoomIn = () => {
    canvasRef.current?.zoomIn();
  };

  const onZoomOut = () => {
    canvasRef.current?.zoomOut();
  };

  if (!note) {
    return null;
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.outlineVariant,
      gap: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleInput: {
      flex: 1,
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.onSurface,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.surfaceVariant,
      borderRadius: 8,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primaryContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    canvasContainer: {
      flex: 1,
    },
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <ArrowLeft size={20} color={theme.onSurfaceVariant} />
          </TouchableOpacity>
          
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Note title"
            placeholderTextColor={theme.onSurfaceVariant}
            maxLength={100}
          />
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleClearCanvas}>
              <RotateCcw size={20} color={theme.onPrimaryContainer} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
              <Save size={20} color={theme.onPrimaryContainer} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.canvasContainer}>
          <InfiniteCanvas
            canvasRef={canvasRef}
            template={note.template}
            paths={paths}
            onPathsChange={handlePathsChange}
            currentTool={currentTool}
            color={color}
            strokeWidth={strokeWidth}
            eraserSize={eraserSize}
          />
        </View>

        <Toolbar
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          color={color}
          onColorChange={setColor}
          strokeWidth={strokeWidth}
          onStrokeWidthChange={setStrokeWidth}
          eraserSize={eraserSize}
          onEraserSizeChange={setEraserSize}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}