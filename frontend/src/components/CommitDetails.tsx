import { useState, useEffect } from 'react';
import { api, Commit } from '../services/api';
import { Calendar, User, Hash, FileText, Code, Loader } from 'lucide-react';
import './CommitDetails.css';

interface CommitDetailsProps {
  repoPath: string;
  commit: Commit;
  onFileSelect: (filePath: string, commitHash: string) => void;
}

export function CommitDetails({ repoPath, commit, onFileSelect }: CommitDetailsProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    loadCommitDetails();
    loadFileTree();
  }, [commit.hash]);

  const loadCommitDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const commitDetails = await api.getCommitDetails(repoPath, commit.hash);
      setDetails(commitDetails);
    } catch (err: any) {
      setError(err.message || 'Failed to load commit details');
    } finally {
      setLoading(false);
    }
  };

  const loadFileTree = async () => {
    try {
      const tree = await api.getFileTree(repoPath, commit.hash);
      setFiles(tree);
    } catch (err) {
      // Silently fail for file tree
    }
  };

  if (loading) {
    return (
      <div className="commit-details loading">
        <Loader className="spinner" size={32} />
        <p>Loading commit details...</p>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="commit-details error">
        <p>{error || 'Failed to load commit details'}</p>
      </div>
    );
  }

  const date = new Date(details.date).toLocaleString();

  return (
    <div className="commit-details">
      <div className="commit-header">
        <h2>{details.subject || commit.message.split('\n')[0]}</h2>
        <div className="commit-meta">
          <div className="meta-item">
            <Hash size={16} />
            <code>{commit.hash}</code>
          </div>
          <div className="meta-item">
            <User size={16} />
            <span>{details.author || commit.author}</span>
          </div>
          <div className="meta-item">
            <Calendar size={16} />
            <span>{date}</span>
          </div>
        </div>
      </div>

      {details.body && (
        <div className="commit-body">
          <h3>Description</h3>
          <pre>{details.body}</pre>
        </div>
      )}

      {details.diff && (
        <div className="commit-diff">
          <h3>
            <FileText size={18} />
            Changes
          </h3>
          <div className="diff-content">
            <pre>{details.diff}</pre>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="commit-files">
          <h3>
            <Code size={18} />
            Files ({files.length})
          </h3>
          <div className="file-list">
            {files.map((file, idx) => (
              <button
                key={idx}
                className="file-item"
                onClick={() => onFileSelect(file, commit.hash)}
              >
                <FileText size={16} />
                <span>{file}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {commit.branches.length > 0 && (
        <div className="commit-branches">
          <h3>Branches</h3>
          <div className="branch-tags">
            {commit.branches.map(branch => (
              <span key={branch} className="branch-tag">{branch}</span>
            ))}
          </div>
        </div>
      )}

      {commit.tags.length > 0 && (
        <div className="commit-tags">
          <h3>Tags</h3>
          <div className="branch-tags">
            {commit.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
