// src/pages/CreateListing.jsx
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Upload, X, MapPin, DollarSign, Tag, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

// Fix Leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STEPS = ['Details', 'Pricing', 'Location', 'Photos'];

function LocationPicker({ value, onChange }) {
  useMapEvents({
    click(e) { onChange({ lat: e.latlng.lat, lng: e.latlng.lng }); }
  });
  return value ? <Marker position={[value.lat, value.lng]} /> : null;
}

export default function CreateListing() {
  const navigate = useNavigate();
  const [step,      setStep]      = useState(0);
  const [location,  setLocation]  = useState(null);
  const [images,    setImages]    = useState([]);
  const [tagInput,  setTagInput]  = useState('');
  const [tags,      setTags]      = useState([]);
  const fileRef = useRef();

  const { data: catData } = useQuery('categories',
    () => api.get('/categories').then(r => r.data.data));

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: { conditionRating: 'GOOD', securityDeposit: '0' }
  });

  const { mutate: submit, isLoading } = useMutation(
    (formData) => api.post('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    {
      onSuccess: (res) => {
        toast.success('Item listed successfully!');
        navigate(`/items/${res.data.data.itemId}`);
      }
    }
  );

  const onFinalSubmit = (data) => {
    if (!location) { toast.error('Please pin your item location on the map'); setStep(2); return; }
    const fd = new FormData();
    const itemPayload = {
      ...data, latitude: location.lat, longitude: location.lng,
      dailyPrice: parseFloat(data.dailyPrice),
      securityDeposit: parseFloat(data.securityDeposit || 0),
      tags,
    };
    fd.append('item', new Blob([JSON.stringify(itemPayload)], { type: 'application/json' }));
    images.forEach(f => fd.append('images', f));
    submit(fd);
  };

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags(t => [...t, tagInput.trim()]);
      setTagInput('');
    }
  };

  const addImages = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    setImages(prev => [...prev, ...valid].slice(0, 5));
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="font-display font-black text-3xl text-stone-900 mb-2">List an Item</h1>
      <p className="text-stone-500 mb-8 text-sm">Share your stuff with fellow students and earn daily rental income.</p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={clsx('flex items-center gap-1.5',
              i <= step ? 'text-stone-900' : 'text-stone-400')}>
              <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2',
                i < step  ? 'bg-amber-400 border-amber-400 text-stone-900' :
                i === step ? 'border-stone-900 text-stone-900' :
                             'border-stone-300 text-stone-400')}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-sm font-medium hidden sm:block">{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={clsx('flex-1 h-0.5 w-8', i < step ? 'bg-amber-400' : 'bg-stone-200')} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onFinalSubmit)}>

        {/* Step 0: Details */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="label">Category</label>
              <select {...register('categoryId', { required: 'Category required' })}
                className="input">
                <option value="">Select a category</option>
                {catData?.content?.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="error">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label className="label">Title</label>
              <input {...register('title', { required: 'Title required', maxLength: 200 })}
                placeholder="e.g. DJI Mavic Mini Drone" className="input" />
              {errors.title && <p className="error">{errors.title.message}</p>}
            </div>

            <div>
              <label className="label">Description</label>
              <textarea rows={4} {...register('description', { required: 'Description required' })}
                placeholder="Describe the item, its condition, included accessories…"
                className="input resize-none" />
              {errors.description && <p className="error">{errors.description.message}</p>}
            </div>

            <div>
              <label className="label">Condition</label>
              <div className="grid grid-cols-4 gap-2">
                {['POOR','FAIR','GOOD','EXCELLENT'].map(c => (
                  <label key={c} className={clsx(
                    'border-2 rounded-xl p-3 text-center cursor-pointer transition-all text-sm font-medium',
                    watch('conditionRating') === c
                      ? 'border-amber-400 bg-amber-50 text-amber-800'
                      : 'border-stone-200 text-stone-500 hover:border-stone-400')}>
                    <input type="radio" value={c} {...register('conditionRating')} className="hidden" />
                    <span>{c === 'POOR' ? '❌' : c === 'FAIR' ? '⚠️' : c === 'GOOD' ? '👍' : '✨'}</span>
                    <p className="mt-1 text-xs">{c.charAt(0) + c.slice(1).toLowerCase()}</p>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="label">Tags <span className="font-normal text-stone-400">(press Enter)</span></label>
              <div className="border border-stone-200 rounded-xl p-3 flex flex-wrap gap-2 focus-within:ring-2 focus-within:ring-amber-400">
                {tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 bg-stone-100 text-stone-700 text-xs px-2.5 py-1 rounded-full">
                    {t} <button type="button" onClick={() => setTags(ts => ts.filter(x => x !== t))}><X size={11} /></button>
                  </span>
                ))}
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag}
                  placeholder="Add tag…" className="flex-1 min-w-[100px] outline-none text-sm bg-transparent placeholder:text-stone-400" />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Pricing */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="label">Daily Rental Price ($)</label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="number" step="0.01" min="0.50"
                  {...register('dailyPrice', { required: 'Price required', min: { value: 0.5, message: 'Min $0.50' }})}
                  placeholder="5.00" className="input pl-9" />
              </div>
              {errors.dailyPrice && <p className="error">{errors.dailyPrice.message}</p>}
            </div>

            <div>
              <label className="label">
                Security Deposit ($)
                <span className="ml-1 text-stone-400 font-normal">— optional, returned after rental</span>
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="number" step="0.01" min="0"
                  {...register('securityDeposit')}
                  placeholder="0.00" className="input pl-9" />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-1">Pricing tips 💡</p>
              <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                <li>Research similar items on the platform</li>
                <li>Consider wear and depreciation in your price</li>
                <li>Use a deposit for expensive or fragile items</li>
                <li>Lower prices get more rental requests</li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="label">Location Label</label>
              <input {...register('locationLabel')}
                placeholder="e.g. Engineering Building, Room 204"
                className="input" />
            </div>
            <div>
              <label className="label">Pin on Campus Map</label>
              <p className="text-xs text-stone-500 mb-2">Click on the map to set the handoff location</p>
              <div className="rounded-2xl overflow-hidden border border-stone-200 h-72">
                <MapContainer center={[40.7128, -74.006]} zoom={16} className="h-full w-full">
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; OSM &copy; CARTO'
                  />
                  <LocationPicker value={location} onChange={setLocation} />
                </MapContainer>
              </div>
              {location && (
                <p className="text-xs text-emerald-600 font-medium mt-2 flex items-center gap-1">
                  <MapPin size={12} /> Pinned at {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                </p>
              )}
              {!location && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <MapPin size={12} /> Click the map to set your location
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div className="space-y-4">
            <label className="label">Photos <span className="font-normal text-stone-400">(up to 5)</span></label>

            <div
              onClick={() => fileRef.current.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); addImages(e.dataTransfer.files); }}
              className="border-2 border-dashed border-stone-300 hover:border-amber-400 rounded-2xl p-8 text-center cursor-pointer transition-all group">
              <Upload size={28} className="mx-auto text-stone-300 group-hover:text-amber-400 mb-3 transition-colors" />
              <p className="text-sm font-medium text-stone-600">Drop images here or click to upload</p>
              <p className="text-xs text-stone-400 mt-1">JPG, PNG — max 10MB each</p>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                onChange={e => addImages(e.target.files)} />
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {images.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 group">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-stone-900/70 text-white rounded-full grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 bg-amber-400 text-stone-900 text-xs font-bold px-2 py-0.5 rounded-full">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-stone-100">
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 border border-stone-200 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-all">
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(s => s + 1)}
              className="flex-1 flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 rounded-xl text-sm transition-all">
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button type="submit" disabled={isLoading}
              className="flex-1 bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-stone-900 font-bold py-3 rounded-xl text-sm transition-all">
              {isLoading ? 'Publishing…' : '🚀 Publish Listing'}
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
