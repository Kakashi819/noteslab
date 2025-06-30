import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Note } from '@/contexts/NotesContext';
import NoteCard from './NoteCard';
import { EmptyState } from './EmptyState';
import { SearchFilters, SortOption } from './SearchBar';

interface NotesListProps {
  notes: Note[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onDelete?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onShare?: (note: Note) => void;
  searchQuery?: string;
  filters?: SearchFilters;
  sortOption?: SortOption;
  selectionMode?: boolean;
  selectedNotes?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  emptyStateType?: 'no-notes' | 'no-search-results' | 'no-favorites' | 'no-drawings';
  onEmptyStateAction?: () => void;
}

export function NotesList({
  notes,
  loading = false,
  refreshing = false,
  onRefresh,
  onLoadMore,
  onDelete,
  onFavorite,
  onShare,
  searchQuery = '',
  filters = {},
  sortOption = { field: 'updatedAt', direction: 'desc' },
  selectionMode = false,
  selectedNotes = [],
  onSelectionChange,
  emptyStateType = 'no-notes',
  onEmptyStateAction,
}: NotesListProps) {
  const { theme } = useTheme();
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filter and sort notes
  const filteredAndSortedNotes = useMemo(() => {
    let filteredNotes = [...notes];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredNotes = filteredNotes.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (filters.template) {
      filteredNotes = filteredNotes.filter(note => note.template === filters.template);
    }

    if (filters.hasContent) {
      filteredNotes = filteredNotes.filter(note => note.content && note.content.trim().length > 0);
    }

    if (filters.hasDrawings) {
      filteredNotes = filteredNotes.filter(note => note.paths && note.paths.length > 0);
    }

    if (filters.favorite) {
      filteredNotes = filteredNotes.filter(note => note.favorite);
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filteredNotes = filteredNotes.filter(note => note.updatedAt >= startDate);
    }

    // Sort notes
    filteredNotes.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortOption.field) {
        case 'title':
          aValue = (a.title || '').toLowerCase();
          bValue = (b.title || '').toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updatedAt':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case 'favorite':
          aValue = a.favorite ? 1 : 0;
          bValue = b.favorite ? 1 : 0;
          break;
        default:
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
      }

      if (sortOption.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filteredNotes;
  }, [notes, searchQuery, filters, sortOption]);

  const handleSelectionToggle = useCallback((noteId: string) => {
    if (!onSelectionChange) return;

    const newSelected = selectedNotes.includes(noteId)
      ? selectedNotes.filter(id => id !== noteId)
      : [...selectedNotes, noteId];
    
    onSelectionChange(newSelected);
  }, [selectedNotes, onSelectionChange]);

  const handleLoadMore = useCallback(async () => {
    if (onLoadMore && !isLoadingMore) {
      setIsLoadingMore(true);
      try {
        await onLoadMore();
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [onLoadMore, isLoadingMore]);

  const renderNoteCard = useCallback(({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      onDelete={onDelete}
      onFavorite={onFavorite}
      onShare={onShare}
      isSelected={selectedNotes.includes(item.id)}
      onSelect={handleSelectionToggle}
      selectionMode={selectionMode}
    />
  ), [onDelete, onFavorite, onShare, selectedNotes, handleSelectionToggle, selectionMode]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }, [isLoadingMore, theme.primary]);

  const renderEmptyState = useCallback(() => {
    if (loading) return null;
    
    return (
      <EmptyState
        type={emptyStateType}
        onAction={onEmptyStateAction}
      />
    );
  }, [loading, emptyStateType, onEmptyStateAction]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    list: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 100, // Extra space for FAB
    },
    footer: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  if (loading && notes.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredAndSortedNotes}
        renderItem={renderNoteCard}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyState}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        getItemLayout={(data, index) => ({
          length: 140, // Approximate height of NoteCard
          offset: 140 * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
} 