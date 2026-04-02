// src/pages/ItemDetail.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { differenceInDays, addDays, format } from 'date-fns';
import {
  MapPin, Star, Shield, CheckCircle2, Calendar, ChevronLeft,
  User, Tag, Eye, Clock, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { getImageUrl } from '../utils/imageUrl';

const CONDITION_LABELS = { EXCELLENT: '✨ Excellent', GOOD: '👍 Good', FAIR: '⚠️ Fair', POOR: '❌ Poor' };

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeImg,  setActiveImg]  = useState(0);
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');
  const [borrowNote, setBorrowNote] = useState('');

  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const days = startDate && endDate
    ? Math.max(1, differenceInDays(new Date(endDate), new Date(startDate)) + 1)
    : 0;

  const { data: res, isLoading } = useQuery(['item', id], () =>
    api.get(`/items/${id}`).then(r => r.data.data));
  const item = res;

  const { mutate: submitRequest, isLoading: requesting } = useMutation(
    () => api.post('/transactions', {
      itemId: item.itemId, startDate, endDate, borrowerNotes: borrowNote,
    }),
    {
      onSuccess: () => {
        toast.success('Rental request sent! The owner will respond soon.');
        qc.invalidateQueries(['item', id]);
        navigate('/dashboard');
      },
    }
  );

  const handleRequest = (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!startDate || !endDate) { toast.error('Please select rental dates'); return; }
    submitRequest();
  };

  if (isLoading) return <LoadingState />;
  if (!item) return <div className="text-center py-20 text-stone-500">Item not found.</div>;

  const isOwner      = user?.userId === item.ownerId;
  const isAvailable  = item.status === 'AVAILABLE';
  const totalRental  = days * item.dailyPrice;
  const totalWithDep = totalRental + (item.securityDeposit || 0);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">

      {/* Breadcrumb */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 mb-6 transition-colors">
        <ChevronLeft size={16} /> Back to browse
      </Link>

      <div className="grid lg:grid-cols-[1fr_380px] gap-10">

        {/* ── Left column ─────────────────────────────────── */}
        <div>

          {/* Image gallery */}
          <div className="rounded-2xl overflow-hidden bg-stone-100 aspect-[4/3] mb-3">
            {item.imageUrls?.length > 0 ? (
              <img src={getImageUrl(item.imageUrls[activeImg])} alt={item.title}
                className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-7xl">📦</div>
            )}
          </div>
          {item.imageUrls?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {item.imageUrls.map((url, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={clsx('shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                    i === activeImg ? 'border-amber-400' : 'border-transparent opacity-60 hover:opacity-100')}>
                  <img src={getImageUrl(url)} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Item info */}
          <div className="mt-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-1">
                  {item.categoryName}
                </p>
                <h1 className="font-display font-black text-3xl text-stone-900 leading-tight">
                  {item.title}
                </h1>
              </div>
              <div className="text-right shrink-0">
                <div className="text-3xl font-black text-stone-900">₹{item.dailyPrice}</div>
                <div className="text-xs text-stone-400 font-medium">per day</div>
              </div>
            </div>

            {/* Meta badges */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-600 text-xs font-medium px-3 py-1.5 rounded-full">
                <MapPin size={12} /> {item.locationLabel || item.campusName}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-600 text-xs font-medium px-3 py-1.5 rounded-full">
                {CONDITION_LABELS[item.conditionRating]}
              </span>
              {item.securityDeposit > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-200">
                  <Shield size={12} /> ${item.securityDeposit} deposit
                </span>
              )}
              <span className={clsx('inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full',
                isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-500')}>
                {isAvailable ? <><CheckCircle2 size={12} /> Available</> : <>Unavailable</>}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-500 text-xs font-medium px-3 py-1.5 rounded-full">
                <Eye size={12} /> {item.viewCount} views
              </span>
            </div>

            {/* Tags */}
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {item.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs bg-stone-50 text-stone-500 border border-stone-200 px-2.5 py-1 rounded-full">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="prose prose-stone prose-sm max-w-none">
              <p className="text-stone-600 leading-relaxed">{item.description}</p>
            </div>
          </div>

          {/* Owner card */}
          <div className="mt-8 p-5 bg-stone-50 rounded-2xl border border-stone-200">
            <h3 className="font-semibold text-stone-700 text-sm mb-3">Listed by</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 font-black text-xl grid place-items-center uppercase">
                {item.ownerName?.[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-stone-900">{item.ownerName}</p>
                  {item.ownerVerified && (
                    <CheckCircle2 size={15} className="text-emerald-500" title="Verified student" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-stone-500 mt-0.5">
                  <Star size={13} className="fill-amber-400 text-amber-400" />
                  <span>{item.ownerRating?.toFixed(1) || 'No ratings yet'}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Right column: Rental request panel ──────────── */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-lg overflow-hidden">
            <div className="bg-stone-900 text-white p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">₹{item.dailyPrice}</span>
                <span className="text-stone-400 text-sm">/ day</span>
              </div>
              {item.securityDeposit > 0 && (
                <p className="text-stone-400 text-xs mt-1">+ ₹{item.securityDeposit} security deposit</p>
              )}
            </div>

            <form onSubmit={handleRequest} className="p-5 space-y-4">
              {!isAvailable && !isOwner && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>This item is currently unavailable for rental.</span>
                </div>
              )}

              {/* Date pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5 block">
                    Start Date
                  </label>
                  <input type="date" value={startDate} min={tomorrow}
                    onChange={e => { setStartDate(e.target.value); if (endDate && e.target.value >= endDate) setEndDate(''); }}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5 block">
                    End Date
                  </label>
                  <input type="date" value={endDate} min={startDate || tomorrow}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>

              {/* Cost breakdown */}
              {days > 0 && (
                <div className="bg-stone-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>₹{item.dailyPrice} × {days} day{days > 1 ? 's' : ''}</span>
                    <span>₹{totalRental.toFixed(2)}</span>
                  </div>
                  {item.securityDeposit > 0 && (
                    <div className="flex justify-between text-stone-600">
                      <span>Security deposit</span>
                      <span>₹{item.securityDeposit}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-200">
                    <span>Total</span>
                    <span>₹{totalWithDep.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Note */}
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1.5 block">
                  Message to owner <span className="font-normal normal-case">(optional)</span>
                </label>
                <textarea rows={3} value={borrowNote}
                  onChange={e => setBorrowNote(e.target.value)}
                  placeholder="Introduce yourself, explain your use case…"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none placeholder:text-stone-400" />
              </div>

              {isOwner ? (
                <Link to={`/list-item?edit=${item.itemId}`}
                  className="w-full block text-center bg-stone-900 text-white font-semibold py-3 rounded-xl text-sm hover:bg-stone-800 transition-all">
                  Edit Your Listing
                </Link>
              ) : (
                <button type="submit" disabled={!isAvailable || requesting}
                  className="w-full bg-amber-400 hover:bg-amber-500 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-stone-900 font-bold py-3 rounded-xl text-sm transition-all">
                  {requesting ? 'Submitting…' : !user ? 'Sign in to Request' : 'Request to Rent'}
                </button>
              )}

              <p className="text-center text-xs text-stone-400 flex items-center justify-center gap-1">
                <Clock size={11} /> Owner typically responds within 24 hours
              </p>
            </form>
          </div>

          {/* Safety reminder */}
          <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs text-amber-800 font-medium mb-1">🎓 Campus-only platform</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              All users are verified with a campus email. Coordinate handoffs at safe, public campus locations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid lg:grid-cols-[1fr_380px] gap-10">
        <div>
          <div className="aspect-[4/3] bg-stone-200 rounded-2xl mb-6" />
          <div className="h-8 bg-stone-200 rounded w-3/4 mb-3" />
          <div className="h-4 bg-stone-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-stone-200 rounded w-2/3" />
        </div>
        <div className="h-80 bg-stone-200 rounded-2xl" />
      </div>
    </main>
  );
}
