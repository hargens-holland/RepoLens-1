import { Router } from 'express';
import { access } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import simpleGit from 'simple-git';

const router = Router();

// Validate repository path
router.post('/validate', async (req, res) => {
  try {
    const { repoPath } = req.body;
    
    if (!repoPath || typeof repoPath !== 'string') {
      return res.status(400).json({ error: 'Invalid repository path' });
    }

    // Check if path exists and is accessible
    try {
      await access(repoPath, constants.R_OK);
    } catch {
      return res.status(404).json({ error: 'Repository path not found or not accessible' });
    }

    // Check if it's a Git repository
    const git = simpleGit(repoPath);
    const isRepo = await git.checkIsRepo();

    if (!isRepo) {
      return res.status(400).json({ error: 'Path is not a Git repository' });
    }

    res.json({ valid: true, path: repoPath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as repoRouter };
