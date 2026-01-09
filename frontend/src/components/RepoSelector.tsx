import { useState } from 'react';
import { api } from '../services/api';
import { FolderOpen, AlertCircle, CheckCircle } from 'lucide-react';
import './RepoSelector.css';

interface RepoSelectorProps {
  onSelect: (path: string) => void;
}

export function RepoSelector({ onSelect }: RepoSelectorProps) {
  const [path, setPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const handleValidate = async () => {
    if (!path.trim()) {
      setError('Please enter a repository path');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const result = await api.validateRepo(path.trim());
      if (result.valid) {
        onSelect(result.path);
      }
    } catch (err: any) {
      setError(err.message || 'Invalid repository path');
    } finally {
      setValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleValidate();
    }
  };

  return (
    <div className="repo-selector">
      <div className="repo-selector-content">
        <div className="repo-selector-header">
          <FolderOpen size={48} className="repo-icon" />
          <h1>RepoLens</h1>
          <p className="subtitle">Interactive Git Repository Visualization & Control</p>
        </div>

        <div className="repo-selector-form">
          <div className="input-group">
            <label htmlFor="repo-path">Repository Path</label>
            <input
              id="repo-path"
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="/path/to/your/repository"
              disabled={validating}
              autoFocus
            />
            <p className="input-hint">Enter the absolute path to your Git repository</p>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleValidate}
            disabled={validating || !path.trim()}
            className="primary-button"
          >
            {validating ? 'Validating...' : 'Load Repository'}
          </button>
        </div>

        <div className="repo-selector-features">
          <h3>Features</h3>
          <ul>
            <li><CheckCircle size={16} /> Visual commit history and branch structure</li>
            <li><CheckCircle size={16} /> Safe branch management (delete, rename)</li>
            <li><CheckCircle size={16} /> Explore code at any commit</li>
            <li><CheckCircle size={16} /> View commit details and diffs</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
