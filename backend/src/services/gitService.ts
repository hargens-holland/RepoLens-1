import simpleGit, { SimpleGit, LogResult } from 'simple-git';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
  parents: string[];
  branches: string[];
  tags: string[];
}

export interface Branch {
  name: string;
  commit: string;
  isRemote: boolean;
  isCurrent: boolean;
}

export interface RepoInfo {
  path: string;
  currentBranch: string;
  branches: Branch[];
  commits: Commit[];
  totalCommits: number;
}

export class GitService {
  private git: SimpleGit;

  constructor(repoPath: string) {
    this.git = simpleGit(repoPath);
  }

  async getRepoInfo(): Promise<RepoInfo> {
    const [branches, currentBranch, log] = await Promise.all([
      this.getBranches(),
      this.git.revparse(['--abbrev-ref', 'HEAD']),
      this.getCommitHistory(),
    ]);

    return {
      path: this.git.cwd(),
      currentBranch: currentBranch.trim(),
      branches,
      commits: log,
      totalCommits: log.length,
    };
  }

  async getBranches(): Promise<Branch[]> {
    const branchSummary = await this.git.branchLocal();
    const remoteBranches = await this.git.branch(['-r']);
    const currentBranch = (await this.git.revparse(['--abbrev-ref', 'HEAD'])).trim();

    const branches: Branch[] = [];

    // Local branches
    for (const [name, branch] of Object.entries(branchSummary.branches)) {
      branches.push({
        name,
        commit: branch.commit,
        isRemote: false,
        isCurrent: name === currentBranch,
      });
    }

    // Remote branches
    for (const [name, branch] of Object.entries(remoteBranches.branches)) {
      const cleanName = name.replace(/^origin\//, '');
      if (!branches.find(b => b.name === cleanName && !b.isRemote)) {
        branches.push({
          name: cleanName,
          commit: branch.commit,
          isRemote: true,
          isCurrent: false,
        });
      }
    }

    return branches;
  }

  async getCommitHistory(limit: number = 1000): Promise<Commit[]> {
    const log = await this.git.log({ maxCount: limit });
    const branches = await this.getBranches();
    const tags = await this.getTags();

    // Create a map of commit hash to branch names
    const commitToBranches = new Map<string, string[]>();
    for (const branch of branches) {
      const commitHash = branch.commit;
      if (!commitToBranches.has(commitHash)) {
        commitToBranches.set(commitHash, []);
      }
      commitToBranches.get(commitHash)!.push(branch.name);
    }

    // Create a map of commit hash to tags
    const commitToTags = new Map<string, string[]>();
    for (const [tag, commit] of Object.entries(tags)) {
      if (!commitToTags.has(commit)) {
        commitToTags.set(commit, []);
      }
      commitToTags.get(commit)!.push(tag);
    }

    return log.all.map(commit => ({
      hash: commit.hash,
      message: commit.message,
      author: commit.author_name,
      date: commit.date,
      parents: commit.diff?.parent || [],
      branches: commitToBranches.get(commit.hash) || [],
      tags: commitToTags.get(commit.hash) || [],
    }));
  }

  async getTags(): Promise<Record<string, string>> {
    try {
      const tags = await this.git.tags();
      const tagMap: Record<string, string> = {};
      
      for (const tag of tags.all) {
        try {
          const hash = await this.git.revparse([tag]);
          tagMap[tag] = hash.trim();
        } catch {
          // Skip tags that can't be resolved
        }
      }
      
      return tagMap;
    } catch {
      return {};
    }
  }

  async getCommitDetails(hash: string): Promise<any> {
    const [show, diff] = await Promise.all([
      this.git.show([hash, '--stat', '--format=%H%n%an%n%ae%n%ad%n%s%n%b']),
      this.git.show([hash, '--name-status']),
    ]);

    const lines = show.split('\n');
    const commitHash = lines[0];
    const authorName = lines[1];
    const authorEmail = lines[2];
    const date = lines[3];
    const subject = lines[4];
    const body = lines.slice(5).join('\n');

    return {
      hash: commitHash,
      author: authorName,
      email: authorEmail,
      date,
      subject,
      body,
      diff,
      stat: show,
    };
  }

  async getFileAtCommit(filePath: string, commitHash: string): Promise<string> {
    try {
      const content = await this.git.show([`${commitHash}:${filePath}`]);
      return content;
    } catch (error) {
      throw new Error(`File not found at commit ${commitHash}: ${filePath}`);
    }
  }

  async getFileTree(commitHash?: string): Promise<any[]> {
    const ref = commitHash || 'HEAD';
    const tree = await this.git.raw(['ls-tree', '-r', '--name-only', ref]);
    return tree.trim().split('\n').filter(Boolean);
  }

  async deleteBranch(branchName: string, force: boolean = false): Promise<void> {
    if (force) {
      await this.git.branch(['-D', branchName]);
    } else {
      await this.git.branch(['-d', branchName]);
    }
  }

  async renameBranch(oldName: string, newName: string): Promise<void> {
    await this.git.branch(['-m', oldName, newName]);
  }

  async checkoutCommit(hash: string): Promise<void> {
    await this.git.checkout(hash);
  }

  async checkoutBranch(branchName: string): Promise<void> {
    await this.git.checkout(branchName);
  }

  async getDiff(commitHash: string): Promise<string> {
    return await this.git.show([commitHash]);
  }

  async getCommitGraph(): Promise<string> {
    const graph = await this.git.raw(['log', '--graph', '--oneline', '--all', '--decorate']);
    return graph;
  }
}
