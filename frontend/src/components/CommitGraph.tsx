import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Commit, Branch } from '../services/api';
import './CommitGraph.css';

interface CommitGraphProps {
  repoPath: string;
  commits: Commit[];
  branches: Branch[];
  onCommitSelect: (commit: Commit) => void;
  onFileSelect: (filePath: string, commitHash: string) => void;
}

export function CommitGraph({ commits, branches, onCommitSelect, onFileSelect }: CommitGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!svgRef.current || !commits.length || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth || 1200;
    const height = containerRef.current.clientHeight || 800;
    svg.attr('width', width).attr('height', height);
    
    const margin = { top: 40, right: 40, bottom: 40, left: 200 };

    const g = svg.append('g');

    // Create a map of commits by hash
    const commitMap = new Map<string, Commit>();
    commits.forEach(commit => commitMap.set(commit.hash, commit));

    // Build parent-child relationships
    const children = new Map<string, string[]>();
    commits.forEach(commit => {
      commit.parents.forEach(parent => {
        if (!children.has(parent)) {
          children.set(parent, []);
        }
        children.get(parent)!.push(commit.hash);
      });
    });

    // Calculate layout using a simple topological sort
    const levels = new Map<string, number>();
    const visited = new Set<string>();

    const calculateLevel = (hash: string): number => {
      if (levels.has(hash)) return levels.get(hash)!;
      if (visited.has(hash)) return 0;
      visited.add(hash);

      const commit = commitMap.get(hash);
      if (!commit || !commit.parents.length) {
        levels.set(hash, 0);
        return 0;
      }

      const parentLevels = commit.parents.map(p => calculateLevel(p));
      const level = Math.max(...parentLevels) + 1;
      levels.set(hash, level);
      return level;
    };

    commits.forEach(commit => calculateLevel(commit.hash));

    // Group commits by level
    const commitsByLevel = new Map<number, Commit[]>();
    commits.forEach(commit => {
      const level = levels.get(commit.hash) || 0;
      if (!commitsByLevel.has(level)) {
        commitsByLevel.set(level, []);
      }
      commitsByLevel.get(level)!.push(commit);
    });

    const maxLevel = Math.max(...Array.from(commitsByLevel.keys()));
    const levelWidth = (width - margin.left - margin.right) / Math.max(maxLevel + 1, 1);
    const commitSpacing = 60;

    // Position commits
    const positions = new Map<string, { x: number; y: number }>();
    const levelPositions = new Map<number, number>();

    commitsByLevel.forEach((levelCommits, level) => {
      const x = margin.left + level * levelWidth;
      let y = margin.top;

      levelCommits.forEach((commit, idx) => {
        if (!levelPositions.has(level)) {
          levelPositions.set(level, 0);
        }
        y = margin.top + levelPositions.get(level)! * commitSpacing;
        positions.set(commit.hash, { x, y });
        levelPositions.set(level, levelPositions.get(level)! + 1);
      });
    });

    // Draw edges
    commits.forEach(commit => {
      commit.parents.forEach(parent => {
        const parentPos = positions.get(parent);
        const commitPos = positions.get(commit.hash);
        if (parentPos && commitPos) {
          const line = g.append('line')
            .attr('x1', parentPos.x)
            .attr('y1', parentPos.y)
            .attr('x2', commitPos.x)
            .attr('y2', commitPos.y)
            .attr('stroke', '#30363d')
            .attr('stroke-width', 2);

          // Highlight if selected
          if (selectedCommit === commit.hash || selectedCommit === parent) {
            line.attr('stroke', '#58a6ff').attr('stroke-width', 3);
          }
        }
      });
    });

    // Draw commits
    const commitNodes = g.selectAll('.commit')
      .data(commits)
      .enter()
      .append('g')
      .attr('class', 'commit-node')
      .attr('transform', d => {
        const pos = positions.get(d.hash);
        return pos ? `translate(${pos.x}, ${pos.y})` : 'translate(0,0)';
      })
      .style('cursor', 'pointer');

    commitNodes.append('circle')
      .attr('r', 8)
      .attr('fill', d => {
        if (selectedCommit === d.hash) return '#58a6ff';
        if (d.branches.length > 0) return '#3fb950';
        return '#8b949e';
      })
      .attr('stroke', d => selectedCommit === d.hash ? '#79c0ff' : '#30363d')
      .attr('stroke-width', d => selectedCommit === d.hash ? 2 : 1);

    commitNodes.append('text')
      .attr('x', 15)
      .attr('y', 4)
      .attr('fill', '#c9d1d9')
      .attr('font-size', '12px')
      .text(d => d.hash.substring(0, 7));

    commitNodes.append('title')
      .text(d => `${d.hash}\n${d.message}\n${d.author}\n${new Date(d.date).toLocaleString()}`);

    // Add branch labels
    branches.forEach(branch => {
      const commit = commits.find(c => c.hash === branch.commit);
      if (commit) {
        const pos = positions.get(commit.hash);
        if (pos) {
          g.append('text')
            .attr('x', pos.x + 15)
            .attr('y', pos.y - 10)
            .attr('fill', branch.isCurrent ? '#58a6ff' : '#8b949e')
            .attr('font-size', '11px')
            .attr('font-weight', branch.isCurrent ? '600' : '400')
            .text(branch.name);
        }
      }
    });

    // Add interactions
    commitNodes.on('click', (event, d) => {
      setSelectedCommit(d.hash);
      onCommitSelect(d);
    });

    // Zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

  }, [commits, branches, selectedCommit, zoom, onCommitSelect]);

  return (
    <div className="commit-graph" ref={containerRef}>
      <div className="graph-controls">
        <div className="zoom-info">Zoom: {(zoom * 100).toFixed(0)}%</div>
        <div className="graph-hint">Click commits to view details • Scroll to zoom • Drag to pan</div>
      </div>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
}
