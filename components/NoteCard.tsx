import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MoveVertical as MoreVertical, Trash2, Clock } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Note } from '@/contexts/NotesContext';

interface NoteCardProps {
  note: Note;
  onPress: () => void;
  onDelete: () => void;
}

export function NoteCard({ note, onPress, onDelete }: NoteCardProps) {
  const { theme } = useTheme();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getTemplateColor = (template: string) => {
    switch (template) {
      case 'dotted': return theme.primary;
      case 'lined': return theme.secondary;
      case 'grid': return theme.success;
      default: return theme.onSurfaceVariant;
    }
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.outlineVariant,
      elevation: 2,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    title: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.onSurface,
      flex: 1,
      marginRight: 8,
    },
    menuButton: {
      padding: 4,
    },
    content: {
      marginBottom: 12,
    },
    contentPreview: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.onSurfaceVariant,
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    templateBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.surfaceVariant,
    },
    templateText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      textTransform: 'capitalize',
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dateText: {
      fontSize: 12,
      fontFamily: 'Inter-Regular',
      color: theme.onSurfaceVariant,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.error,
      borderRadius: 12,
      gap: 4,
    },
    deleteText: {
      fontSize: 12,
      fontFamily: 'Inter-Medium',
      color: theme.onError,
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {note.title || 'Untitled Note'}
        </Text>
        <TouchableOpacity style={styles.menuButton} onPress={onDelete}>
          <Trash2 size={18} color={theme.error} />
        </TouchableOpacity>
      </View>

      {note.content && (
        <View style={styles.content}>
          <Text style={styles.contentPreview} numberOfLines={3}>
            {note.content}
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.templateBadge}>
          <Text 
            style={[
              styles.templateText, 
              { color: getTemplateColor(note.template) }
            ]}
          >
            {note.template}
          </Text>
        </View>

        <View style={styles.dateContainer}>
          <Clock size={12} color={theme.onSurfaceVariant} />
          <Text style={styles.dateText}>
            {formatDate(note.updatedAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}