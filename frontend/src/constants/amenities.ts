import {
  Car,
  Wifi,
  Camera,
  Coffee,
  Snowflake,
  Heart,
  Droplets,
  Lightbulb,
  Toilet,
  Wrench,
  Shirt,
  ShowerHead,
} from 'lucide-react';
import type { Amenity } from '@/types/api';
import type { LucideIcon } from 'lucide-react';

export const AMENITY_META: Record<Amenity, { label: string; icon: LucideIcon }> = {
  PARKING: { label: 'Parking', icon: Car },
  RESTROOM: { label: 'Restroom', icon: Toilet },
  DRINKING_WATER: { label: 'Drinking water', icon: Droplets },
  EQUIPMENT_RENTAL: { label: 'Equipment rental', icon: Wrench },
  CHANGING_ROOM: { label: 'Changing room', icon: Shirt },
  SHOWER: { label: 'Shower', icon: ShowerHead },
  FLOODLIT: { label: 'Floodlit', icon: Lightbulb },
  AC: { label: 'Air-conditioned', icon: Snowflake },
  CAFE: { label: 'Cafe', icon: Coffee },
  FIRST_AID: { label: 'First aid', icon: Heart },
  WIFI: { label: 'Wi-Fi', icon: Wifi },
  CCTV: { label: 'CCTV', icon: Camera },
};

export const ALL_AMENITIES = Object.keys(AMENITY_META) as Amenity[];
