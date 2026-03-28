// src/pages/Home.jsx
import { useState, useCallback } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ItemCard from '../components/ItemCard';
import {
  Search, SlidersHorizontal, ChevronLeft, ChevronRight,
  Cpu, Bike, Shirt, BookOpen, Activity, Wrench, Sofa, Camera, X
} from 'lucide-react';
import clsx from 'clsx';

const CATEGORY_ICONS = {
  Electronics: Cpu, Bicycles: Bike, Costumes: Shirt, Textbooks: BookOpen,
  'Sports Gear': Activity, Tools: Wrench, Furniture: Sofa, Photography: Camera,
};

const SORT_OPTIONS = [
  { label: 'Newest',     value: 'createdAt,desc' },
  { label: 'Price ↑',   value: 'dailyPrice,asc'  },
  { label: 'Price ↓',   value: 'dailyPrice,desc' },
  { label: 'Most Viewed', value: 'viewCount,desc' },
];

export default function Home() {
  const [search,     setSearch]     = useState('');
  const [inputVal,   setInputVal]   = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [minPrice,   setMinPrice]   = useState('');
  const [maxPrice,   setMaxPrice]   = useState('');
  const [sort,       setSort]       = useState('createdAt,desc');
  const [page,       setPage]       = useState(0);
  const [showFilters,setShowFilters]= useState(false);

  const { data: catData } = useQuery('categories', () =>
    api.get('/categories').then(r => r.data.data));

  const { data, isLoading, isError } = useQuery(
    ['items', search, categoryId, minPrice, maxPrice, sort, page],
    () => api.get('/items', { params: {
      search: search || undefined,
      categoryId: categoryId || undefined,
      minPrice:   minPrice  || undefined,
      maxPrice:   maxPrice  || undefined,
      sort, page, size: 12,
    }}).then(r => r.data.data),
    { keepPreviousData: true }
  );

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(inputVal);
    setPage(0);
  };

  const clearFilters = () => {
    setSearch(''); setInputVal(''); setCategoryId(null);
    setMinPrice(''); setMaxPrice(''); setSort('createdAt,desc'); setPage(0);
  };

  const hasFilters = search || categoryId || minPrice || maxPrice;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      {/* ── Hero search bar ─────────────────────────────────── */}
      <section className="mb-8">
        <h1 className="font-display font-black text-4xl md:text-5xl text-stone-900 mb-2 tracking-tight">
          Borrow anything<br />
          <span className="text-amber-500">on campus.</span>
        </h1>
        <p className="text-stone-500 mb-6 text-lg">Rent from fellow students — no hassle, fair prices.</p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Search for a laptop, bike, costume…"
              className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent shadow-sm text-sm"
            />
          </div>
          <button type="submit"
            className="bg-stone-900 hover:bg-stone-800 text-white font-semibold px-5 py-3 rounded-xl transition-all text-sm">
            Search
          </button>
          <button type="button" onClick={() => setShowFilters(f => !f)}
            className={clsx('flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all',
              showFilters
                ? 'bg-amber-400 border-amber-400 text-stone-900'
                : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400')}>
            <SlidersHorizontal size={16} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </form>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-3 p-4 bg-white border border-stone-200 rounded-xl shadow-sm max-w-2xl">
            <div className="flex gap-3 flex-wrap items-end">
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1 block">Min Price/day</label>
                <input type="number" value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(0); }}
                  placeholder="₹0" className="w-24 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1 block">Max Price/day</label>
                <input type="number" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(0); }}
                  placeholder="₹100" className="w-24 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-1 block">Sort by</label>
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(0); }}
                  className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {hasFilters && (
                <button onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium py-2">
                  <X size={14} /> Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ── Category chips ──────────────────────────────────── */}
      <section className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button onClick={() => { setCategoryId(null); setPage(0); }}
          className={clsx('shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all border',
            !categoryId ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400')}>
          All Items
        </button>
        {catData?.content?.map(cat => {
          const Icon = CATEGORY_ICONS[cat.name] || BookOpen;
          return (
            <button key={cat.categoryId} onClick={() => { setCategoryId(cat.categoryId); setPage(0); }}
              className={clsx('shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border',
                categoryId === cat.categoryId
                  ? 'bg-amber-400 text-stone-900 border-amber-400'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400')}>
              <Icon size={14} /> {cat.name}
            </button>
          );
        })}
      </section>

      {/* ── Active filters display ──────────────────────────── */}
      {hasFilters && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-stone-500 font-medium">Active filters:</span>
          {search && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
              "{search}" <button onClick={() => { setSearch(''); setInputVal(''); }}><X size={11} /></button>
            </span>
          )}
          {categoryId && catData?.content && (
            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
              {catData.content.find(c => c.categoryId === categoryId)?.name}
              <button onClick={() => setCategoryId(null)}><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {/* ── Results count ───────────────────────────────────── */}
      {data && (
        <p className="text-sm text-stone-500 mb-5">
          {data.totalElements === 0
            ? 'No items found'
            : `Showing ${data.number * data.size + 1}–${Math.min((data.number + 1) * data.size, data.totalElements)} of ${data.totalElements} items`}
        </p>
      )}

      {/* ── Item Grid ───────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <div className="text-center py-20 text-stone-500">
          <p className="text-lg font-medium">Failed to load items.</p>
          <p className="text-sm mt-1">Please try again later.</p>
        </div>
      ) : data?.content?.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-xl font-semibold text-stone-600">No items found</p>
          <p className="text-sm mt-2">Try adjusting your filters or search terms</p>
          <button onClick={clearFilters} className="mt-4 text-amber-600 hover:underline text-sm font-medium">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.content.map(item => <ItemCard key={item.itemId} item={item} />)}
        </div>
      )}

      {/* ── Pagination ──────────────────────────────────────── */}
      {data && data.totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={15} /> Prev
          </button>
          {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => {
            const p = data.totalPages <= 7 ? i : Math.max(0, page - 3) + i;
            if (p >= data.totalPages) return null;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={clsx('w-9 h-9 rounded-lg text-sm font-medium transition-all',
                  p === page ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-600 hover:bg-stone-50')}>
                {p + 1}
              </button>
            );
          })}
          <button disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-stone-200 text-sm font-medium text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}
    </main>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse">
      <div className="aspect-[4/3] bg-stone-200" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-stone-200 rounded w-3/4" />
        <div className="h-3 bg-stone-200 rounded w-1/2" />
        <div className="h-4 bg-stone-200 rounded w-1/3 mt-3" />
      </div>
    </div>
  );
}
