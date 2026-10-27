import { Router } from 'express';
import type { ChangeNotifier } from '../domain/change-notifier.js';

const HEARTBEAT_MS = 25_000;

export function streamRouter(notifier: ChangeNotifier): Router {
  const router = Router();

  router.get('/stream', (req, res) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.flushHeaders();
    res.write('retry: 3000\n\n');

    const unsubscribe = notifier.subscribe((change) => {
      res.write(`event: change\ndata: ${JSON.stringify(change)}\n\n`);
    });
    const heartbeat = setInterval(() => res.write(': ping\n\n'), HEARTBEAT_MS);

    req.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
    });
  });

  return router;
}