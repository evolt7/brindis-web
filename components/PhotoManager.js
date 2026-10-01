'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, friendlyError } from '@/lib/supabase/client';
import { photoUrl, PHOTO_BUCKET, MAX_PHOTOS } from '@/lib/vendor';

// Reduce la foto a máximo 1600 px y la convierte a JPEG para que cargue rápido y ocupe poco.
async function compressImage(file, maxSide = 1600, quality = 0.82) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  if (bitmap.close) bitmap.close();
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('compress'))), 'image/jpeg', quality);
  });
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function PhotoManager({ vendorId, ownerId, initialPhotos }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [photos, setPhotos] = useState(initialPhotos);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  const remaining = MAX_PHOTOS - photos.length;

  async function onFiles(e) {
    const files = Array.from(e.target.files || []).slice(0, remaining);
    e.target.value = '';
    if (!files.length) return;
    setError('');
    setBusy(true);
    const supabase = createClient();
    let position = photos.length ? Math.max(...photos.map((p) => p.position)) + 1 : 0;
    const added = [];
    for (let i = 0; i < files.length; i++) {
      setProgress(`Subiendo ${i + 1} de ${files.length}…`);
      try {
        const blob = await compressImage(files[i]);
        const path = `${ownerId}/${newId()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000', upsert: false });
        if (upErr) throw upErr;
        const { data, error: dbErr } = await supabase
          .from('vendor_photos')
          .insert({ vendor_id: vendorId, path, position })
          .select()
          .single();
        if (dbErr) {
          await supabase.storage.from(PHOTO_BUCKET).remove([path]);
          throw dbErr;
        }
        added.push(data);
        position += 1;
      } catch (err) {
        const m = (err && err.message) || '';
        if (m.includes('Máximo 12')) setError('Ya tienes el máximo de 12 fotos.');
        else if (m === 'compress' || err instanceof DOMException) setError(`No pudimos leer "${files[i].name}". Usa fotos JPG o PNG.`);
        else setError(friendlyError(err));
        break;
      }
    }
    setPhotos((prev) => [...prev, ...added]);
    setBusy(false);
    setProgress('');
    router.refresh();
  }

  async function remove(photo) {
    if (!window.confirm('¿Eliminar esta foto?')) return;
    setError('');
    const supabase = createClient();
    const { error: dbErr } = await supabase.from('vendor_photos').delete().eq('id', photo.id);
    if (dbErr) {
      setError(friendlyError(dbErr));
      return;
    }
    await supabase.storage.from(PHOTO_BUCKET).remove([photo.path]);
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    router.refresh();
  }

  async function makeCover(photo) {
    setError('');
    const min = Math.min(...photos.map((p) => p.position));
    const supabase = createClient();
    const { error: dbErr } = await supabase.from('vendor_photos').update({ position: min - 1 }).eq('id', photo.id);
    if (dbErr) {
      setError(friendlyError(dbErr));
      return;
    }
    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, position: min - 1 } : p)).sort((a, b) => a.position - b.position)
    );
    router.refresh();
  }

  return (
    <div className="stack gap-20">
      <div className="card stack gap-12">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div className="stack gap-4">
            <span style={{ fontWeight: 700 }}>{photos.length} de {MAX_PHOTOS} fotos</span>
            <span className="hint">La primera es la portada. Usa fotos horizontales, bien iluminadas y de eventos reales.</span>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => inputRef.current?.click()} disabled={busy || remaining <= 0}>
            {busy ? progress || 'Subiendo…' : 'Subir fotos'}
          </button>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/*" multiple className="sr-only" onChange={onFiles} aria-label="Elegir fotos" />
        </div>
        {error && <div className="alert alert-error" role="alert">{error}</div>}
      </div>

      {photos.length === 0 ? (
        <div className="card-soft stack gap-8" style={{ textAlign: 'center', alignItems: 'center', padding: 48 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#7A2E4A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-8 8" /></svg>
          <span style={{ fontWeight: 700 }}>Todavía no tienes fotos</span>
          <span className="body" style={{ fontSize: 15 }}>Los perfiles con al menos 5 fotos reciben muchas más consultas.</span>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((p, i) => (
            <figure key={p.id} className="photo-item">
              <img src={photoUrl(p.path)} alt={`Foto ${i + 1}`} loading="lazy" />
              {i === 0 && <span className="badge badge-ok photo-badge">Portada</span>}
              <figcaption className="photo-actions">
                {i !== 0 && (
                  <button type="button" className="btn btn-light btn-xs" onClick={() => makeCover(p)} aria-label={`Usar la foto ${i + 1} como portada`}>Portada</button>
                )}
                <button type="button" className="btn btn-light btn-xs" onClick={() => remove(p)} aria-label={`Eliminar foto ${i + 1}`}>Eliminar</button>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
