import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Folder, Plus } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotes } from '@/contexts/NotesContext';

export default function FoldersScreen() {
  const { theme } = useTheme();
  const { folders, addFolder } = useNotes();
  const [modalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleAddFolder = () => {
    if (newFolderName.trim() !== '') {
      addFolder(newFolderName);
      setNewFolderName('');
      setModalVisible(false);
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
      marginBottom: 16,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
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
    folderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.outlineVariant,
    },
    folderName: {
      fontSize: 18,
      fontFamily: 'Inter-Medium',
      color: theme.onSurface,
      marginLeft: 16,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 20,
      width: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Inter-Bold',
      color: theme.onSurface,
      marginBottom: 20,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.outline,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.onSurface,
      marginBottom: 20,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Folders</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {folders.map((folder) => (
          <TouchableOpacity key={folder.id} style={styles.folderItem}>
            <Folder size={24} color={theme.onSurfaceVariant} />
            <Text style={styles.folderName}>{folder.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Plus size={24} color={theme.onPrimary} />
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Folder</Text>
            <TextInput
              style={styles.input}
              placeholder="Folder name"
              placeholderTextColor={theme.onSurfaceVariant}
              value={newFolderName}
              onChangeText={setNewFolderName}
            />
            <Button title="Create" onPress={handleAddFolder} color={theme.primary} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}