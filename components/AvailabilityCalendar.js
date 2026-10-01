'use client';

import { useMemo, useState } from 'react';
import { createClient, friendlyError } from '@/lib/supabase/client';
import { MONTHS, WEEKDAYS, isoDay, todayIso, formatLongDate } from '@/lib/vendor';

function MonthGrid({ year, month, busy, today, editable, pending, onToggle }) {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7; // lunes = 0
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  return (
    <div className="cal-month">
      <div className="cal-title">{MONTHS[month]} {year}</div>
      <div className="cal-grid" role="grid" aria-label={`${MONTHS[month]} ${year}`}>
        {WEEKDAYS.map((w) => (
          <div key={w} className="cal-weekday" aria-hidden="true">{w}</div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />;
          const iso = isoDay(year, month, d);
          const status = busy.get(iso);
          const past = iso < today;
          const cls = ['cal-day', status ? `cal-${status}` : 'cal-free', past ? 'cal-past' : '', iso === today ? 'cal-today' : '', pending.has(iso) ? 'cal-pending' : '']
            .filter(Boolean)
            .join(' ');
          const label = `${formatLongDate(iso)}: ${status === 'reservada' ? 'reservada' : status ? 'ocupada' : 'libre'}`;
          if (!editable || past) {
            return (
              <div key={iso} className={cls} aria-label={label} title={label}>{d}</div>
            );
          }
          return (
            <button key={iso} type="button" className={cls} aria-label={label} aria-pressed={Boolean(status)} title={label} onClick={() => onToggle(iso)}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AvailabilityCalendar({ vendorId, initialBusy = [], editable = false, months = 2, maxAhead = 24 }) {
  const today = todayIso();
  const now = new Date();
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(() => new Map(initialBusy.map((r) => [r.day, r.status])));
  const [pending, setPending] = useState(() => new Set());
  const [error, setError] = useState('');
  const [check, setCheck] = useState('');

  const visible = useMemo(() => {
    const out = [];
    for (let i = 0; i < months; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + offset + i, 1);
      out.push({ year: d.getFullYear(), month: d.getMonth() });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, months]);

  async function toggle(iso) {
    if (pending.has(iso)) return;
    const current = busy.get(iso);
    if (current === 'reservada' && !window.confirm('Esta fecha está marcada como reservada en Brindis. ¿Liberarla igual?')) return;
    setError('');
    setPending((p) => new Set(p).add(iso));
    setBusy((m) => {
      const n = new Map(m);
      if (current) n.delete(iso);
      else n.set(iso, 'ocupada');
      return n;
    });
    const supabase = createClient();
    const res = current
      ? await supabase.from('vendor_availability').delete().eq('vendor_id', vendorId).eq('day', iso)
      : await supabase.from('vendor_availability').insert({ vendor_id: vendorId, day: iso, status: 'ocupada' });
    setPending((p) => {
      const n = new Set(p);
      n.delete(iso);
      return n;
    });
    if (res.error && !(res.error.code === '23505')) {
      setError(friendlyError(res.error));
      setBusy((m) => {
        const n = new Map(m);
        if (current) n.set(iso, current);
        else n.delete(iso);
        return n;
      });
    }
  }

  const checkStatus = check ? (busy.get(check) ? 'ocupada' : check < today ? 'pasada' : 'libre') : null;
  const busyFuture = [...busy.keys()].filter((d) => d >= today).length;

  return (
    <div className="stack gap-16">
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div className="cal-legend">
          <span><i className="cal-dot cal-dot-free" /> Libre</span>
          <span><i className="cal-dot cal-dot-busy" /> Ocupada</span>
          {editable && <span className="hint">{busyFuture} fechas ocupadas desde hoy</span>}
        </div>
        <div className="row-wrap gap-8">
          <button type="button" className="btn btn-outline btn-xs" onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0} aria-label="Mes anterior">‹ Anterior</button>
          <button type="button" className="btn btn-outline btn-xs" onClick={() => setOffset((o) => Math.min(maxAhead - months, o + 1))} disabled={offset >= maxAhead - months} aria-label="Mes siguiente">Siguiente ›</button>
        </div>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="cal-months">
        {visible.map((m) => (
          <MonthGrid key={`${m.year}-${m.month}`} year={m.year} month={m.month} busy={busy} today={today} editable={editable} pending={pending} onToggle={toggle} />
        ))}
      </div>

      {!editable && (
        <div className="card stack gap-12">
          <label htmlFor="check-date" style={{ fontWeight: 700 }}>¿Está libre en tu fecha?</label>
          <div className="row-wrap gap-12" style={{ alignItems: 'center' }}>
            <input id="check-date" type="date" className="input" style={{ maxWidth: 220 }} min={today} value={check} onChange={(e) => setCheck(e.target.value)} />
            {checkStatus === 'libre' && <span className="badge badge-ok">Libre el {formatLongDate(check).toLowerCase()}</span>}
            {checkStatus === 'ocupada' && <span className="badge badge-wine">Ocupado ese día</span>}
            {checkStatus === 'pasada' && <span className="badge badge-wait">Esa fecha ya pasó</span>}
          </div>
        </div>
      )}
    </div>
  );
}
