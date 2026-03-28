// src/components/ItemCard.jsx
import { Link } from 'react-router-dom';
import { MapPin, Star, Shield } from 'lucide-react';
import clsx from 'clsx';

const CONDITION_COLORS = {
  EXCELLENT: 'bg-emerald-100 text-emerald-700',
  GOOD:      'bg-blue-100  text-blue-700',
  FAIR:      'bg-amber-100 text-amber-700',
  POOR:      'bg-red-100   text-red-700',
};

export default function ItemCard({ item }) {
  const {
    itemId, title, dailyPrice, securityDeposit,
    conditionRating, status, categoryName,
    ownerName, ownerRating, locationLabel,
    campusName, imageUrl, createdAt,
  } = item;

  const isAvailable = status === 'AVAILABLE';

  return (
    <Link to={`/items/${itemId}`}
      className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-amber-300 hover:shadow-lg transition-all duration-200 flex flex-col">

      {/* Image */}
      <div className="relative aspect-[4/3] bg-stone-100 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full grid place-items-center text-stone-300 text-5xl">📦</div>
        )}

        {/* Status badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-stone-900/50 grid place-items-center">
            <span className="bg-white text-stone-900 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wide">
              {status === 'RENTED' ? 'Rented Out' : 'Unavailable'}
            </span>
          </div>
        )}

        {/* Condition badge */}
        <span className={clsx('absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full',
          CONDITION_COLORS[conditionRating] || CONDITION_COLORS.GOOD)}>
          {conditionRating?.charAt(0) + conditionRating?.slice(1).toLowerCase()}
        </span>

        {/* Deposit indicator */}
        {securityDeposit > 0 && (
          <span className="absolute top-2 right-2 bg-white/90 text-stone-700 text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
            <Shield size={10} /> Deposit
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1">
          {categoryName}
        </p>
        <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 mb-auto group-hover:text-amber-700 transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-stone-400 text-xs mt-2 mb-2">
          <MapPin size={11} />
          <span className="truncate">{locationLabel || campusName}</span>
        </div>

        {/* Footer row */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-lg font-black text-stone-900">₹{dailyPrice}</span>
            <span className="text-xs text-stone-400 font-medium">/day</span>
          </div>
          <div className="flex items-center gap-1 text-stone-500 text-xs">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span>{ownerRating?.toFixed(1) || '—'}</span>
          </div>
        </div>

        {/* Owner */}
        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-bold text-xs grid place-items-center uppercase shrink-0">
            {ownerName?.[0]}
          </span>
          <span className="text-xs text-stone-500 truncate">{ownerName}</span>
        </div>
      </div>
    </Link>
  );
}
