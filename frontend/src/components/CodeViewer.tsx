import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { api } from '../services/api';
import { FileText, Loader, AlertCircle } from 'lucide-react';
import './CodeViewer.css';

interface CodeViewerProps {
  repoPath: string;
  filePath: string;
  commitHash: string;
}

export function CodeViewer({ repoPath, filePath, commitHash }: CodeViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('');

  useEffect(() => {
    loadFile();
  }, [repoPath, filePath, commitHash]);

  useEffect(() => {
    // Detect language from file extension
    const ext = filePath.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'ts': 'typescript',
      'tsx': 'typescript',
      'js': 'javascript',
      'jsx': 'javascript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
      'scala': 'scala',
      'sh': 'shell',
      'bash': 'bash',
      'zsh': 'shell',
      'yaml': 'yaml',
      'yml': 'yaml',
      'json': 'json',
      'xml': 'xml',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'md': 'markdown',
      'sql': 'sql',
      'dockerfile': 'dockerfile',
      'makefile': 'makefile',
    };
    setLanguage(langMap[ext || ''] || 'plaintext');
  }, [filePath]);

  const loadFile = async () => {
    setLoading(true);
    setError(null);
    try {
      const fileContent = await api.getFileAtCommit(repoPath, filePath, commitHash);
      setContent(fileContent);
    } catch (err: any) {
      setError(err.message || 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="code-viewer loading">
        <Loader className="spinner" size={32} />
        <p>Loading file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="code-viewer error">
        <AlertCircle size={48} className="error-icon" />
        <h3>Failed to Load File</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="code-viewer">
      <div className="code-viewer-header">
        <div className="file-info">
          <FileText size={18} />
          <div>
            <div className="file-path">{filePath}</div>
            <div className="file-commit">Commit: {commitHash.substring(0, 7)}</div>
          </div>
        </div>
        <div className="file-language">{language}</div>
      </div>
      <div className="code-viewer-content">
        <Editor
          height="100%"
          language={language}
          value={content}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
