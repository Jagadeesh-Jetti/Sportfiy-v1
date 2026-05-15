import { AMENITY_META } from '@/constants/amenities';
import type { Amenity } from '@/types/api';

type Props = { amenities: Amenity[]; max?: number };

export const AmenityChips = ({ amenities, max }: Props) => {
  const visible = max ? amenities.slice(0, max) : amenities;
  const extra = max && amenities.length > max ? amenities.length - max : 0;

  if (amenities.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((a) => {
        const meta = AMENITY_META[a];
        if (!meta) return null;
        const Icon = meta.icon;
        return (
          <span
            key={a}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            <Icon className="h-3.5 w-3.5 text-brand-700" />
            {meta.label}
          </span>
        );
      })}
      {extra > 0 && (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          +{extra} more
        </span>
      )}
    </div>
  );
};
