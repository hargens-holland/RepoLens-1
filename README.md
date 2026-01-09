# RepoLens

**Interactive Git Repository Visualization & Control Platform**

RepoLens transforms Git repositories into an interactive, visual workspace. Explore repository structure, history, and branches visually, while safely managing Git state through an intuitive UI.

![RepoLens](https://img.shields.io/badge/RepoLens-v1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)

## Features

### ✨ Core Features

- **📊 Visual Repository Timeline** - Interactive DAG-style visualization of commits and branches with zoom, pan, and filtering
- **🌳 Branch Management** - Safely delete, rename, and checkout branches through the UI with command preview
- **🔍 Commit Exploration** - Click any commit to view detailed metadata, diffs, and file changes
- **📝 Versioned Code Viewer** - View repository files as they existed at any commit with syntax highlighting
- **🛡️ Safety First** - All destructive operations require confirmation and show Git command previews

### 🎯 Key Capabilities

- Load local Git repositories
- Visualize commit history as an interactive graph
- See branch divergence and merge points
- Explore code at any point in history
- Manage branches without memorizing Git commands
- View commit details, diffs, and file trees

## Screenshots

*Visual commit graph with branch visualization*
*Branch management interface with delete/rename*
*Code viewer showing files at specific commits*

## Prerequisites

- **Node.js** 20+ and npm
- **Git** installed and accessible via command line
- A local Git repository to explore

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd RepoLens-Cursor
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

   This will install dependencies for both the frontend and backend.

## Usage

### Development Mode

Start both the frontend and backend in development mode:

```bash
npm run dev
```

This will:
- Start the backend server on `http://localhost:3001`
- Start the frontend dev server on `http://localhost:3000`

### Production Build

Build both frontend and backend:

```bash
npm run build
```

Start the production server:

```bash
cd backend && npm start
```

Then serve the frontend build (e.g., using a static file server or the preview command):

```bash
cd frontend && npm run preview
```

## How to Use

1. **Open RepoLens** - Navigate to `http://localhost:3000` in your browser
2. **Select Repository** - Enter the absolute path to your Git repository
3. **Explore** - Use the interactive graph to explore commits and branches
4. **Manage Branches** - Switch to the Branches view to delete, rename, or checkout branches
5. **View Commits** - Click any commit to see details, diffs, and file changes
6. **Read Code** - Click files in commit details to view code at that specific commit

## Project Structure

```
RepoLens-Cursor/
├── backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── index.ts      # Express server entry point
│   │   ├── routes/       # API route handlers
│   │   └── services/     # Git service layer
│   └── package.json
├── frontend/             # React/TypeScript frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/    # API client
│   │   ├── store/       # State management
│   │   └── App.tsx      # Main app component
│   └── package.json
└── package.json          # Root workspace config
```

## Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **D3.js** - Graph visualization
- **Monaco Editor** - Code viewer with syntax highlighting
- **Zustand** - State management
- **Lucide React** - Icons

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **simple-git** - Git operations
- **Zod** - Input validation

## API Endpoints

### Repository
- `POST /api/repo/validate` - Validate repository path

### Git Operations
- `POST /api/git/info` - Get repository information
- `POST /api/git/history` - Get commit history
- `POST /api/git/branches` - Get all branches
- `POST /api/git/commit` - Get commit details
- `POST /api/git/file` - Get file content at commit
- `POST /api/git/tree` - Get file tree at commit
- `POST /api/git/branch/delete` - Delete branch
- `POST /api/git/branch/rename` - Rename branch
- `POST /api/git/checkout/commit` - Checkout commit
- `POST /api/git/checkout/branch` - Checkout branch

## Safety Features

- ✅ All destructive operations require explicit confirmation
- ✅ Git command preview before execution
- ✅ Cannot delete current branch
- ✅ Force delete option for merged branches only
- ✅ Input validation on all API endpoints
- ✅ Error handling and user feedback

## Limitations

- Currently supports local repositories only
- Requires Git CLI to be installed
- Large repositories (10k+ commits) may have performance considerations
- No real-time collaboration in v1

## Future Enhancements

- [ ] Remote repository support (GitHub, GitLab)
- [ ] Embedded lightweight IDE for editing at commits
- [ ] Repository health analytics
- [ ] Multi-repo workspace
- [ ] Commit search and filtering
- [ ] Export visualization as image
- [ ] Branch protection rules
- [ ] Commit comparison view

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

Built with inspiration from Git visualization tools like GitKraken, SourceTree, and GitHub's network graph.

---

**Note**: This tool performs Git operations on your repositories. Always ensure you have backups and understand the implications of destructive operations before using them.
