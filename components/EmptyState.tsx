import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, Search, Plus, FolderOpen } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface EmptyStateProps {
  type: 'no-notes' | 'no-search-results' | 'no-favorites' | 'no-drawings' | 'error';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export function EmptyState({ 
  type, 
  title, 
  description, 
  actionText, 
  onAction, 
  showAction = true 
}: EmptyStateProps) {
  const { theme } = useTheme();

  const getDefaultContent = () => {
    switch (type) {
      case 'no-notes':
        return {
          icon: FileText,
          title: title || 'No Notes Yet',
          description: description || 'Create your first note to get started with your digital notebook.',
          actionText: actionText || 'Create Note',
        };
      case 'no-search-results':
        return {
          icon: Search,
          title: title || 'No Results Found',
          description: description || 'Try adjusting your search terms or filters to find what you\'re looking for.',
          actionText: actionText || 'Clear Search',
        };
      case 'no-favorites':
        return {
          icon: FolderOpen,
          title: title || 'No Favorites',
          description: description || 'Mark notes as favorites to see them here for quick access.',
          actionText: actionText || 'Browse Notes',
        };
      case 'no-drawings':
        return {
          icon: FileText,
          title: title || 'No Drawings',
          description: description || 'Start drawing on your notes to see them appear here.',
          actionText: actionText || 'Create Drawing',
        };
      case 'error':
        return {
          icon: FileText,
          title: title || 'Something Went Wrong',
          description: description || 'We encountered an error. Please try again or contact support.',
          actionText: actionText || 'Try Again',
        };
      default:
        return {
          icon: FileText,
          title: 'Empty State',
          description: 'No content to display.',
          actionText: 'Take Action',
        };
    }
  };

  const content = getDefaultContent();
  const IconComponent = content.icon;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingVertical: 48,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 20,
      fontFamily: 'Inter-SemiBold',
      color: theme.onSurface,
      textAlign: 'center',
      marginBottom: 12,
      lineHeight: 28,
    },
    description: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
      maxWidth: 280,
    },
    actionButton: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionText: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.onPrimary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconComponent size={32} color={theme.onSurfaceVariant} />
      </View>
      
      <Text style={styles.title}>{content.title}</Text>
      
      <Text style={styles.description}>{content.description}</Text>
      
      {showAction && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Plus size={20} color={theme.onPrimary} />
          <Text style={styles.actionText}>{content.actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
} 