import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { File, Grid, AlignLeft, Grid3x3 } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotes } from '@/contexts/NotesContext';

type Template = 'blank' | 'dotted' | 'lined' | 'grid';

interface TemplateOption {
  id: Template;
  name: string;
  description: string;
  icon: any;
}

const templates: TemplateOption[] = [
  {
    id: 'blank',
    name: 'Blank',
    description: 'Clean canvas for free-form notes',
    icon: File,
  },
  {
    id: 'dotted',
    name: 'Dotted',
    description: 'Dotted grid for structured writing',
    icon: Grid,
  },
  {
    id: 'lined',
    name: 'Lined',
    description: 'Horizontal lines for neat writing',
    icon: AlignLeft,
  },
  {
    id: 'grid',
    name: 'Grid',
    description: 'Square grid for precise layout',
    icon: Grid3x3,
  },
];

export default function CreateNoteScreen() {
  const { theme } = useTheme();
  const { addNote } = useNotes();

  const handleTemplateSelect = async (template: Template) => {
    try {
      const newNote = await addNote({
        title: 'Untitled Note',
        content: '',
        template,
        paths: [],
      });
      
      router.replace(`/note/${newNote.id}`);
    } catch (error) {
      console.log('Error creating note:', error);
    }
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
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Inter-Regular',
      color: theme.onSurfaceVariant,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    templatesContainer: {
      gap: 16,
    },
    templateCard: {
      backgroundColor: theme.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.outlineVariant,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    templateIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: theme.primaryContainer,
      justifyContent: 'center',
      alignItems: 'center',
    },
    templateInfo: {
      flex: 1,
    },
    templateName: {
      fontSize: 18,
      fontFamily: 'Inter-SemiBold',
      color: theme.onSurface,
      marginBottom: 4,
    },
    templateDescription: {
      fontSize: 14,
      fontFamily: 'Inter-Regular',
      color: theme.onSurfaceVariant,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Note</Text>
        <Text style={styles.subtitle}>Choose a template to get started</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.templatesContainer}>
          {templates.map((template) => {
            const IconComponent = template.icon;
            return (
              <TouchableOpacity
                key={template.id}
                style={styles.templateCard}
                onPress={() => handleTemplateSelect(template.id)}
              >
                <View style={styles.templateIconContainer}>
                  <IconComponent size={24} color={theme.onPrimaryContainer} />
                </View>
                <View style={styles.templateInfo}>
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateDescription}>{template.description}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}