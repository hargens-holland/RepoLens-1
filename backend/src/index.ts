import express from 'express';
import cors from 'cors';
import { gitRouter } from './routes/git.js';
import { repoRouter } from './routes/repo.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/git', gitRouter);
app.use('/api/repo', repoRouter);

app.listen(PORT, () => {
  console.log(`🚀 RepoLens backend running on http://localhost:${PORT}`);
});
