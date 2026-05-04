import { PrismaClient, type Prisma } from '@prisma/client';
import bcrypt from 'bcrypt';
import { addDays, addMinutes } from 'date-fns';

const prisma = new PrismaClient();

// ────────── Sports ──────────
const SPORTS = [
  'Cricket',
  'Football',
  'Badminton',
  'Tennis',
  'Table Tennis',
  'Basketball',
  'Pickleball',
  'Swimming',
  'Squash',
  'Volleyball',
  'Futsal',
  'Hockey',
  'Box Cricket',
  'Snooker',
  'Skating',
];

// ────────── Demo accounts ──────────
const PASSWORD = 'Password123!';

const MERCHANTS = [
  { email: 'merchant@sportify.dev', name: 'Demo Merchant' },
  { email: 'arjun.venues@sportify.dev', name: 'Arjun Mehta' },
  { email: 'priya.sportshub@sportify.dev', name: 'Priya Iyer' },
  { email: 'rohit.turfs@sportify.dev', name: 'Rohit Singh' },
];

// ────────── Cities + neighborhoods (Hyderabad + Bengaluru only) ──────────
type Neighborhood = { name: string; lat: number; lng: number };

const ALLOWED_CITIES = ['Bengaluru', 'Hyderabad'] as const;

const CITIES: Record<(typeof ALLOWED_CITIES)[number], Neighborhood[]> = {
  Bengaluru: [
    { name: 'Indiranagar', lat: 12.9716, lng: 77.6411 },
    { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
    { name: 'Whitefield', lat: 12.9698, lng: 77.75 },
    { name: 'HSR Layout', lat: 12.9116, lng: 77.6473 },
    { name: 'Marathahalli', lat: 12.956, lng: 77.7011 },
    { name: 'Jayanagar', lat: 12.9293, lng: 77.5825 },
    { name: 'Hebbal', lat: 13.035, lng: 77.597 },
    { name: 'Yelahanka', lat: 13.1007, lng: 77.5963 },
    { name: 'Bellandur', lat: 12.9258, lng: 77.6766 },
    { name: 'Banashankari', lat: 12.9255, lng: 77.5468 },
    { name: 'BTM Layout', lat: 12.9166, lng: 77.6101 },
    { name: 'Electronic City', lat: 12.8456, lng: 77.6603 },
    { name: 'Sarjapur Road', lat: 12.9108, lng: 77.6877 },
    { name: 'Rajajinagar', lat: 12.9914, lng: 77.5526 },
    { name: 'JP Nagar', lat: 12.9082, lng: 77.5855 },
  ],
  Hyderabad: [
    { name: 'Jubilee Hills', lat: 17.4316, lng: 78.408 },
    { name: 'Gachibowli', lat: 17.4401, lng: 78.3489 },
    { name: 'Banjara Hills', lat: 17.4156, lng: 78.4347 },
    { name: 'Hitech City', lat: 17.4435, lng: 78.3772 },
    { name: 'Kondapur', lat: 17.4647, lng: 78.367 },
    { name: 'Madhapur', lat: 17.4486, lng: 78.3908 },
    { name: 'Kompally', lat: 17.5403, lng: 78.4859 },
    { name: 'Manikonda', lat: 17.4036, lng: 78.3912 },
    { name: 'Miyapur', lat: 17.4924, lng: 78.3698 },
    { name: 'Begumpet', lat: 17.4441, lng: 78.4658 },
    { name: 'Secunderabad', lat: 17.4399, lng: 78.4983 },
    { name: 'Uppal', lat: 17.4046, lng: 78.5594 },
    { name: 'Kukatpally', lat: 17.4849, lng: 78.4138 },
    { name: 'Nallagandla', lat: 17.4565, lng: 78.3066 },
    { name: 'Financial District', lat: 17.4156, lng: 78.3375 },
  ],
};

// ────────── Venue archetypes ──────────
type Archetype = {
  suffix: string;
  description: string;
  sports: string[];
  priceRange: [number, number];
  hours: [number, number];
  images: string[];
};

const IMG = {
  turf: [
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80',
    'https://images.unsplash.com/photo-1551038247-3d9af20df552?w=900&q=80',
  ],
  cricket: [
    'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=900&q=80',
    'https://images.unsplash.com/photo-1593766827228-8a8b7fa86ee2?w=900&q=80',
  ],
  badminton: [
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=900&q=80',
    'https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=900&q=80',
  ],
  tennis: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=900&q=80',
    'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=900&q=80',
  ],
  pool: [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=900&q=80',
    'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=900&q=80',
  ],
  basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80',
    'https://images.unsplash.com/photo-1520975916090-3105956dac38?w=900&q=80',
  ],
  arena: [
    'https://images.unsplash.com/photo-1577412647305-991150c7d163?w=900&q=80',
    'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=900&q=80',
  ],
  squash: ['https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=80'],
};

