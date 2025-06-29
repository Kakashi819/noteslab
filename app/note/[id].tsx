import { View, StyleSheet, Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Palette, RotateCcw, Save } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotes, Note } from '@/contexts/NotesContext';
import { InfiniteCanvas } from '@/components/InfiniteCanvas';
import { DrawingTools } from '@/components/DrawingTools';

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
  const [currentTool, setCurrentTool] = useState<{
    color: string;
    strokeWidth: number;
    mode: 'draw' | 'erase';
  }>({
    color: theme.onSurface,
    strokeWidth: 2,
    mode: 'draw',
  });
  const [showTools, setShowTools] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

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
    toolsContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.outlineVariant,
    },
    toolsToggle: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
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
            template={note.template}
            paths={paths}
            onPathsChange={handlePathsChange}
            currentTool={currentTool}
          />
        </View>

        {showTools && (
          <View style={styles.toolsContainer}>
            <DrawingTools
              currentTool={currentTool}
              onToolChange={setCurrentTool}
            />
          </View>
        )}

        <TouchableOpacity
          style={styles.toolsToggle}
          onPress={() => setShowTools(!showTools)}
        >
          <Palette size={24} color={theme.onPrimary} />
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}