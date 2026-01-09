import { useState, useEffect } from 'react';
import { RepositoryView } from './components/RepositoryView';
import { RepoSelector } from './components/RepoSelector';
import { useRepoStore } from './store/repoStore';

function App() {
  const { repoPath, setRepoPath } = useRepoStore();

  if (!repoPath) {
    return <RepoSelector onSelect={setRepoPath} />;
  }

  return <RepositoryView repoPath={repoPath} onClose={() => setRepoPath(null)} />;
}

export default App;
