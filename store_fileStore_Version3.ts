import { create } from 'zustand';

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  content?: string; // Opcional, para previsualización
  uploadedAt: string;
}

interface FileState {
  files: ProjectFile[];
  addFile: (file: Omit<ProjectFile, 'id' | 'uploadedAt'>) => string;
  fetchFileContent: (id: string) => Promise<void>;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  addFile: (file) => {
    const id = `file-${Date.now()}`;
    set(state => ({
      files: [{ ...file, id, uploadedAt: new Date().toISOString() }, ...state.files]
    }));
    return id;
  },
  fetchFileContent: async (id) => {
    const file = get().files.find(f => f.id === id);
    if (file && file.url) {
      const res = await fetch(file.url);
      const content = await res.text();
      set(state => ({
        files: state.files.map(f =>
          f.id === id ? { ...f, content } : f
        )
      }));
    }
  },
}));