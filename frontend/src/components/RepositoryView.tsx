import { useState, useEffect } from 'react';
import { api, RepoInfo, Commit, Branch } from '../services/api';
import { CommitGraph } from './CommitGraph';
import { BranchManager } from './BranchManager';
import { CommitDetails } from './CommitDetails';
import { CodeViewer } from './CodeViewer';
import { X, GitBranch, GitCommit, FileCode, AlertCircle } from 'lucide-react';
import './RepositoryView.css';

interface RepositoryViewProps {
  repoPath: string;
  onClose: () => void;
}

export function RepositoryView({ repoPath, onClose }: RepositoryViewProps) {
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ path: string; commit: string } | null>(null);
  const [activeView, setActiveView] = useState<'graph' | 'branches' | 'commit' | 'code'>('graph');

  useEffect(() => {
    loadRepoInfo();
  }, [repoPath]);

  const loadRepoInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await api.getRepoInfo(repoPath);
      setRepoInfo(info);
    } catch (err: any) {
      setError(err.message || 'Failed to load repository');
    } finally {
      setLoading(false);
    }
  };

  const handleCommitSelect = (commit: Commit) => {
    setSelectedCommit(commit);
    setActiveView('commit');
  };

  const handleFileSelect = (filePath: string, commitHash: string) => {
    setSelectedFile({ path: filePath, commit: commitHash });
    setActiveView('code');
  };

  const handleBranchChange = () => {
    loadRepoInfo();
  };

  if (loading) {
    return (
      <div className="repository-view loading">
        <div className="loading-spinner">Loading repository...</div>
      </div>
    );
  }

  if (error || !repoInfo) {
    return (
      <div className="repository-view error">
        <div className="error-container">
          <AlertCircle size={48} className="error-icon" />
          <h2>Failed to Load Repository</h2>
          <p>{error || 'Unknown error'}</p>
          <button onClick={onClose} className="primary-button">Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="repository-view">
      <header className="repo-header">
        <div className="repo-header-left">
          <button onClick={onClose} className="icon-button" title="Close repository">
            <X size={20} />
          </button>
          <div className="repo-info">
            <h1>{repoPath.split('/').pop()}</h1>
            <span className="repo-path">{repoPath}</span>
          </div>
        </div>
        <div className="repo-header-right">
          <div className="repo-stats">
            <span className="stat">
              <GitBranch size={16} />
              {repoInfo.branches.length} branches
            </span>
            <span className="stat">
              <GitCommit size={16} />
              {repoInfo.totalCommits} commits
            </span>
            <span className="stat current-branch">
              Current: {repoInfo.currentBranch}
            </span>
          </div>
        </div>
      </header>

      <div className="repo-content">
        <nav className="repo-nav">
          <button
            className={activeView === 'graph' ? 'active' : ''}
            onClick={() => setActiveView('graph')}
          >
            <GitCommit size={18} />
            Commit Graph
          </button>
          <button
            className={activeView === 'branches' ? 'active' : ''}
            onClick={() => setActiveView('branches')}
          >
            <GitBranch size={18} />
            Branches
          </button>
          {selectedCommit && (
            <button
              className={activeView === 'commit' ? 'active' : ''}
              onClick={() => setActiveView('commit')}
            >
              <GitCommit size={18} />
              Commit Details
            </button>
          )}
          {selectedFile && (
            <button
              className={activeView === 'code' ? 'active' : ''}
              onClick={() => setActiveView('code')}
            >
              <FileCode size={18} />
              Code Viewer
            </button>
          )}
        </nav>

        <main className="repo-main">
          {activeView === 'graph' && (
            <CommitGraph
              repoPath={repoPath}
              commits={repoInfo.commits}
              branches={repoInfo.branches}
              onCommitSelect={handleCommitSelect}
              onFileSelect={handleFileSelect}
            />
          )}
          {activeView === 'branches' && (
            <BranchManager
              repoPath={repoPath}
              branches={repoInfo.branches}
              currentBranch={repoInfo.currentBranch}
              onBranchChange={handleBranchChange}
            />
          )}
          {activeView === 'commit' && selectedCommit && (
            <CommitDetails
              repoPath={repoPath}
              commit={selectedCommit}
              onFileSelect={handleFileSelect}
            />
          )}
          {activeView === 'code' && selectedFile && (
            <CodeViewer
              repoPath={repoPath}
              filePath={selectedFile.path}
              commitHash={selectedFile.commit}
            />
          )}
        </main>
      </div>
    </div>
  );
}
