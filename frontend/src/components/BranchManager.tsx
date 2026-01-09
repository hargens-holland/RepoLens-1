import { useState } from 'react';
import { api, Branch } from '../services/api';
import { Trash2, Edit2, GitBranch, AlertCircle, CheckCircle, X } from 'lucide-react';
import './BranchManager.css';

interface BranchManagerProps {
  repoPath: string;
  branches: Branch[];
  currentBranch: string;
  onBranchChange: () => void;
}

export function BranchManager({ repoPath, branches, currentBranch, onBranchChange }: BranchManagerProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<{ branch: string; force: boolean } | null>(null);
  const [commandPreview, setCommandPreview] = useState<string>('');

  const handleDeleteClick = (branch: Branch) => {
    if (branch.isCurrent) {
      setError('Cannot delete the current branch');
      return;
    }
    const force = branch.isRemote || false; // Allow force delete for remote branches
    setCommandPreview(`git branch ${force ? '-D' : '-d'} ${branch.name}`);
    setShowConfirm({ branch: branch.name, force });
  };

  const handleDeleteConfirm = async () => {
    if (!showConfirm) return;

    setDeleting(showConfirm.branch);
    setError(null);

    try {
      await api.deleteBranch(repoPath, showConfirm.branch, showConfirm.force);
      setShowConfirm(null);
      setCommandPreview('');
      onBranchChange();
    } catch (err: any) {
      setError(err.message || 'Failed to delete branch');
    } finally {
      setDeleting(null);
    }
  };

  const handleRenameClick = (branch: Branch) => {
    setRenaming(branch.name);
    setNewName(branch.name);
    setError(null);
  };

  const handleRenameConfirm = async () => {
    if (!renaming || !newName.trim() || newName === renaming) {
      setRenaming(null);
      return;
    }

    setError(null);
    setCommandPreview(`git branch -m ${renaming} ${newName}`);

    try {
      await api.renameBranch(repoPath, renaming, newName.trim());
      setRenaming(null);
      setNewName('');
      setCommandPreview('');
      onBranchChange();
    } catch (err: any) {
      setError(err.message || 'Failed to rename branch');
    }
  };

  const handleCheckout = async (branchName: string) => {
    if (branchName === currentBranch) return;

    setError(null);
    setCommandPreview(`git checkout ${branchName}`);

    try {
      await api.checkoutBranch(repoPath, branchName);
      setCommandPreview('');
      onBranchChange();
    } catch (err: any) {
      setError(err.message || 'Failed to checkout branch');
      setCommandPreview('');
    }
  };

  const localBranches = branches.filter(b => !b.isRemote);
  const remoteBranches = branches.filter(b => b.isRemote);

  return (
    <div className="branch-manager">
      {commandPreview && (
        <div className="command-preview">
          <div className="command-preview-content">
            <span className="command-label">Command to execute:</span>
            <code className="command-text">{commandPreview}</code>
          </div>
        </div>
      )}

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="branch-sections">
        <section className="branch-section">
          <h2>
            <GitBranch size={18} />
            Local Branches ({localBranches.length})
          </h2>
          <div className="branch-list">
            {localBranches.map(branch => (
              <div
                key={branch.name}
                className={`branch-item ${branch.isCurrent ? 'current' : ''}`}
              >
                <div className="branch-info">
                  <div className="branch-name">
                    {branch.name}
                    {branch.isCurrent && <span className="current-badge">Current</span>}
                  </div>
                  <div className="branch-commit">{branch.commit.substring(0, 7)}</div>
                </div>
                <div className="branch-actions">
                  {!branch.isCurrent && (
                    <button
                      onClick={() => handleCheckout(branch.name)}
                      className="action-button checkout"
                      title="Checkout branch"
                    >
                      Checkout
                    </button>
                  )}
                  <button
                    onClick={() => handleRenameClick(branch)}
                    className="action-button rename"
                    disabled={branch.isCurrent}
                    title="Rename branch"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(branch)}
                    className="action-button delete"
                    disabled={branch.isCurrent || deleting === branch.name}
                    title="Delete branch"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {remoteBranches.length > 0 && (
          <section className="branch-section">
            <h2>
              <GitBranch size={18} />
              Remote Branches ({remoteBranches.length})
            </h2>
            <div className="branch-list">
              {remoteBranches.map(branch => (
                <div key={branch.name} className="branch-item remote">
                  <div className="branch-info">
                    <div className="branch-name">{branch.name}</div>
                    <div className="branch-commit">{branch.commit.substring(0, 7)}</div>
                  </div>
                  <div className="branch-actions">
                    <button
                      onClick={() => handleCheckout(branch.name)}
                      className="action-button checkout"
                      title="Checkout branch"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {renaming && (
        <div className="modal-overlay" onClick={() => setRenaming(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Rename Branch</h3>
            <div className="modal-content">
              <label>New name:</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRenameConfirm()}
                autoFocus
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setRenaming(null)} className="secondary-button">
                Cancel
              </button>
              <button onClick={handleRenameConfirm} className="primary-button">
                Rename
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay" onClick={() => setShowConfirm(null)}>
          <div className="modal danger" onClick={(e) => e.stopPropagation()}>
            <h3>
              <AlertCircle size={20} />
              Delete Branch
            </h3>
            <div className="modal-content">
              <p>Are you sure you want to delete branch <strong>{showConfirm.branch}</strong>?</p>
              {showConfirm.force && (
                <p className="warning-text">This will force delete the branch (unmerged changes will be lost).</p>
              )}
              <div className="command-preview-box">
                <code>{commandPreview}</code>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowConfirm(null)} className="secondary-button">
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="danger-button"
                disabled={deleting === showConfirm.branch}
              >
                {deleting === showConfirm.branch ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
