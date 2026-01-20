
export interface Project {
  id: string;
  name: string;
  color: string;
  slot: number;
  isFinished?: boolean;
}

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD
  projectId: string;
  content: string;
  intensity: number; // 0-4
}

export interface Inspiration {
  id: string;
  content: string;
  projectId?: string;
  createdAt: string;
  isHidden?: boolean; // New: tracking hidden status
}

export type ViewType = 'MATRIX' | 'DASHBOARD' | 'BRAINSTORM';

export const MORANDI_PALETTE = [
  'bg-[#D8E2DC]', // Sage
  'bg-[#FFE5D9]', // Peach
  'bg-[#FFCAD4]', // Pink
  'bg-[#F4ACB7]', // Rose
  'bg-[#9D8189]', // Dusky purple
  'bg-[#B7C3C0]', // Gray Blue
  'bg-[#E2D1C3]', // Sand
  'bg-[#ECE4DB]', // Linen
  'bg-[#D4A373]', // Tan
];

export const INTENSITY_COLORS: Record<string, string[]> = {
  'bg-[#D8E2DC]': ['bg-[#f1f5f3]', 'bg-[#d8e2dc]', 'bg-[#b7c9be]', 'bg-[#96b0a1]', 'bg-[#759784]'],
  'bg-[#FFE5D9]': ['bg-[#fff5f1]', 'bg-[#ffe5d9]', 'bg-[#ffccb8]', 'bg-[#ffb397]', 'bg-[#ff9a76]'],
  'bg-[#FFCAD4]': ['bg-[#fff4f6]', 'bg-[#ffcad4]', 'bg-[#ffa6b6]', 'bg-[#ff8298]', 'bg-[#ff5e7a]'],
  'bg-[#F4ACB7]': ['bg-[#fdf3f4]', 'bg-[#f4acb7]', 'bg-[#ee8192]', 'bg-[#e8566d]', 'bg-[#e22b48]'],
  'bg-[#9D8189]': ['bg-[#f2eff0]', 'bg-[#9d8189]', 'bg-[#836a71]', 'bg-[#6a5359]', 'bg-[#503c41]'],
  'bg-[#B7C3C0]': ['bg-[#f4f6f5]', 'bg-[#b7c3c0]', 'bg-[#98a9a5]', 'bg-[#798f8a]', 'bg-[#5a756f]'],
  'bg-[#E2D1C3]': ['bg-[#f9f6f4]', 'bg-[#e2d1c3]', 'bg-[#d2b8a5]', 'bg-[#c29f87]', 'bg-[#b28669]'],
  'bg-[#ECE4DB]': ['bg-[#faf8f6]', 'bg-[#ece4db]', 'bg-[#decbb9]', 'bg-[#d0b297]', 'bg-[#c29975]'],
  'bg-[#D4A373]': ['bg-[#f8f1ea]', 'bg-[#d4a373]', 'bg-[#bf8b56]', 'bg-[#a3723b]', 'bg-[#875920]'],
};
