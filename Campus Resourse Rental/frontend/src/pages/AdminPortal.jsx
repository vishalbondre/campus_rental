// src/pages/AdminPortal.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Users, Package, ShieldCheck, AlertTriangle, CheckCircle2,
  XCircle, BarChart3, Star, Trash2, Eye
} from 'lucide-react';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard',   icon: BarChart3     },
  { id: 'users',     label: 'Students',    icon: Users         },
  { id: 'txns',      label: 'Transactions',icon: Package       },
  { id: 'disputes',  label: 'Disputes',    icon: AlertTriangle },
  { id: 'reviews',   label: 'Reviews',     icon: Star          },
];

export default function AdminPortal() {
  const [tab, setTab] = useState('dashboard');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-stone-900 text-amber-400 grid place-items-center">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="font-display font-black text-2xl text-stone-900">Admin Portal</h1>
          <p className="text-stone-500 text-sm">Platform moderation & oversight</p>
        </div>
      </div>

      <div className="flex gap-1 mb-8 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
        {ADMIN_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700')}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'dashboard'  && <AdminDashboard />}
      {tab === 'users'      && <AdminUsers    />}
      {tab === 'txns'       && <AdminTxns     />}
      {tab === 'disputes'   && <AdminDisputes />}
      {tab === 'reviews'    && <AdminReviews  />}
    </div>
  );
}

// ── Dashboard tab ─────────────────────────────────────────────
function AdminDashboard() {
  const { data } = useQuery('admin-dashboard',
    () => api.get('/admin/dashboard').then(r => r.data.data));

  const stats = [
    { label: 'Total Students',     value: data?.totalUsers        ?? '—', color: 'text-blue-600',    bg: 'bg-blue-50'    },
    { label: 'Verified',           value: data?.verifiedUsers     ?? '—', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Rentals',     value: data?.activeTransactions?? '—', color: 'text-amber-600',   bg: 'bg-amber-50'   },
    { label: 'Open Disputes',      value: data?.openDisputes      ?? '—', color: 'text-red-600',     bg: 'bg-red-50'     },
    { label: 'Total Listings',     value: data?.totalItems        ?? '—', color: 'text-purple-600',  bg: 'bg-purple-50'  },
    { label: 'Completed Rentals',  value: data?.completedRentals  ?? '—', color: 'text-stone-700',   bg: 'bg-stone-50'   },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className={clsx('rounded-2xl p-5 border border-stone-100', s.bg)}>
            <p className={clsx('text-3xl font-black', s.color)}>{s.value}</p>
            <p className="text-xs text-stone-500 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-stone-100 p-6 text-stone-500 text-sm text-center">
        Detailed analytics charts (transactions over time, revenue, category breakdown) would be rendered here using Recharts or Chart.js.
      </div>
    </div>
  );
}

// ── Users tab ─────────────────────────────────────────────────
function AdminUsers() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState(null);
  const [page,   setPage]   = useState(0);

  const { data } = useQuery(['admin-users', filter, page],
    () => api.get('/admin/users', { params: { verified: filter, page, size: 20 }}).then(r => r.data.data));

  const { mutate: verify } = useMutation(
    (id) => api.patch(`/admin/users/${id}/verify`),
    { onSuccess: () => { qc.invalidateQueries('admin-users'); toast.success('Student verified'); } }
  );

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {[null, false, true].map(v => (
          <button key={String(v)} onClick={() => { setFilter(v); setPage(0); }}
            className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              filter === v ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400')}>
            {v === null ? 'All' : v ? 'Verified' : 'Unverified'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Student</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden sm:table-cell">Campus</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Joined</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Verified</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {data?.content?.map(u => (
              <tr key={u.userId} className="hover:bg-stone-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-sm grid place-items-center uppercase shrink-0">
                      {u.fullName?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-stone-900">{u.fullName}</p>
                      <p className="text-xs text-stone-400">{u.emailId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-stone-600 hidden sm:table-cell">{u.campusName}</td>
                <td className="px-5 py-3 text-stone-400 text-xs hidden md:table-cell">
                  {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                </td>
                <td className="px-5 py-3 text-center">
                  {u.isVerified
                    ? <CheckCircle2 size={16} className="text-emerald-500 mx-auto" />
                    : <XCircle size={16} className="text-stone-300 mx-auto" />}
                </td>
                <td className="px-5 py-3 text-center">
                  {!u.isVerified && (
                    <button onClick={() => verify(u.userId)}
                      className="text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-lg transition-all">
                      Verify
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!data?.content || data.content.length === 0) && (
          <div className="text-center py-12 text-stone-400 text-sm">No students found</div>
        )}
      </div>
    </div>
  );
}

// ── Transactions tab ──────────────────────────────────────────
function AdminTxns() {
  const [status, setStatus] = useState('');
  const [page,   setPage]   = useState(0);
  const { data } = useQuery(['admin-txns', status, page],
    () => api.get('/admin/transactions', { params: { status: status || undefined, page, size: 20 }}).then(r => r.data.data));

  const STATUS_OPTS = ['', 'PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'];
  const TX_COLORS   = { PENDING:'bg-yellow-50 text-yellow-700', APPROVED:'bg-blue-50 text-blue-700',
                        ACTIVE:'bg-emerald-50 text-emerald-700', COMPLETED:'bg-stone-50 text-stone-600',
                        CANCELLED:'bg-red-50 text-red-600', DISPUTED:'bg-orange-50 text-orange-700' };

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_OPTS.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(0); }}
            className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              status === s ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400')}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {data?.content?.map(tx => (
          <div key={tx.transactionId} className="bg-white rounded-xl border border-stone-100 p-4 flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-stone-900 text-sm">{tx.itemTitle}</p>
                <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', TX_COLORS[tx.status] || '')}>
                  {tx.status}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {tx.borrowerName} → {tx.ownerName} &nbsp;·&nbsp;
                {tx.startDate} – {tx.endDate} &nbsp;·&nbsp;
                <span className="font-semibold text-stone-700">${tx.totalAmount}</span>
              </p>
            </div>
            <Link to={`/items/${tx.itemId}`}
              className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1 shrink-0">
              <Eye size={13} /> View
            </Link>
          </div>
        ))}
        {(!data?.content || data.content.length === 0) && (
          <div className="text-center py-12 text-stone-400 text-sm">No transactions found</div>
        )}
      </div>
    </div>
  );
}

