import React, { memo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, Calendar, Clock, MoreVertical, Star, Trash2, Share2, Edit3, Folder } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Note, useNotes } from '@/contexts/NotesContext';
import Swipeable from 'react-native-gesture-handler/Swipeable';

interface NoteCardProps {
  note: Note;
  onDelete?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onShare?: (note: Note) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  selectionMode?: boolean;
}

const NoteCard = memo(({ 
  note, 
  onDelete, 
  onFavorite, 
  onShare, 
  isSelected = false, 
  onSelect, 
  selectionMode = false 
}: NoteCardProps) => {
  const { theme } = useTheme();
  const router = useRouter();
  const { folders, updateNote } = useNotes();
  const [menuVisible, setMenuVisible] = useState(false);
  const [folderModalVisible, setFolderModalVisible] = useState(false);

  const handlePress = useCallback(() => {
    if (selectionMode && onSelect) {
      onSelect(note.id);
    } else {
      router.push(`/note/${note.id}`);
    }
  }, [note.id, selectionMode, onSelect, router]);

  const handleLongPress = useCallback(() => {
    if (onSelect) {
      onSelect(note.id);
    }
  }, [note.id, onSelect]);

  const handleMoveToFolder = (folderId: string) => {
    updateNote(note.id, { folderId });
    setFolderModalVisible(false);
  };

  const formatDate = useCallback((date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }, []);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }, []);

  const getTemplateIcon = useCallback(() => {
    switch (note.template) {
      case 'dotted':
        return '🔵';
      case 'lined':
        return '📏';
      case 'grid':
        return '🔲';
      default:
        return '📄';
    }
  }, [note.template]);

  const getPathCount = useCallback(() => {
    return note.paths?.length || 0;
  }, [note.paths]);

  const folder = note.folderId ? folders.find(f => f.id === note.folderId) : null;

  const renderRightActions = (progress: any, dragX: any) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [0, 100],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity
        style={styles.rightAction}
        onPress={() => onDelete?.(note.id)}
      >
        <Animated.View style={[styles.actionContent, { transform: [{ translateX: trans }] }]}>
          <Trash2 size={24} color={theme.onError} />
          <Text style={styles.actionText}>Delete</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      borderWidth: isSelected ? 2 : 0,
      borderColor: theme.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    titleContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    templateIcon: {
      fontSize: 16,
    },
    title: {
      fontSize: 16,
      fontFamily: 'Inter-SemiBold',
      color: theme.onSurface,
      flex: 1,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.surfaceVariant,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      marginBottom: 12,
    },
    contentText: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.onSurfaceVariant,
      lineHeight: 20,
    },
    thumbnail: {
      width: '100%',
      height: 120,
      borderRadius: 8,
      backgroundColor: theme.surfaceVariant,
      marginBottom: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    thumbnailText: {
      fontSize: 12,
      color: theme.onSurfaceVariant,
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metadata: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    metadataItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metadataText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.onSurfaceVariant,
    },
    stats: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.surfaceVariant,
    },
    statText: {
      fontSize: 11,
      fontFamily: 'Inter-Medium',
      color: theme.onSurfaceVariant,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menu: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 12,
      elevation: 5,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    menuItemText: {
      fontSize: 16,
      fontFamily: 'Inter-Medium',
      color: theme.onSurface,
      marginLeft: 12,
    },
    folderName: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.primary,
    },
    rightAction: {
      backgroundColor: theme.error,
      justifyContent: 'center',
      alignItems: 'flex-end',
      borderRadius: 16,
      marginBottom: 12,
    },
    actionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
    },
    actionText: {
      color: theme.onError,
      fontWeight: '600',
      marginLeft: 8,
    },
  });

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.templateIcon}>{getTemplateIcon()}</Text>
            <Text style={styles.title} numberOfLines={1}>
              {note.title || 'Untitled Note'}
            </Text>
          </View>
          
          <View style={styles.actions}>
            {onFavorite && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onFavorite(note.id)}
              >
                <Star 
                  size={16} 
                  color={note.favorite ? theme.primary : theme.onSurfaceVariant} 
                  fill={note.favorite ? theme.primary : 'none'}
                />
              </TouchableOpacity>
            )}
            
            {onShare && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onShare(note)}
              >
                <Share2 size={16} color={theme.onSurfaceVariant} />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.actionButton} onPress={() => setMenuVisible(true)}>
              <MoreVertical size={16} color={theme.onSurfaceVariant} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {note.content ? (
            <Text style={styles.contentText} numberOfLines={3}>
              {note.content}
            </Text>
          ) : (
            <Text style={styles.contentText} numberOfLines={2}>
              Empty note
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.metadata}>
            <View style={styles.metadataItem}>
              <Calendar size={12} color={theme.onSurfaceVariant} />
              <Text style={styles.metadataText}>
                {formatDate(note.updatedAt)}
              </Text>
            </View>
            
            <View style={styles.metadataItem}>
              <Clock size={12} color={theme.onSurfaceVariant} />
              <Text style={styles.metadataText}>
                {formatTime(note.updatedAt)}
              </Text>
            </View>
          </View>

          {folder && (
            <View style={styles.statItem}>
              <Folder size={12} color={theme.primary} />
              <Text style={styles.folderName}>{folder.name}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <Modal
        transparent
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalContainer} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onFavorite?.(note.id);
                setMenuVisible(false);
              }}
            >
              <Star size={20} color={note.favorite ? theme.primary : theme.onSurfaceVariant} />
              <Text style={styles.menuItemText}>{note.favorite ? 'Unfavorite' : 'Favorite'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setFolderModalVisible(true);
              }}
            >
              <Folder size={20} color={theme.onSurfaceVariant} />
              <Text style={styles.menuItemText}>Move to Folder</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onDelete?.(note.id);
                setMenuVisible(false);
              }}
            >
              <Trash2 size={20} color={theme.error} />
              <Text style={[styles.menuItemText, { color: theme.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        transparent
        visible={folderModalVisible}
        onRequestClose={() => setFolderModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalContainer} onPress={() => setFolderModalVisible(false)}>
          <View style={styles.menu}>
            {folders.map(f => (
              <TouchableOpacity
                key={f.id}
                style={styles.menuItem}
                onPress={() => handleMoveToFolder(f.id)}
              >
                <Folder size={20} color={theme.onSurfaceVariant} />
                <Text style={styles.menuItemText}>{f.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </Swipeable>
  );
});

NoteCard.displayName = 'NoteCard';

export default NoteCard;