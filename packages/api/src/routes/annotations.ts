import { Router } from 'express';
import { isAnnotationSet } from '@typefigma/annotations';
import type { AnnotationStore } from '../store/types.js';

export function createAnnotationRouter(store: AnnotationStore): Router {
  const router = Router();

  router.put('/:id/annotations', async (req, res) => {
    const body = req.body;
    if (!isAnnotationSet(body)) {
      res.status(400).json({ error: 'Invalid annotation set', details: 'Body must match AnnotationSet schema' });
      return;
    }
    await store.save(req.params.id, body);
    res.json({ success: true });
  });

  router.get('/:id/annotations', async (req, res) => {
    const set = await store.load(req.params.id);
    if (!set) {
      res.status(404).json({ error: 'Annotations not found' });
      return;
    }
    res.json(set);
  });

  return router;
}
