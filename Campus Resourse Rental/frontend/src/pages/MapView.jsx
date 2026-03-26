// src/pages/MapView.jsx
import { useState, useMemo } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../utils/api';
import { MapPin, List, X, ChevronRight, Star } from 'lucide-react';
import clsx from 'clsx';

// Fix Leaflet default icon path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom amber pin icon
const createCustomIcon = (selected = false) => L.divIcon({
  html: `
    <div style="
      width:${selected ? 40 : 32}px; height:${selected ? 40 : 32}px;
      background:${selected ? '#f59e0b' : '#1c1917'};
      border:3px solid ${selected ? '#1c1917' : '#f59e0b'};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.2s;
    "></div>`,
  className: '',
  iconSize:   [selected ? 40 : 32, selected ? 40 : 32],
  iconAnchor: [selected ? 20 : 16, selected ? 40 : 32],
  popupAnchor:[0, -(selected ? 40 : 32)],
});

function FlyTo({ coords }) {
  const map = useMap();
  if (coords) map.flyTo(coords, 17, { animate: true, duration: 0.8 });
  return null;
}

export default function MapView() {
  const [selectedId, setSelectedId] = useState(null);
  const [campus,     setCampus]     = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [showList,   setShowList]   = useState(false);

  const { data: items = [], isLoading } = useQuery(
    ['map-items', campus, categoryId],
    () => api.get('/items/map', { params: { campus: campus || undefined, categoryId: categoryId || undefined }})
      .then(r => r.data.data)
  );

  const { data: catData } = useQuery('categories',
    () => api.get('/categories').then(r => r.data.data));

  const selected = useMemo(() => items.find(i => i.itemId === selectedId), [items, selectedId]);
  const center   = useMemo(() => {
    if (items.length === 0) return [40.7128, -74.006]; // NYC fallback
    const avgLat = items.reduce((s, i) => s + i.latitude,  0) / items.length;
    const avgLng = items.reduce((s, i) => s + i.longitude, 0) / items.length;
    return [avgLat, avgLng];
  }, [items]);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">

      {/* ── Top toolbar ───────────────────────────────────── */}
      <div className="bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 flex-wrap z-10 shadow-sm">
        <div className="flex items-center gap-2 text-stone-700 font-semibold">
          <MapPin size={18} className="text-amber-500" />
          <span className="text-sm">Campus Map</span>
          {!isLoading && (
            <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {items.length} items
            </span>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          <button onClick={() => setCategoryId(null)}
            className={clsx('shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all',
              !categoryId ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400')}>
            All
          </button>
          {catData?.content?.map(c => (
            <button key={c.categoryId} onClick={() => setCategoryId(c.categoryId)}
              className={clsx('shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all',
                categoryId === c.categoryId ? 'bg-amber-400 text-stone-900 border-amber-400' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400')}>
              {c.name}
            </button>
          ))}
        </div>

        <button onClick={() => setShowList(l => !l)}
          className="ml-auto shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-medium text-stone-700 transition-all">
          <List size={14} /> {showList ? 'Hide list' : 'Show list'}
        </button>
      </div>

      {/* ── Main content ──────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* Map */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="absolute inset-0 grid place-items-center bg-stone-100 z-10">
              <div className="text-center text-stone-500">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm font-medium">Loading map…</p>
              </div>
            </div>
          ) : (
            <MapContainer center={center} zoom={15} className="h-full w-full z-0"
              style={{ background: '#f5f5f4' }}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
                maxZoom={20}
              />
              {items.map(item => (
                <Marker key={item.itemId}
                  position={[item.latitude, item.longitude]}
                  icon={createCustomIcon(item.itemId === selectedId)}
                  eventHandlers={{ click: () => setSelectedId(item.itemId) }}>
                  <Popup>
                    <div className="min-w-[180px]">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title}
                          className="w-full h-24 object-cover rounded-lg mb-2" />
                      )}
                      <p className="font-bold text-stone-900 text-sm leading-tight">{item.title}</p>
                      <p className="text-amber-600 font-semibold text-sm mt-1">${item.dailyPrice}/day</p>
                      <p className="text-stone-500 text-xs mt-1">{item.locationLabel}</p>
                      <Link to={`/items/${item.itemId}`}
                        className="mt-2 w-full block text-center bg-stone-900 text-white text-xs font-semibold py-1.5 rounded-lg hover:bg-stone-700 transition-all">
                        View Details
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {selected && <FlyTo coords={[selected.latitude, selected.longitude]} />}
            </MapContainer>
          )}
        </div>

        {/* Side list panel */}
        {showList && (
          <div className="w-72 bg-white border-l border-stone-200 overflow-y-auto flex-shrink-0">
            <div className="p-3 border-b border-stone-100">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                {items.length} items nearby
              </p>
            </div>
            {items.length === 0 ? (
              <div className="p-6 text-center text-stone-400 text-sm">
                No items in this area
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {items.map(item => (
                  <button key={item.itemId} onClick={() => setSelectedId(item.itemId)}
                    className={clsx('w-full text-left p-3 hover:bg-stone-50 transition-all flex gap-3 items-start',
                      selectedId === item.itemId && 'bg-amber-50')}>
                    <div className="w-14 h-14 rounded-xl bg-stone-100 overflow-hidden shrink-0">
                      {item.imageUrl
                        ? <img src={item.imageUrl} className="w-full h-full object-cover" />
                        : <div className="w-full h-full grid place-items-center text-xl">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900 truncate">{item.title}</p>
                      <p className="text-xs text-amber-600 font-medium">${item.dailyPrice}/day</p>
                      <p className="text-xs text-stone-400 truncate mt-0.5">
                        <MapPin size={10} className="inline mr-0.5" />{item.locationLabel || '—'}
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-stone-300 shrink-0 mt-1" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