const ARCHETYPES: Archetype[] = [
  {
    suffix: 'Sports Arena',
    description: 'Multi-sport facility with floodlit turf and indoor courts. Walk-in friendly.',
    sports: ['Football', 'Cricket', 'Badminton'],
    priceRange: [600, 1000],
    hours: [6, 23],
    images: [...IMG.arena, ...IMG.turf],
  },
  {
    suffix: 'Smash Club',
    description: 'Premium indoor badminton and table tennis. Feather shuttles available.',
    sports: ['Badminton', 'Table Tennis', 'Pickleball'],
    priceRange: [350, 650],
    hours: [7, 22],
    images: IMG.badminton,
  },
  {
    suffix: 'Tennis Academy',
    description: 'Hard and clay courts. Coaching slots on request. Racket rental ₹50.',
    sports: ['Tennis', 'Pickleball'],
    priceRange: [800, 1400],
    hours: [6, 21],
    images: IMG.tennis,
  },
  {
    suffix: 'Aquatic Centre',
    description: 'Olympic-size 50m pool with separate kids area. Lifeguard on duty.',
    sports: ['Swimming'],
    priceRange: [200, 400],
    hours: [5, 22],
    images: IMG.pool,
  },
  {
    suffix: 'Football Turf',
    description: '5-a-side and 7-a-side turfs. Floodlit. Free changing rooms.',
    sports: ['Football', 'Futsal'],
    priceRange: [800, 1500],
    hours: [6, 24],
    images: IMG.turf,
  },
  {
    suffix: 'Cricket Ground',
    description: 'Full pitch + practice nets. Bowling machine on request.',
    sports: ['Cricket', 'Box Cricket'],
    priceRange: [600, 1200],
    hours: [6, 22],
    images: IMG.cricket,
  },
  {
    suffix: 'Basketball Court',
    description: 'Indoor wooden flooring with full-court markings. Ball provided.',
    sports: ['Basketball', 'Volleyball'],
    priceRange: [400, 700],
    hours: [7, 22],
    images: IMG.basketball,
  },
  {
    suffix: 'Sports Hub',
    description: 'Mixed-use facility — turf, courts, snooker tables, and a cafe.',
    sports: ['Football', 'Basketball', 'Snooker', 'Box Cricket'],
    priceRange: [500, 900],
    hours: [6, 23],
    images: IMG.arena,
  },
  {
    suffix: 'Squash Centre',
    description: 'Glass-back show court plus 3 standard courts. Beginners welcome.',
    sports: ['Squash'],
    priceRange: [400, 700],
    hours: [7, 22],
    images: IMG.squash,
  },
  {
    suffix: 'Skating Rink',
    description: 'Smooth concrete rink for inline and roller skating. Skates available.',
    sports: ['Skating'],
    priceRange: [200, 400],
    hours: [16, 22],
    images: IMG.basketball,
  },
];

// ────────── Helpers ──────────
const hash32 = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
};

const pickPrice = (range: [number, number], seed: string): number => {
  const span = range[1] - range[0];
  return Math.round((range[0] + (hash32(seed) % (span + 1))) / 50) * 50;
};

const dateAtMidnightUTC = (d: Date): Date =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

