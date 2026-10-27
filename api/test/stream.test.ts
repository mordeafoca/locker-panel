import type { AddressInfo } from 'node:net';
import { describe, it, expect } from 'vitest';
import { buildApp } from './helpers/build-app.js';
import { useTestDatabase } from './helpers/test-database.js';

useTestDatabase();

async function readUntil(reader: ReadableStreamDefaultReader<Uint8Array>, marker: string) {
  const decoder = new TextDecoder();
  let text = '';
  while (!text.includes(marker)) {
    const { value, done } = await reader.read();
    if (done) break;
    text += decoder.decode(value);
  }
  return text;
}

describe('GET /stream', () => {
  it('envia um evento "change" quando uma encomenda é criada', async () => {
    const server = buildApp().listen(0);
    const { port } = server.address() as AddressInfo;
    const base = `http://127.0.0.1:${port}`;
    const controller = new AbortController();

    try {
      const res = await fetch(`${base}/stream`, { signal: controller.signal });
      expect(res.headers.get('content-type')).toContain('text/event-stream');

      await fetch(`${base}/parcels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'P1', size: 'S', carrier: 'rapidex' }),
      });
      const text = await readUntil(res.body!.getReader(), 'event: change');

      expect(text).toContain('"type":"parcel_created"');
      expect(text).toContain('"parcelId":"P1"');
    } finally {
      controller.abort();
      server.closeAllConnections();
      server.close();
    }
  });
});