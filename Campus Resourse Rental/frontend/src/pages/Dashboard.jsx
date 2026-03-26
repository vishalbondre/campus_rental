// src/pages/Dashboard.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Package, ArrowDownCircle, ArrowUpCircle, Star,
  CheckCircle2, XCircle, Clock, AlertTriangle,
  Plus, ChevronRight, Shield, RotateCcw
} from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { id: 'borrowing', label: 'I\'m Borrowing', icon: ArrowDownCircle },
  { id: 'lending',   label: 'I\'m Lending',   icon: ArrowUpCircle  },
  { id: 'listings',  label: 'My Listings',    icon: Package        },
];

const STATUS_STYLES = {
  PENDING:   'bg-yellow-50  text-yellow-700  border-yellow-200',
  APPROVED:  'bg-blue-50    text-blue-700    border-blue-200',
  ACTIVE:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-stone-50   text-stone-600   border-stone-200',
  CANCELLED: 'bg-red-50     text-red-600     border-red-200',
  DISPUTED:  'bg-orange-50  text-orange-700  border-orange-200',
};

const STATUS_ICONS = {
  PENDING:   Clock, APPROVED: CheckCircle2, ACTIVE: CheckCircle2,
  COMPLETED: CheckCircle2, CANCELLED: XCircle, DISPUTED: AlertTriangle,
};

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('borrowing');
  const [reviewingTx, setReviewingTx] = useState(null);
  const qc = useQueryClient();

  const { data: borrowals = [] } = useQuery('borrowals',
    () => api.get('/transactions/as-borrower').then(r => r.data.data));
  const { data: lendings  = [] } = useQuery('lendings',
    () => api.get('/transactions/as-owner').then(r => r.data.data));
  const { data: listings  = [] } = useQuery('my-listings',
    () => api.get('/items/my').then(r => r.data.data));

  const { mutate: respondToRequest } = useMutation(
    ({ id, action }) => api.patch(`/transactions/${id}/respond?action=${action}`),
    { onSuccess: () => { qc.invalidateQueries('lendings'); toast.success('Response sent!'); } }
  );

  const { mutate: completeRental } = useMutation(
    (id) => api.patch(`/transactions/${id}/complete`),
    { onSuccess: () => { qc.invalidateQueries('borrowals'); toast.success('Rental marked as complete!'); } }
  );

  const { mutate: toggleStatus } = useMutation(
    ({ id, status }) => api.patch(`/items/${id}/status?status=${status}`),
    { onSuccess: () => { qc.invalidateQueries('my-listings'); toast.success('Status updated'); } }
  );

  const stats = {
    activeBorrowals: borrowals.filter(t => t.status === 'ACTIVE').length,
    activeLendings:  lendings.filter(t  => t.status === 'ACTIVE').length,
    pendingRequests: lendings.filter(t  => t.status === 'PENDING').length,
    totalListings:   listings.length,
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-stone-900">
            Hey, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-stone-500 mt-1">{user?.campusName}</p>
        </div>
        <Link to="/list-item"
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm">
          <Plus size={16} /> List New Item
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Active Rentals',   value: stats.activeBorrowals, color: 'text-emerald-600' },
          { label: 'Active Lendings',  value: stats.activeLendings,  color: 'text-blue-600'    },
          { label: 'Pending Requests', value: stats.pendingRequests, color: 'text-amber-600'   },
          { label: 'My Listings',      value: stats.totalListings,   color: 'text-stone-700'   },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm">
            <p className={clsx('text-2xl font-black', s.color)}>{s.value}</p>
            <p className="text-xs text-stone-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
        {TABS.map(t => {
          const Icon = t.icon;
          const count = t.id === 'borrowing' ? borrowals.length
                      : t.id === 'lending'   ? lendings.length
                      : listings.length;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700')}>
              <Icon size={15} /> {t.label}
              {count > 0 && (
                <span className={clsx('text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                  tab === t.id ? 'bg-amber-100 text-amber-700' : 'bg-stone-200 text-stone-500')}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'borrowing' && (
        <TransactionList
          transactions={borrowals}
          emptyMsg="You haven't borrowed anything yet."
          emptyAction={{ to: '/', label: 'Browse items' }}
          renderActions={(tx) => (
            <>
              {tx.status === 'ACTIVE' && (
                <button onClick={() => completeRental(tx.transactionId)}
                  className="text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-all">
                  Mark Returned
                </button>
              )}
              {tx.status === 'COMPLETED' && (
                <button onClick={() => setReviewingTx(tx)}
                  className="text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all">
                  <Star size={12} /> Leave Review
                </button>
              )}
            </>
          )}
        />
      )}

      {tab === 'lending' && (
        <TransactionList
          transactions={lendings}
          emptyMsg="No incoming rental requests."
          emptyAction={{ to: '/list-item', label: 'List an item' }}
          renderActions={(tx) => (
            <>
              {tx.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button onClick={() => respondToRequest({ id: tx.transactionId, action: 'APPROVED' })}
                    className="text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-all">
                    Approve
                  </button>
                  <button onClick={() => respondToRequest({ id: tx.transactionId, action: 'CANCELLED' })}
                    className="text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-all">
                    Decline
                  </button>
                </div>
              )}
            </>
          )}
        />
      )}

      {tab === 'listings' && (
        <div>
          {listings.length === 0 ? (
            <EmptyState msg="You have no active listings." action={{ to: '/list-item', label: 'List your first item' }} />
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {listings.map(item => (
                <div key={item.itemId}
                  className="bg-white rounded-2xl border border-stone-100 p-4 flex gap-4 items-start hover:border-stone-300 transition-all">
                  <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                    {item.imageUrl
                      ? <img src={item.imageUrl} className="w-full h-full object-cover" />
                      : <div className="w-full h-full grid place-items-center text-2xl">📦</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stone-900 truncate">{item.title}</p>
                    <p className="text-sm text-amber-600 font-medium">${item.dailyPrice}/day</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full border',
                        STATUS_STYLES[item.status] || STATUS_STYLES.PENDING)}>
                        {item.status}
                      </span>
                      <button
                        onClick={() => toggleStatus({
                          id: item.itemId,
                          status: item.status === 'AVAILABLE' ? 'PAUSED' : 'AVAILABLE'
                        })}
                        className="text-xs text-stone-500 hover:text-stone-800 underline transition-colors">
                        {item.status === 'AVAILABLE' ? 'Pause' : 'Activate'}
                      </button>
                    </div>
                  </div>
                  <Link to={`/items/${item.itemId}`}
                    className="text-stone-300 hover:text-stone-600 transition-colors shrink-0">
                    <ChevronRight size={18} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review modal */}
      {reviewingTx && (
        <ReviewModal
          transaction={reviewingTx}
          onClose={() => setReviewingTx(null)}
          onSuccess={() => { setReviewingTx(null); qc.invalidateQueries('borrowals'); }}
        />
      )}
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────

function TransactionList({ transactions, emptyMsg, emptyAction, renderActions }) {
  if (transactions.length === 0)
    return <EmptyState msg={emptyMsg} action={emptyAction} />;

  return (
    <div className="space-y-3">
      {transactions.map(tx => {
        const Icon = STATUS_ICONS[tx.status] || Clock;
        return (
          <div key={tx.transactionId}
            className="bg-white rounded-2xl border border-stone-100 p-4 hover:border-stone-200 transition-all">
            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                {tx.itemImage
                  ? <img src={tx.itemImage} className="w-full h-full object-cover" />
                  : <div className="w-full h-full grid place-items-center text-2xl">📦</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p className="font-semibold text-stone-900">{tx.itemTitle}</p>
                  <span className={clsx('shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border',
                    STATUS_STYLES[tx.status])}>
                    <Icon size={11} /> {tx.status}
                  </span>
                </div>
                <p className="text-sm text-stone-500 mt-0.5">
                  {format(new Date(tx.startDate), 'MMM d')} – {format(new Date(tx.endDate), 'MMM d, yyyy')}
                </p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-sm font-bold text-stone-900">${tx.totalAmount}</span>
                  {tx.securityDeposit > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs text-stone-500">
                      <Shield size={11} /> ${tx.securityDeposit} deposit
                      {tx.depositReturned && <span className="text-emerald-600 font-medium"> (returned)</span>}
                    </span>
                  )}
                </div>
                {tx.borrowerNotes && (
                  <p className="text-xs text-stone-400 mt-1 italic">"{tx.borrowerNotes}"</p>
                )}
              </div>
            </div>
            {renderActions && (
              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 flex-wrap">
                {renderActions(tx)}
                <Link to={`/items/${tx.itemId}`}
                  className="text-xs text-stone-400 hover:text-stone-700 underline ml-auto">
                  View item
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ msg, action }) {
  return (
    <div className="text-center py-16 text-stone-400">
      <div className="text-5xl mb-3">📭</div>
      <p className="font-medium text-stone-600">{msg}</p>
      {action && (
        <Link to={action.to} className="mt-3 inline-block text-sm text-amber-600 hover:underline font-medium">
          {action.label} →
        </Link>
      )}
    </div>
  );
}

function ReviewModal({ transaction, onClose, onSuccess }) {
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState('');
  const { mutate, isLoading } = useMutation(
    () => api.post('/reviews', {
      transactionId: transaction.transactionId,
      rating, comment,
      reviewType: 'BORROWER_TO_OWNER',
    }),
    { onSuccess }
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 grid place-items-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="font-display font-bold text-xl text-stone-900 mb-1">Leave a Review</h3>
        <p className="text-stone-500 text-sm mb-5">How was your rental of <strong>{transaction.itemTitle}</strong>?</p>

        {/* Star rating */}
        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)}
              className={clsx('text-3xl transition-all hover:scale-110', s <= rating ? 'opacity-100' : 'opacity-30')}>
              ⭐
            </button>
          ))}
        </div>

        <textarea rows={4} value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Share your experience with the owner and item condition…"
          className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none mb-4" />

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-all">
            Cancel
          </button>
          <button onClick={() => mutate()} disabled={isLoading}
            className="flex-1 bg-amber-400 hover:bg-amber-500 text-stone-900 font-bold py-2.5 rounded-xl text-sm transition-all disabled:opacity-50">
            {isLoading ? 'Submitting…' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}
