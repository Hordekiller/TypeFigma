import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import express from 'express';
import * as http from 'node:http';
import { FileAnnotationStore } from '../store/file-store.js';
import { createAnnotationRouter } from '../routes/annotations.js';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';

function makeValidBody() {
  return {
    schemaVersion: 1,
    figmaFileKey: 'test-key',
    annotations: [
      { figmaNodeId: 'n1', domSelector: '[data-tf-node-id="n1"]', role: 'header', source: 'auto', confidence: 0.9, updatedAt: '2025-01-01T00:00:00.000Z' },
    ],
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };
}

function fetchUrl(url: string, options?: RequestInit): Promise<Response> {
  return fetch(url, options);
}

describe('annotation routes', () => {
  const testDir = path.join(process.cwd(), '.test-annotations-routes');
  const store = new FileAnnotationStore(testDir);
  let server: http.Server;
  let baseUrl: string;

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    const app = express();
    app.use(express.json());
    app.use('/api/projects', createAnnotationRouter(store));
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://localhost:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterEach(async () => {
    server?.close();
    await fs.rm(testDir, { recursive: true, force: true });
  });

  it('PUT returns 200 for valid body', async () => {
    const res = await fetchUrl(`${baseUrl}/api/projects/proj-1/annotations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(makeValidBody()),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('PUT returns 400 for invalid body', async () => {
    const res = await fetchUrl(`${baseUrl}/api/projects/proj-1/annotations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ not: 'valid' }),
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid annotation set');
  });

  it('GET returns 404 for missing project', async () => {
    const res = await fetchUrl(`${baseUrl}/api/projects/nonexistent/annotations`);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe('Annotations not found');
  });

  it('GET returns saved annotations after PUT', async () => {
    const body = makeValidBody();
    const putRes = await fetchUrl(`${baseUrl}/api/projects/proj-2/annotations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    expect(putRes.status).toBe(200);

    const getRes = await fetchUrl(`${baseUrl}/api/projects/proj-2/annotations`);
    expect(getRes.status).toBe(200);
    const json = await getRes.json();
    expect(json.figmaFileKey).toBe('test-key');
    expect(json.annotations).toHaveLength(1);
  });

  it('GET returns updated annotations after second PUT', async () => {
    const body1 = makeValidBody();
    const body2 = makeValidBody();
    body2.annotations[0].role = 'footer';
    body2.updatedAt = '2025-01-02T00:00:00.000Z';

    await fetchUrl(`${baseUrl}/api/projects/proj-3/annotations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body1),
    });
    await fetchUrl(`${baseUrl}/api/projects/proj-3/annotations`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body2),
    });

    const getRes = await fetchUrl(`${baseUrl}/api/projects/proj-3/annotations`);
    const json = await getRes.json();
    expect(json.annotations[0].role).toBe('footer');
  });
});
