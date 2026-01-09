# Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm run install:all
   ```

2. **Start development servers**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

4. **Load a repository**
   Enter the absolute path to a Git repository (e.g., `/Users/username/projects/my-repo`)

## Troubleshooting

### Backend won't start
- Ensure Node.js 20+ is installed: `node --version`
- Check that port 3001 is not in use
- Verify Git is installed: `git --version`

### Frontend won't start
- Ensure all dependencies are installed: `cd frontend && npm install`
- Check that port 3000 is not in use
- Clear browser cache if experiencing issues

### Repository not loading
- Verify the path is absolute (starts with `/` on Mac/Linux, `C:\` on Windows)
- Ensure the path points to a valid Git repository (contains `.git` folder)
- Check file system permissions

### Git operations failing
- Ensure you have write permissions to the repository
- Some operations (like deleting branches) require the branch to be merged
- Check that you're not trying to delete the current branch

## Development Tips

- The backend API runs on port 3001
- The frontend dev server runs on port 3000
- Hot reload is enabled for both frontend and backend
- Check browser console and terminal for error messages
