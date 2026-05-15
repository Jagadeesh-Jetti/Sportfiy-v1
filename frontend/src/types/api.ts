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

export type Amenity =
  | 'PARKING'
  | 'RESTROOM'
  | 'DRINKING_WATER'
  | 'EQUIPMENT_RENTAL'
  | 'CHANGING_ROOM'
  | 'SHOWER'
  | 'FLOODLIT'
  | 'AC'
  | 'CAFE'
  | 'FIRST_AID'
  | 'WIFI'
  | 'CCTV';

export type Venue = {
  id: string;
  name: string;
  description: string | null;
  location: string;
  city: string | null;
  address?: string | null;
  phone?: string | null;
  images: string[];
  amenities: Amenity[];
  lat: number;
  lng: number;
  pricePerHour: number | null;
  openingHour: number;
  closingHour: number;
  slotDurationMinutes: number;
  avgRating: number | null;
  reviewCount: number;
  isVerified: boolean;
  createdAt: string;
  sports: Sport[];
  ownerId?: string;
  owner?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    bio?: string | null;
    createdAt?: string;
  };
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
  venue: Pick<Venue, 'id' | 'name' | 'location' | 'city' | 'images'> &
    Partial<Pick<Venue, 'address' | 'lat' | 'lng' | 'phone' | 'pricePerHour'>>;
  sport: Sport;
  slot: Slot | null;
  checkInCode?: string;
};

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  reply: string | null;
  replyAt: string | null;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
};

export type Activity = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  capacity: number;
  price: number;
  privacy: 'PUBLIC' | 'PRIVATE';
  sport: Sport;
  venue: Pick<Venue, 'id' | 'name' | 'location' | 'city' | 'images'> | null;
  host: { id: string; name: string; avatarUrl: string | null };
  participants: { id: string; name: string; avatarUrl: string | null }[];
};

export type Stats = {
  users: number;
  venues: number;
  sports: number;
  bookings: number;
  cities: string[];
};

export type AuthResponse = { user: User; token: string };
