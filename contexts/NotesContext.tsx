import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  template: 'blank' | 'dotted' | 'lined' | 'grid';
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
  favorite?: boolean;
  folderId?: string;
  paths?: Array<{
    id: string;
    d: string;
    color: string;
    strokeWidth: number;
  }>;
}

interface NotesContextType {
  notes: Note[];
  folders: Folder[];
  currentNote: Note | null;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
  setCurrentNote: (note: Note | null) => void;
  addFolder: (name: string) => Promise<void>;
  updateFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const NOTES_STORAGE_KEY = 'notes_data';
const FOLDERS_STORAGE_KEY = 'folders_data';

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          paths: note.paths ? note.paths.map((path: any) => {
            let dValue = '';
            if (typeof path.d === 'string' && path.d.trim() !== '') {
              dValue = path.d;
            } else if (path.d != null) {
              const stringValue = String(path.d);
              if (stringValue !== '[object Object]' && stringValue !== 'null' && stringValue !== 'undefined') {
                dValue = stringValue;
              }
            }
            
            return {
              ...path,
              d: dValue,
              color: typeof path.color === 'string' ? path.color : '#000000',
              strokeWidth: typeof path.strokeWidth === 'number' ? path.strokeWidth : 2
            };
          }).filter((path: any) => path.d !== '') : undefined
        }));
        setNotes(parsedNotes);
      }
      const savedFolders = await AsyncStorage.getItem(FOLDERS_STORAGE_KEY);
      if (savedFolders) {
        setFolders(JSON.parse(savedFolders).map((folder: any) => ({
          ...folder,
          createdAt: new Date(folder.createdAt),
        })));
      }
    } catch (error) {
      console.log('Error loading data:', error);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.log('Error saving notes:', error);
    }
  };

  const saveFolders = async (updatedFolders: Folder[]) => {
    try {
      await AsyncStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(updatedFolders));
      setFolders(updatedFolders);
    } catch (error) {
      console.log('Error saving folders:', error);
    }
  };

  const addNote = async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedNotes = [newNote, ...notes];
    await saveNotes(updatedNotes);
    return newNote;
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map(note =>
      note.id === id
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    );
    await saveNotes(updatedNotes);

    if (currentNote && currentNote.id === id) {
      setCurrentNote({ ...currentNote, ...updates, updatedAt: new Date() });
    }
  };

  const deleteNote = async (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    await saveNotes(updatedNotes);

    if (currentNote && currentNote.id === id) {
      setCurrentNote(null);
    }
  };

  const getNoteById = (id: string): Note | undefined => {
    return notes.find(note => note.id === id);
  };

  const addFolder = async (name: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      createdAt: new Date(),
    };
    const updatedFolders = [...folders, newFolder];
    await saveFolders(updatedFolders);
  };

  const updateFolder = async (id: string, name: string) => {
    const updatedFolders = folders.map(folder =>
      folder.id === id ? { ...folder, name } : folder
    );
    await saveFolders(updatedFolders);
  };

  const deleteFolder = async (id: string) => {
    const updatedFolders = folders.filter(folder => folder.id !== id);
    await saveFolders(updatedFolders);
    // Also remove the folderId from any notes that were in this folder
    const updatedNotes = notes.map(note =>
      note.folderId === id ? { ...note, folderId: undefined } : note
    );
    await saveNotes(updatedNotes);
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        folders,
        currentNote,
        addNote,
        updateNote,
        deleteNote,
        getNoteById,
        setCurrentNote,
        addFolder,
        updateFolder,
        deleteFolder,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}