import { describe, expect, it, afterAll } from 'vitest';
import request from 'supertest';
import { prisma } from '../src/config/db.js';
import { getApp, newEmail } from './helpers.js';

const app = getApp();

afterAll(async () => {
  await prisma.$disconnect();
});

describe('auth', () => {
  it('rejects signup with a weak password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'X', email: newEmail(), password: 'short', role: 'PLAYER' });
    expect(res.status).toBe(400);
  });

  it('creates a user, returns a token, and /me works', async () => {
    const email = newEmail();
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Auth Test', email, password: 'Password123!', role: 'PLAYER' });
    expect(signup.status).toBe(201);
    expect(signup.body.token).toBeTypeOf('string');
    expect(signup.body.user.email).toBe(email);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${signup.body.token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);
  });

  it('rejects /me without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects duplicate signup', async () => {
    const email = newEmail();
    await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Dup', email, password: 'Password123!', role: 'PLAYER' });
    const second = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Dup', email, password: 'Password123!', role: 'PLAYER' });
    expect(second.status).toBe(409);
  });
});
