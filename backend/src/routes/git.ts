import { Router } from 'express';
import { GitService } from '../services/gitService.js';
import path from 'path';
import { z } from 'zod';

const router = Router();

const repoPathSchema = z.object({
  repoPath: z.string().min(1),
});

const commitHashSchema = z.object({
  hash: z.string().regex(/^[a-f0-9]+$/i),
});

const branchSchema = z.object({
  branchName: z.string().min(1),
});

// Get repository information
router.post('/info', async (req, res) => {
  try {
    const { repoPath } = repoPathSchema.parse(req.body);
    const gitService = new GitService(repoPath);
    const info = await gitService.getRepoInfo();
    res.json(info);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get commit history
router.post('/history', async (req, res) => {
  try {
    const { repoPath, limit } = { ...repoPathSchema.parse(req.body), limit: req.body.limit || 1000 };
    const gitService = new GitService(repoPath);
    const commits = await gitService.getCommitHistory(limit);
    res.json(commits);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get branches
router.post('/branches', async (req, res) => {
  try {
    const { repoPath } = repoPathSchema.parse(req.body);
    const gitService = new GitService(repoPath);
    const branches = await gitService.getBranches();
    res.json(branches);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get commit details
router.post('/commit', async (req, res) => {
  try {
    const { repoPath, hash } = { ...repoPathSchema.parse(req.body), ...commitHashSchema.parse(req.body) };
    const gitService = new GitService(repoPath);
    const details = await gitService.getCommitDetails(hash);
    res.json(details);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get file at specific commit
router.post('/file', async (req, res) => {
  try {
    const { repoPath, filePath, commitHash } = z.object({
      repoPath: z.string().min(1),
      filePath: z.string().min(1),
      commitHash: z.string().regex(/^[a-f0-9]+$/i),
    }).parse(req.body);
    
    const gitService = new GitService(repoPath);
    const content = await gitService.getFileAtCommit(filePath, commitHash);
    res.json({ content, filePath, commitHash });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get file tree
router.post('/tree', async (req, res) => {
  try {
    const { repoPath, commitHash } = { ...repoPathSchema.parse(req.body), commitHash: req.body.commitHash };
    const gitService = new GitService(repoPath);
    const tree = await gitService.getFileTree(commitHash);
    res.json(tree);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete branch
router.post('/branch/delete', async (req, res) => {
  try {
    const { repoPath, branchName, force } = { ...repoPathSchema.parse(req.body), ...branchSchema.parse(req.body), force: req.body.force || false };
    const gitService = new GitService(repoPath);
    await gitService.deleteBranch(branchName, force);
    res.json({ success: true, message: `Branch ${branchName} deleted successfully` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Rename branch
router.post('/branch/rename', async (req, res) => {
  try {
    const { repoPath, oldName, newName } = z.object({
      repoPath: z.string().min(1),
      oldName: z.string().min(1),
      newName: z.string().min(1),
    }).parse(req.body);
    
    const gitService = new GitService(repoPath);
    await gitService.renameBranch(oldName, newName);
    res.json({ success: true, message: `Branch ${oldName} renamed to ${newName}` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Checkout commit
router.post('/checkout/commit', async (req, res) => {
  try {
    const { repoPath, hash } = { ...repoPathSchema.parse(req.body), ...commitHashSchema.parse(req.body) };
    const gitService = new GitService(repoPath);
    await gitService.checkoutCommit(hash);
    res.json({ success: true, message: `Checked out commit ${hash}` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Checkout branch
router.post('/checkout/branch', async (req, res) => {
  try {
    const { repoPath, branchName } = { ...repoPathSchema.parse(req.body), ...branchSchema.parse(req.body) };
    const gitService = new GitService(repoPath);
    await gitService.checkoutBranch(branchName);
    res.json({ success: true, message: `Checked out branch ${branchName}` });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export { router as gitRouter };
