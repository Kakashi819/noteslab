import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: string;
  title: string;
  content: string;
  template: 'blank' | 'dotted' | 'lined' | 'grid';
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
  paths?: Array<{
    id: string;
    d: string;
    color: string;
    strokeWidth: number;
  }>;
}

interface NotesContextType {
  notes: Note[];
  currentNote: Note | null;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  getNoteById: (id: string) => Note | undefined;
  setCurrentNote: (note: Note | null) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const STORAGE_KEY = 'notes_data';

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          paths: note.paths ? note.paths.map((path: any) => {
            // Ensure d is always a valid string
            let dValue = '';
            if (typeof path.d === 'string' && path.d.trim() !== '') {
              dValue = path.d;
            } else if (path.d != null) {
              // Convert to string if it's not null/undefined, but ensure it's valid
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
          }).filter((path: any) => path.d !== '') : undefined // Filter out paths with empty d values
        }));
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.log('Error loading notes:', error);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.log('Error saving notes:', error);
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

  return (
    <NotesContext.Provider
      value={{
        notes,
        currentNote,
        addNote,
        updateNote,
        deleteNote,
        getNoteById,
        setCurrentNote,
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