import { create } from 'zustand';

interface RepoStore {
  repoPath: string | null;
  setRepoPath: (path: string | null) => void;
}

export const useRepoStore = create<RepoStore>((set) => ({
  repoPath: localStorage.getItem('repolens:repoPath'),
  setRepoPath: (path) => {
    if (path) {
      localStorage.setItem('repolens:repoPath', path);
    } else {
      localStorage.removeItem('repolens:repoPath');
    }
    set({ repoPath: path });
  },
}));
