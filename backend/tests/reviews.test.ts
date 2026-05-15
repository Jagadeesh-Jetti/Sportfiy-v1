import { describe, expect, it, afterAll } from 'vitest';
import request from 'supertest';
import { addDays } from 'date-fns';
import { prisma } from '../src/config/db.js';
import { getApp, createMerchantWithVenue, createPlayer } from './helpers.js';

const app = getApp();

afterAll(async () => {
  await prisma.$disconnect();
});

describe('reviews', () => {
  it('rejects a review from a player who has not played at the venue', async () => {
    const { venue } = await createMerchantWithVenue();
    const player = await createPlayer();

    const res = await request(app)
      .post(`/api/reviews/venue/${venue.id}`)
      .set('Authorization', `Bearer ${player.token}`)
      .send({ rating: 5, comment: 'Faking it.' });

    expect(res.status).toBe(403);
  });

  it('accepts a review from a player with a completed booking + updates the venue aggregate', async () => {
    const { venue, sport } = await createMerchantWithVenue();
    const player = await createPlayer();

    // Backdate a booking + slot so the slot's endTime is in the past.
    const past = addDays(new Date(), -1);
    const dateOnly = new Date(Date.UTC(past.getUTCFullYear(), past.getUTCMonth(), past.getUTCDate()));
    const startTime = new Date(dateOnly);
    startTime.setUTCHours(7, 0, 0, 0);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    const slot = await prisma.slot.create({
      data: { venueId: venue.id, date: dateOnly, startTime, endTime },
    });
    await prisma.booking.create({
      data: {
        userId: player.user.id,
        venueId: venue.id,
        sportId: sport.id,
        slotId: slot.id,
        status: 'CONFIRMED',
      },
    });

    const res = await request(app)
      .post(`/api/reviews/venue/${venue.id}`)
      .set('Authorization', `Bearer ${player.token}`)
      .send({ rating: 4, comment: 'Solid spot.' });

    expect(res.status).toBe(201);

    const venueAfter = await prisma.venue.findUnique({ where: { id: venue.id } });
    expect(venueAfter?.avgRating).toBe(4);
    expect(venueAfter?.reviewCount).toBe(1);
  });
});
