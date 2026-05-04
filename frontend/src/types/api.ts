export type Role = 'PLAYER' | 'MERCHANT' | 'ADMIN';
export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'PRO';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  skill: SkillLevel | null;
  role: Role;
  loyaltyPoints: number;
  createdAt: string;
};

export type Sport = { id: string; name: string };

export type Venue = {
  id: string;
  name: string;
  description: string | null;
  location: string;
  city: string | null;
  address?: string | null;
  images: string[];
  lat: number;
  lng: number;
  pricePerHour: number | null;
  openingHour: number;
  closingHour: number;
  slotDurationMinutes: number;
  createdAt: string;
  sports: Sport[];
  ownerId?: string;
  owner?: { id: string; name: string; avatarUrl: string | null };
};

export type VenueListResponse = {
  items: Venue[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Slot = {
  id: string;
  venueId: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
};

export type Booking = {
  id: string;
  status: BookingStatus;
  createdAt: string;
  venue: Pick<Venue, 'id' | 'name' | 'location' | 'city' | 'images'>;
  sport: Sport;
  slot: Slot | null;
};

export type AuthResponse = { user: User; token: string };