async function main() {
  console.log('Seeding sports...');
  for (const name of SPORTS) {
    await prisma.sport.upsert({ where: { name }, update: {}, create: { name } });
  }
  const sports = await prisma.sport.findMany();
  const sportByName = Object.fromEntries(sports.map((s) => [s.name, s]));

  // ── Cleanup: drop venues outside the focused cities (Mumbai/Pune/Delhi/etc from prior seeds) ──
  const orphanVenues = await prisma.venue.findMany({
    where: { city: { notIn: [...ALLOWED_CITIES] } },
    select: { id: true },
  });
  if (orphanVenues.length > 0) {
    const orphanIds = orphanVenues.map((v) => v.id);
    console.log(`Cleaning up ${orphanIds.length} venues outside ${ALLOWED_CITIES.join(' + ')}...`);
    await prisma.$transaction([
      prisma.payment.deleteMany({ where: { booking: { venueId: { in: orphanIds } } } }),
      prisma.booking.deleteMany({ where: { venueId: { in: orphanIds } } }),
      prisma.review.deleteMany({ where: { venueId: { in: orphanIds } } }),
      prisma.slot.deleteMany({ where: { venueId: { in: orphanIds } } }),
      prisma.activity.deleteMany({ where: { venueId: { in: orphanIds } } }),
      prisma.venue.deleteMany({ where: { id: { in: orphanIds } } }),
    ]);
  }

  console.log('Seeding users...');
  const hashed = await bcrypt.hash(PASSWORD, 10);

  await prisma.user.upsert({
    where: { email: 'admin@sportify.dev' },
    update: {},
    create: { name: 'Admin', email: 'admin@sportify.dev', password: hashed, role: 'ADMIN' },
  });

  const merchants = await Promise.all(
    MERCHANTS.map((m) =>
      prisma.user.upsert({
        where: { email: m.email },
        update: {},
        create: { name: m.name, email: m.email, password: hashed, role: 'MERCHANT' },
      }),
    ),
  );

  await prisma.user.upsert({
    where: { email: 'player@sportify.dev' },
    update: {},
    create: {
      name: 'Demo Player',
      email: 'player@sportify.dev',
      password: hashed,
      role: 'PLAYER',
      skill: 'INTERMEDIATE',
    },
  });

  console.log('Generating venues...');
  const venuePayloads: Prisma.VenueCreateInput[] = [];
  let venueCount = 0;

  for (const [city, neighborhoods] of Object.entries(CITIES)) {
    for (let i = 0; i < neighborhoods.length; i++) {
      const hood = neighborhoods[i]!;
      // Each neighborhood gets 1 or 2 venues (deterministic).
      const venuesHere = hash32(`${city}-${hood.name}`) % 3 === 0 ? 2 : 1;
      for (let j = 0; j < venuesHere; j++) {
        const archetypeIdx = (venueCount + j) % ARCHETYPES.length;
        const archetype = ARCHETYPES[archetypeIdx]!;
        const merchant = merchants[(venueCount + j) % merchants.length]!;

        const name = `${hood.name} ${archetype.suffix}`;
        const price = pickPrice(archetype.priceRange, name);
        const sportIds = archetype.sports
          .map((sn) => sportByName[sn]?.id)
          .filter((x): x is string => Boolean(x));

        venuePayloads.push({
          name,
          description: archetype.description,
          location: `${hood.name}, ${city}`,
          city,
          address: `${hood.name}, ${city}`,
          images: archetype.images,
          lat: hood.lat + (Math.random() - 0.5) * 0.01,
          lng: hood.lng + (Math.random() - 0.5) * 0.01,
          openingHour: archetype.hours[0],
          closingHour: archetype.hours[1],
          slotDurationMinutes: 60,
          pricePerHour: price,
          owner: { connect: { id: merchant.id } },
          sports: { connect: sportIds.map((id) => ({ id })) },
        });
        venueCount++;
      }
    }
  }

  for (const data of venuePayloads) {
    const exists = await prisma.venue.findFirst({ where: { name: data.name } });
    if (exists) continue;
    await prisma.venue.create({ data });
  }

  console.log('Generating slots for the next 7 days for every venue...');
  const allVenues = await prisma.venue.findMany({
    select: { id: true, openingHour: true, closingHour: true, slotDurationMinutes: true },
  });
  const today = dateAtMidnightUTC(new Date());

  let slotCreated = 0;
  for (const v of allVenues) {
    const slotData: Prisma.SlotCreateManyInput[] = [];
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = addDays(today, dayOffset);
      const yyyyMmDd = date.toISOString().slice(0, 10);
      let current = new Date(`${yyyyMmDd}T${String(v.openingHour).padStart(2, '0')}:00:00.000Z`);
      const end = new Date(`${yyyyMmDd}T${String(v.closingHour).padStart(2, '0')}:00:00.000Z`);
      while (current < end) {
        const next = addMinutes(current, v.slotDurationMinutes);
        if (next > end) break;
        slotData.push({ venueId: v.id, date, startTime: current, endTime: next });
        current = next;
      }
    }
    const r = await prisma.slot.createMany({ data: slotData, skipDuplicates: true });
    slotCreated += r.count;
  }

  const totalSports = await prisma.sport.count();
  const totalVenues = await prisma.venue.count();
  const totalSlots = await prisma.slot.count();
  const venuesByCity = await prisma.venue.groupBy({
    by: ['city'],
    _count: { _all: true },
    orderBy: { city: 'asc' },
  });

  console.log('───────────────────────────────────────');
  console.log(`Seed complete.`);
  console.log(`  Sports : ${totalSports}`);
  console.log(`  Venues : ${totalVenues}`);
  for (const c of venuesByCity) {
    console.log(`           ${c.city ?? 'Unknown'}: ${c._count._all}`);
  }
  console.log(`  Slots  : ${totalSlots}  (+${slotCreated} created this run)`);
  console.log(`Demo accounts (password ${PASSWORD}):`);
  console.log(`  admin@sportify.dev`);
  for (const m of MERCHANTS) console.log(`  ${m.email}`);
  console.log(`  player@sportify.dev`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
