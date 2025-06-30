import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, MoveVertical as MoreVertical, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotes, Note } from '@/contexts/NotesContext';
import NoteCard from '@/components/NoteCard';

export default function NotesScreen() {
  const { theme } = useTheme();
  const { notes, deleteNote } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(notes);

  useFocusEffect(
    useCallback(() => {
      setFilteredNotes(notes);
      if (searchQuery) {
        handleSearch(searchQuery);
      }
    }, [notes, searchQuery])
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(note =>
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  };

  const handleNotePress = (note: Note) => {
    router.push(`/note/${note.id}`);
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert(
      'Delete Note',
      `Are you sure you want to delete "${note.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteNote(note.id),
        },
      ]
    );
  };

  const handleCreateNote = () => {
    router.push('/(tabs)/create');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      padding: 20,
      paddingBottom: 10,
    },
    title: {
      fontSize: 32,
      fontFamily: 'Inter-Bold',
      color: theme.onSurface,
      marginBottom: 16,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.surfaceVariant,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.onSurface,
      paddingVertical: 4,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
    },
    notesGrid: {
      paddingBottom: 100,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: 100,
    },
    emptyText: {
      fontSize: 18,
      fontFamily: 'Inter-Medium',
      color: theme.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: 20,
    },
    emptySubtext: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: 32,
    },
    createButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    createButtonText: {
      color: theme.onPrimary,
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
    },
    fab: {
      position: 'absolute',
      bottom: 80,
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color={theme.onSurfaceVariant} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            placeholderTextColor={theme.onSurfaceVariant}
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>
      </View>

      <View style={styles.content}>
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Create your first note to get started'
              }
            </Text>
            {!searchQuery && (
              <TouchableOpacity style={styles.createButton} onPress={handleCreateNote}>
                <Plus size={20} color={theme.onPrimary} />
                <Text style={styles.createButtonText}>Create Note</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <ScrollView style={styles.notesGrid} showsVerticalScrollIndicator={false}>
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onDelete={() => handleDeleteNote(note)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={handleCreateNote}>
        <Plus size={24} color={theme.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}