// ── Disputes tab ──────────────────────────────────────────────
function AdminDisputes() {
  const qc = useQueryClient();
  const { data } = useQuery('admin-disputes',
    () => api.get('/admin/disputes').then(r => r.data.data));

  const { mutate: resolve } = useMutation(
    ({ txId, resolution }) => api.patch(`/admin/disputes/${txId}/resolve`,
      null, { params: { resolution, resolvedByUserId: 1 }}),
    { onSuccess: () => { qc.invalidateQueries('admin-disputes'); toast.success('Dispute resolved'); } }
  );

  return (
    <div className="space-y-4">
      {data?.content?.length === 0 && (
        <div className="text-center py-16 text-stone-400 text-sm">
          <AlertTriangle size={40} className="mx-auto mb-3 text-stone-300" />
          <p>No open disputes — great news! 🎉</p>
        </div>
      )}
      {data?.content?.map(tx => (
        <div key={tx.transactionId} className="bg-white rounded-2xl border border-orange-200 p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={16} className="text-orange-500" />
                <p className="font-semibold text-stone-900">Transaction #{tx.transactionId}</p>
                <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full font-medium">
                  DISPUTED
                </span>
              </div>
              <p className="text-sm text-stone-600">{tx.itemTitle}</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Borrower: {tx.borrowerName} &nbsp;·&nbsp; Owner: {tx.ownerName}
              </p>
              {tx.disputeReason && (
                <p className="mt-2 text-sm text-orange-800 bg-orange-50 p-3 rounded-xl border border-orange-100">
                  "{tx.disputeReason}"
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => resolve({ txId: tx.transactionId, resolution: 'Resolved in favor of borrower' })}
              className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all">
              Favor Borrower
            </button>
            <button onClick={() => resolve({ txId: tx.transactionId, resolution: 'Resolved in favor of owner' })}
              className="text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-all">
              Favor Owner
            </button>
            <button onClick={() => resolve({ txId: tx.transactionId, resolution: 'Mutually resolved' })}
              className="text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all">
              Mutual Resolution
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Reviews tab ───────────────────────────────────────────────
function AdminReviews() {
  const qc = useQueryClient();
  const { data } = useQuery('admin-flagged-reviews',
    () => api.get('/admin/reviews/flagged').then(r => r.data.data));

  const { mutate: deleteReview } = useMutation(
    (id) => api.delete(`/admin/reviews/${id}`),
    { onSuccess: () => { qc.invalidateQueries('admin-flagged-reviews'); toast.success('Review removed'); } }
  );

  return (
    <div className="space-y-3">
      {data?.content?.length === 0 && (
        <div className="text-center py-16 text-stone-400 text-sm">
          <Star size={40} className="mx-auto mb-3 text-stone-300" />
          <p>No flagged reviews at this time.</p>
        </div>
      )}
      {data?.content?.map(r => (
        <div key={r.reviewId} className="bg-white rounded-xl border border-red-200 p-4 flex gap-4 items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">FLAGGED</span>
              <span className="text-xs text-stone-400">Review #{r.reviewId}</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < r.rating ? 'text-amber-400' : 'text-stone-200'}>★</span>
              ))}
            </div>
            <p className="text-sm text-stone-700">{r.comment || '(no comment)'}</p>
            <p className="text-xs text-stone-400 mt-1">by {r.reviewerName}</p>
          </div>
          <button onClick={() => deleteReview(r.reviewId)}
            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all shrink-0">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
