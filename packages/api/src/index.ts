import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate theme endpoint
app.post('/api/generate', async (req, res) => {
  const { figmaUrl, figmaToken } = req.body;

  if (!figmaUrl || !figmaToken) {
    return res.status(400).json({
      error: 'Missing required fields: figmaUrl, figmaToken',
    });
  }

  res.json({
    message: 'Generation started',
    status: 'processing',
    // TODO: Implement async pipeline execution
  });
});

app.listen(PORT, () => {
  console.log(`TypeFigma API running on http://localhost:${PORT}`);
});
