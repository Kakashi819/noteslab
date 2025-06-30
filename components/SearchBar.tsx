import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Search, X, Filter, SortAsc, SortDesc } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface SearchFilters {
  template?: 'blank' | 'dotted' | 'lined' | 'grid';
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'all';
  hasContent?: boolean;
  hasDrawings?: boolean;
  favorite?: boolean;
}

export interface SortOption {
  field: 'title' | 'createdAt' | 'updatedAt' | 'favorite';
  direction: 'asc' | 'desc';
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFiltersChange: (filters: SearchFilters) => void;
  onSortChange: (sort: SortOption) => void;
  placeholder?: string;
  showFilters?: boolean;
  showSort?: boolean;
}

export function SearchBar({ 
  onSearch, 
  onFiltersChange, 
  onSortChange, 
  placeholder = "Search notes...",
  showFilters = true,
  showSort = true
}: SearchBarProps) {
  const { theme } = useTheme();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortOption, setSortOption] = useState<SortOption>({ field: 'updatedAt', direction: 'desc' });

  const animatedValue = useMemo(() => new Animated.Value(0), []);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [animatedValue]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [animatedValue]);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    onSearch(text);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  const handleFilterChange = useCallback((newFilters: SearchFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }, [filters, onFiltersChange]);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSortOption(newSort);
    onSortChange(newSort);
    setShowSortMenu(false);
  }, [onSortChange]);

  const getActiveFiltersCount = useCallback(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.outlineVariant,
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
    clearButton: {
      padding: 4,
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.surfaceVariant,
      gap: 6,
    },
    actionButtonActive: {
      backgroundColor: theme.primaryContainer,
    },
    actionText: {
      fontSize: 14,
      fontFamily: 'Inter-Medium',
      color: theme.onSurfaceVariant,
    },
    actionTextActive: {
      color: theme.onPrimaryContainer,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: theme.primary,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      fontSize: 10,
      fontFamily: 'Inter-Bold',
      color: theme.onPrimary,
    },
    filterMenu: {
      position: 'absolute',
      top: '100%',
      left: 16,
      right: 16,
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      elevation: 8,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      zIndex: 1000,
    },
    filterSection: {
      marginBottom: 16,
    },
    filterTitle: {
      fontSize: 14,
      fontFamily: 'Inter-SemiBold',
      color: theme.onSurface,
      marginBottom: 8,
    },
    filterOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterOption: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.surfaceVariant,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    filterOptionActive: {
      backgroundColor: theme.primaryContainer,
      borderColor: theme.primary,
    },
    filterOptionText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.onSurfaceVariant,
    },
    filterOptionTextActive: {
      color: theme.onPrimaryContainer,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={theme.onSurfaceVariant} />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={theme.onSurfaceVariant}
          value={query}
          onChangeText={handleSearch}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {query.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <X size={18} color={theme.onSurfaceVariant} />
          </TouchableOpacity>
        )}
      </View>

      {(showFilters || showSort) && (
        <View style={styles.actionsContainer}>
          {showFilters && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                getActiveFiltersCount() > 0 && styles.actionButtonActive
              ]}
              onPress={() => setShowFilterMenu(!showFilterMenu)}
            >
              <Filter size={16} color={getActiveFiltersCount() > 0 ? theme.onPrimaryContainer : theme.onSurfaceVariant} />
              <Text style={[
                styles.actionText,
                getActiveFiltersCount() > 0 && styles.actionTextActive
              ]}>
                Filters
              </Text>
              {getActiveFiltersCount() > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{getActiveFiltersCount()}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {showSort && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowSortMenu(!showSortMenu)}
            >
              {sortOption.direction === 'asc' ? (
                <SortAsc size={16} color={theme.onSurfaceVariant} />
              ) : (
                <SortDesc size={16} color={theme.onSurfaceVariant} />
              )}
              <Text style={styles.actionText}>
                {sortOption.field === 'title' ? 'Title' : 
                 sortOption.field === 'createdAt' ? 'Created' : 
                 sortOption.field === 'updatedAt' ? 'Modified' : 'Favorite'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showFilterMenu && (
        <View style={styles.filterMenu}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Template</Text>
            <View style={styles.filterOptions}>
              {(['blank', 'dotted', 'lined', 'grid'] as const).map((template) => (
                <TouchableOpacity
                  key={template}
                  style={[
                    styles.filterOption,
                    filters.template === template && styles.filterOptionActive
                  ]}
                  onPress={() => handleFilterChange({ 
                    template: filters.template === template ? undefined : template 
                  })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    filters.template === template && styles.filterOptionTextActive
                  ]}>
                    {template.charAt(0).toUpperCase() + template.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Content</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filters.hasContent && styles.filterOptionActive
                ]}
                onPress={() => handleFilterChange({ 
                  hasContent: filters.hasContent ? undefined : true 
                })}
              >
                <Text style={[
                  styles.filterOptionText,
                  filters.hasContent && styles.filterOptionTextActive
                ]}>
                  Has Text
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filters.hasDrawings && styles.filterOptionActive
                ]}
                onPress={() => handleFilterChange({ 
                  hasDrawings: filters.hasDrawings ? undefined : true 
                })}
              >
                <Text style={[
                  styles.filterOptionText,
                  filters.hasDrawings && styles.filterOptionTextActive
                ]}>
                  Has Drawings
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  filters.favorite && styles.filterOptionActive
                ]}
                onPress={() => handleFilterChange({ 
                  favorite: filters.favorite ? undefined : true 
                })}
              >
                <Text style={[
                  styles.filterOptionText,
                  filters.favorite && styles.filterOptionTextActive
                ]}>
                  Favorites
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showSortMenu && (
        <View style={styles.filterMenu}>
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Sort By</Text>
            <View style={styles.filterOptions}>
              {(['title', 'createdAt', 'updatedAt', 'favorite'] as const).map((field) => (
                <TouchableOpacity
                  key={field}
                  style={[
                    styles.filterOption,
                    sortOption.field === field && styles.filterOptionActive
                  ]}
                  onPress={() => handleSortChange({ 
                    field, 
                    direction: sortOption.field === field && sortOption.direction === 'asc' ? 'desc' : 'asc' 
                  })}
                >
                  <Text style={[
                    styles.filterOptionText,
                    sortOption.field === field && styles.filterOptionTextActive
                  ]}>
                    {field === 'title' ? 'Title' : 
                     field === 'createdAt' ? 'Created' : 
                     field === 'updatedAt' ? 'Modified' : 'Favorite'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}