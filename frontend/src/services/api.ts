const API_BASE = '/api';

export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
  parents: string[];
  branches: string[];
  tags: string[];
}

export interface Branch {
  name: string;
  commit: string;
  isRemote: boolean;
  isCurrent: boolean;
}

export interface RepoInfo {
  path: string;
  currentBranch: string;
  branches: Branch[];
  commits: Commit[];
  totalCommits: number;
}

export const api = {
  async validateRepo(repoPath: string): Promise<{ valid: boolean; path: string }> {
    const res = await fetch(`${API_BASE}/repo/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath }),
    });
    if (!res.ok) throw new Error('Invalid repository');
    return res.json();
  },

  async getRepoInfo(repoPath: string): Promise<RepoInfo> {
    const res = await fetch(`${API_BASE}/git/info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath }),
    });
    if (!res.ok) throw new Error('Failed to load repository info');
    return res.json();
  },

  async getCommitHistory(repoPath: string, limit?: number): Promise<Commit[]> {
    const res = await fetch(`${API_BASE}/git/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath, limit }),
    });
    if (!res.ok) throw new Error('Failed to load commit history');
    return res.json();
  },

  async getBranches(repoPath: string): Promise<Branch[]> {
    const res = await fetch(`${API_BASE}/git/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath }),
    });
    if (!res.ok) throw new Error('Failed to load branches');
    return res.json();
  },

  async getCommitDetails(repoPath: string, hash: string): Promise<any> {
    const res = await fetch(`${API_BASE}/git/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath, hash }),
    });
    if (!res.ok) throw new Error('Failed to load commit details');
    return res.json();
  },

  async getFileAtCommit(repoPath: string, filePath: string, commitHash: string): Promise<string> {
    const res = await fetch(`${API_BASE}/git/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath, filePath, commitHash }),
    });
    if (!res.ok) throw new Error('Failed to load file');
    const data = await res.json();
    return data.content;
  },

  async getFileTree(repoPath: string, commitHash?: string): Promise<string[]> {
    const res = await fetch(`${API_BASE}/git/tree`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath, commitHash }),
    });
    if (!res.ok) throw new Error('Failed to load file tree');
    return res.json();
  },

  async deleteBranch(repoPath: string, branchName: string, force: boolean = false): Promise<void> {
    const res = await fetch(`${API_BASE}/git/branch/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath, branchName, force }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete branch');
    }
  },

  async renameBranch(repoPath: string, oldName: string, newName: string): Promise<void> {
    const res = await fetch(`${API_BASE}/git/branch/rename`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath, oldName, newName }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to rename branch');
    }
  },

  async checkoutCommit(repoPath: string, hash: string): Promise<void> {
    const res = await fetch(`${API_BASE}/git/checkout/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath, hash }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to checkout commit');
    }
  },

  async checkoutBranch(repoPath: string, branchName: string): Promise<void> {
    const res = await fetch(`${API_BASE}/git/checkout/branch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ repoPath, branchName }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to checkout branch');
    }
  },
};
