import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { buildApp } from './helpers/build-app.js';

describe('GET /health', () => {
    it('200 status ok', async () => {
        
        const res = await request(buildApp()).get('/health');

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok'});
    });
});