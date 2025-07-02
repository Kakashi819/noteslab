import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, PlusSquare, Star, Clock, LayoutGrid, Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotes, Note } from '@/contexts/NotesContext';
import NoteCard from '@/components/NoteCard';
import { ScrollableSection, HorizontalCard } from '@/components/ScrollableSections';

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

  const handleViewAllNotes = () => {
    // Navigate to a full notes view
    console.log('View all notes');
  };

  const handleViewFavorites = () => {
    // Filter to show only favorites
    console.log('View favorites');
  };

  const handleViewTemplates = () => {
    router.push('/(tabs)/create');
  };

  const quickActions = [
    { title: 'Create Note', icon: PlusSquare, color: theme.primary, onPress: handleCreateNote },
    { title: 'Favorites', icon: Star, color: '#FFD700', onPress: handleViewFavorites },
    { title: 'Recent', icon: Clock, color: '#4CAF50', onPress: handleViewAllNotes },
    { title: 'Templates', icon: LayoutGrid, color: '#2196F3', onPress: handleViewTemplates },
  ];

  const recentNotes = filteredNotes.slice(0, 5);
  const favoriteNotes = filteredNotes.filter(note => note.favorite).slice(0, 5);

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
          <>
            {/* Quick Actions - Horizontal */}
            <ScrollableSection 
              title="Quick Actions" 
              horizontal 
              showMoreButton 
              moreButtonText="View All"
              onPress={handleViewAllNotes}
            >
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <HorizontalCard key={index} onPress={action.onPress}>
                    <IconComponent 
                      size={24} 
                      color={action.color} 
                      style={{ marginBottom: 8, alignSelf: 'center' }}
                    />
                    <Text style={{ 
                      fontSize: 14, 
                      fontFamily: 'Inter-Medium', 
                      color: theme.onSurface,
                      textAlign: 'center'
                    }}>
                      {action.title}
                    </Text>
                  </HorizontalCard>
                );
              })}
            </ScrollableSection>

            {/* Recent Notes - Horizontal */}
            {recentNotes.length > 0 && (
              <ScrollableSection 
                title="Recent Notes" 
                horizontal 
                showMoreButton 
                moreButtonText="See All"
                onPress={handleViewAllNotes}
              >
                {recentNotes.map((note) => (
                  <HorizontalCard key={note.id} onPress={() => handleNotePress(note)}>
                    <Text style={{ 
                      fontSize: 16, 
                      fontFamily: 'Inter-SemiBold', 
                      color: theme.onSurface,
                      marginBottom: 8
                    }} numberOfLines={1}>
                      {note.title || 'Untitled Note'}
                    </Text>
                    <Text style={{ 
                      fontSize: 14, 
                      fontFamily: 'Inter-Regular', 
                      color: theme.onSurfaceVariant,
                      marginBottom: 4
                    }} numberOfLines={2}>
                      {note.content || 'No content'}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Clock size={12} color={theme.onSurfaceVariant} />
                      <Text style={{ 
                        fontSize: 12, 
                        fontFamily: 'Inter-Medium', 
                        color: theme.onSurfaceVariant 
                      }}>
                        {new Intl.DateTimeFormat('en-US', {
                          month: 'short',
                          day: 'numeric',
                        }).format(note.updatedAt)}
                      </Text>
                    </View>
                  </HorizontalCard>
                ))}
              </ScrollableSection>
            )}

            {/* All Notes - Vertical */}
            <ScrollableSection title="All Notes">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onDelete={() => handleDeleteNote(note)}
                />
              ))}
            </ScrollableSection>
          </>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleCreateNote}>
        <Plus size={24} color={theme.onPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}