import { describe, expect, it, afterAll } from 'vitest';
import request from 'supertest';
import { addDays } from 'date-fns';
import { prisma } from '../src/config/db.js';
import { getApp, createMerchantWithVenue, createPlayer } from './helpers.js';

const app = getApp();

afterAll(async () => {
  await prisma.$disconnect();
});

describe('booking race condition', () => {
  it('10 concurrent POSTs against the same slot resolve to exactly 1 success', async () => {
    const { venue, sport } = await createMerchantWithVenue();
    const tomorrow = addDays(new Date(), 1);
    const dateOnly = new Date(
      Date.UTC(tomorrow.getUTCFullYear(), tomorrow.getUTCMonth(), tomorrow.getUTCDate()),
    );
    const startTime = new Date(dateOnly);
    startTime.setUTCHours(7, 0, 0, 0);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const slot = await prisma.slot.create({
      data: { venueId: venue.id, date: dateOnly, startTime, endTime },
    });

    // Spin up 10 distinct players so they each have their own token.
    const players = await Promise.all(
      Array.from({ length: 10 }, () => createPlayer()),
    );

    const responses = await Promise.all(
      players.map((p) =>
        request(app)
          .post('/api/bookings')
          .set('Authorization', `Bearer ${p.token}`)
          .send({ slotId: slot.id, sportId: sport.id }),
      ),
    );

    const successes = responses.filter((r) => r.status === 201).length;
    const conflicts = responses.filter((r) => r.status === 409).length;

    expect(successes).toBe(1);
    expect(successes + conflicts).toBe(10);
  });
});
