import { Habit } from '../types';

export const PRESET_HABITS: Habit[] = [
  {
    id: 'meditation',
    name: 'Meditate',
    icon: '🧘',
    color: '#7F77DD',
    category: 'meditation',
    createdAt: '2024-01-01',
    isCustom: false,
  },
  {
    id: 'journaling',
    name: 'Journal',
    icon: '📓',
    color: '#1D9E75',
    category: 'journaling',
    createdAt: '2024-01-01',
    isCustom: false,
  },
  {
    id: 'walking',
    name: 'Go for a Walk',
    icon: '🚶',
    color: '#E8A838',
    category: 'walking',
    createdAt: '2024-01-01',
    isCustom: false,
  },
  {
    id: 'exercise',
    name: 'Exercise',
    icon: '🏃',
    color: '#E05C5C',
    category: 'exercise',
    createdAt: '2024-01-01',
    isCustom: false,
  },
  {
    id: 'yoga',
    name: 'Yoga',
    icon: '🧘‍♀️',
    color: '#9B59B6',
    category: 'yoga',
    createdAt: '2024-01-01',
    isCustom: false,
  },
  {
    id: 'breathing',
    name: 'Breathing Exercises',
    icon: '🌬️',
    color: '#3AAFA9',
    category: 'breathing',
    createdAt: '2024-01-01',
    isCustom: false,
  },
  {
    id: 'sleep',
    name: 'Sleep Hygiene',
    icon: '😴',
    color: '#5B7FA6',
    category: 'sleep',
    createdAt: '2024-01-01',
    isCustom: false,
  },
  {
    id: 'digital-detox',
    name: 'Digital Detox',
    icon: '📵',
    color: '#7D8C6A',
    category: 'digital-detox',
    createdAt: '2024-01-01',
    isCustom: false,
  },
];

export const getHabitById = (id: string): Habit | undefined =>
  PRESET_HABITS.find((h) => h.id === id);
