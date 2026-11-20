import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import {
  CATEGORIES,
  DURATION_MULTIPLIER,
  DURATIONS,
  GUEST_MULTIPLIER,
  GUESTS,
  TREATMENTS
} from './data';
import type { BookingItem, Duration, GuestCount, Treatment } from './types';

const WA_LINK = 'https://wa.me/2348080894549';
const SPACING = 300;

function formatNaira(n: number) {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function useAnimatedNumber(value: number, duration = 480) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    prev.current = end;
    if (start === end) {
      setDisplay(end);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(start + (end - start) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

export default function App() {
  const [category, setCategory] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [duration, setDuration] = useState<Duration>('60 Mins');
  const [guests, setGuests] = useState<GuestCount>('Solo Session');
  const [added, setAdded] = useState(false);
  const [booking, setBooking] = useState<BookingItem[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredTime, setPreferredTime] = useState('Day');
  const [openAcc, setOpenAcc] = useState<string>("What's Included");

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const posRef = useRef(0);
  const targetRef = useRef(0);
  const drag = useRef({ active: false, startX: 0, startPos: 0, moved: 0 });
  const suppressClick = useRef(false);

  const filtered = useMemo(
    () => (category === 'All' ? TREATMENTS : TREATMENTS.filter((t) => t.category === category)),
    [category]
  );

  const selected = TREATMENTS.find((t) => t.id === selectedId) || null;
  const price = selected
    ? selected.basePrice * DURATION_MULTIPLIER[duration] * GUEST_MULTIPLIER[guests]
    : 0;
  const animatedPrice = useAnimatedNumber(price);

  const total = booking.reduce((s, b) => s + b.price, 0);
  const animatedTotal = useAnimatedNumber(total);

  // Apply the real-time 3D curved-wall transforms for every frame.
  const applyTransforms = () => {
    const cards = cardRefs.current;
    for (let i = 0; i < filtered.length; i++) {
      const el = cards[i];
      if (!el) continue;
      const rel = i - posRef.current;
      const abs = Math.abs(rel);
      const clampedRel = clamp(rel, -4, 4);
      const rotY = clamp(-rel * 15, -32, 32);
      const z = -80 + Math.abs(clampedRel) * 26; // centre recedes deeper into the curve
      const x = clampedRel * SPACING;
      const scale = clamp(1 - abs * 0.07, 0.55, 1);
      const lift = clamp(1 - abs * 0.1, 0.5, 1);
      el.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${rotY}deg) scale(${scale})`;
      el.style.zIndex = String(200 - Math.round(abs * 20));
      el.style.filter = `brightness(${lift})`;
      el.style.boxShadow = `0 ${18 + abs * 10}px ${36 + abs * 14}px rgba(15, 41, 34, ${clamp(
        0.16 - abs * 0.02,
        0.03,
        0.16
      )})`;
    }
  };

  // requestAnimationFrame loop: ease the scroll position toward its target and repaint.
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      posRef.current += (targetRef.current - posRef.current) * 0.12;
      applyTransforms();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  // Centre the wall whenever the filtered set changes (and on first paint).
  useLayoutEffect(() => {
    const centre = filtered.length > 0 ? (filtered.length - 1) / 2 : 0;
    targetRef.current = centre;
    posRef.current = centre;
    applyTransforms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered]);

  // Horizontal mouse-wheel glide over the stage.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 0.5) return;
      const max = Math.max(0, filtered.length - 1);
      const next = clamp(targetRef.current + delta / 420, 0, max);
      if (next !== targetRef.current) {
        targetRef.current = next;
        e.preventDefault();
      }
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [filtered.length]);

  const scrollBy = (dir: number) => {
    const max = Math.max(0, filtered.length - 1);
    targetRef.current = clamp(targetRef.current + dir, 0, max);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { active: true, startX: e.clientX, startPos: targetRef.current, moved: 0 };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    const max = Math.max(0, filtered.length - 1);
    targetRef.current = clamp(drag.current.startPos - dx / SPACING, 0, max);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    if (drag.current.moved > 6) {
      suppressClick.current = true;
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 90);
    }
  };

  const handleSelect = (t: Treatment) => {
    if (suppressClick.current) return;
    setSelectedId(t.id);
    setDuration('60 Mins');
    setGuests('Solo Session');
    setAdded(false);
    setOpenAcc("What's Included");
  };

  const handleAdd = () => {
    if (!selected) return;
    const item: BookingItem = {
      id: `${selected.id}-${Date.now()}`,
      treatmentId: selected.id,
      duration,
      guests,
      price,
      addedAt: Date.now()
    };
    setBooking((prev) => [...prev, item]);
    setAdded(true);
  };

  const handleRemove = (id: string) => {
    setBooking((prev) => prev.filter((b) => b.id !== id));
  };

  const handleWhatsApp = () => {
    const lines = [
      'Hello Stellbeauty Massage Spa, I would like to book the following:',
      '',
      ...booking.map((b) => {
        const t = TREATMENTS.find((x) => x.id === b.treatmentId)!;
        return `• ${t.title} — ${b.duration}, ${b.guests} — ${formatNaira(b.price)}`;
      }),
      '',
      `Total: ${formatNaira(total)}`,
      `Name: ${name || '-'}`,
      `Phone: ${phone || '-'}`,
      `Preferred Time: ${preferredTime}`
    ];
    const url = `${WA_LINK}?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank', 'noopener');
  };

  const ritual = TREATMENTS.filter((t) => t.id !== selected?.id).slice(0, 3);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">STELLBEAUTY</div>
          <div className="header-right">
            <span className="badge">4.8★ (108 Reviews)</span>
            <button className="booking-pill" onClick={() => setDrawerOpen(true)}>
              Booking ({booking.length})
            </button>
            <a className="wa-link" href={WA_LINK} target="_blank" rel="noopener">
              WhatsApp +234 808 089 4549
            </a>
          </div>
        </div>
      </header>

      <main>
        {!selected && (
          <section className="stage" ref={stageRef}>
            <div className="stage-bg" aria-hidden="true">
              <div className="watermark">STELLBEAUTY</div>
              <div className="spotlight" />
            </div>

            <div className="stage-top">
              <span className="stage-eyebrow">THE SPA GALLERY · WUSE 2, ABUJA</span>
              <h1 className="stage-title">Step Inside the Curved Gallery</h1>
            </div>

            <div className="cat-row">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`cat-pill ${category === c ? 'active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div
              className="scene"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <div className="arc">
                {filtered.map((t, i) => (
                  <article
                    key={t.id}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="frame-card"
                    onClick={() => handleSelect(t)}
                  >
                    <div className="artwork">
                      <img
                        src={t.image}
                        alt={t.title}
                        width={600}
                        height={780}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="artwork-fallback" />
                    </div>
                    <div className="plate">
                      <span className="plate-cat">{t.category}</span>
                      <h3 className="plate-title">{t.title}</h3>
                      <span className="plate-price">{formatNaira(t.basePrice)}</span>
                    </div>
                    <button
                      className="plate-cta"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(t);
                      }}
                    >
                      Inspect & Configure
                    </button>
                  </article>
                ))}
              </div>
            </div>

            <div className="stage-controls">
              <button className="glass-arrow" onClick={() => scrollBy(-1)} aria-label="Previous">
                ‹
              </button>
              <span className="caption-pill">DRAG TO EXPLORE GALLERY · TAP ANY TREATMENT TO ZOOM IN</span>
              <button className="glass-arrow" onClick={() => scrollBy(1)} aria-label="Next">
                ›
              </button>
            </div>

            <div className="floor" aria-hidden="true" />
          </section>
        )}

        {selected && (
          <section className="configurator" key={selected.id}>
            <button className="back-pill" onClick={() => setSelectedId(null)}>
              ← Back to 3D Gallery
            </button>

            <div className="config-grid">
              <div className="config-photo-col">
                <div className="config-frame">
                  <img
                    src={selected.image}
                    alt={selected.title}
                    width={900}
                    height={1080}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="artwork-fallback large" />
                </div>
              </div>

              <div className="config-details">
                <span className="config-cat">{selected.category}</span>
                <h2 className="config-title">{selected.title}</h2>
                <div className="config-badge">
                  <span className="stars">4.8★</span>
                  <span className="dot">·</span>
                  <span>(108 Reviews)</span>
                  <span className="tag">Open 24/7</span>
                </div>

                <div className="config-price">{formatNaira(animatedPrice)}</div>
                <p className="config-desc">{selected.description}</p>

                <div className="option-group">
                  <span className="option-label">Session Duration</span>
                  <div className="pill-row">
                    {DURATIONS.map((d) => (
                      <button
                        key={d}
                        className={`option-pill ${duration === d ? 'active' : ''}`}
                        onClick={() => setDuration(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="option-group">
                  <span className="option-label">Guest Count</span>
                  <div className="pill-row">
                    {GUESTS.map((g) => (
                      <button
                        key={g}
                        className={`option-pill ${guests === g ? 'active' : ''}`}
                        onClick={() => setGuests(g)}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <button className={`add-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
                  {added ? 'ADDED TO BOOKING ✓' : 'ADD TO BOOKING'}
                </button>

                <div className="accordion">
                  {[
                    { key: "What's Included", content: selected.includes.join(' · ') },
                    {
                      key: 'Suite & Hygiene',
                      content:
                        'Private treatment suite, fresh linens, sanitised tools, and single-use disposables for every guest. Hygiene-first protocol maintained 24/7.'
                    },
                    {
                      key: 'Wuse 2 Location',
                      content:
                        'No. 5 Birao Street, off Yalinga Street, off Adetokunbo Ademola Crescent, Wuse 2, Abuja. Open 24 Hours every day.'
                    }
                  ].map((a) => {
                    const open = openAcc === a.key;
                    return (
                      <div key={a.key} className={`acc-item ${open ? 'open' : ''}`}>
                        <button className="acc-header" onClick={() => setOpenAcc(open ? '' : a.key)}>
                          {a.key}
                          <span className="acc-icon">{open ? '−' : '+'}</span>
                        </button>
                        <div className="acc-body">
                          <div className="acc-body-inner">{a.content}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="ritual">
              <h3 className="section-title">COMPLETE YOUR RITUAL</h3>
              <div className="ritual-grid">
                {ritual.map((t) => (
                  <button key={t.id} className="ritual-card" onClick={() => handleSelect(t)}>
                    <img src={t.image} alt={t.title} width={320} height={220} loading="lazy" />
                    <span className="ritual-title">{t.title}</span>
                    <span className="ritual-price">{formatNaira(t.basePrice)}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="reviews-section">
          <h3 className="section-title">4.8★ WUSE 2 REVIEWS</h3>
          <div className="reviews-grid">
            {[
              {
                name: 'Amina O.',
                text: 'Best massage in Wuse 2. The hot stone ritual was heavenly and the suite was spotless.'
              },
              {
                name: 'Chidi N.',
                text: 'Open 24/7 saved me after a late flight. Deep tissue was exactly what I needed.'
              },
              {
                name: 'Fatima B.',
                text: 'Glass-skin facial left me glowing for days. Lovely staff and serene space.'
              }
            ].map((r) => (
              <div key={r.name} className="review-card">
                <div className="review-stars">★★★★★</div>
                <p className="review-text">“{r.text}”</p>
                <span className="review-name">— {r.name}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">STELLBEAUTY MASSAGE SPA</div>
          <div className="footer-info">
            <p>No. 5 Birao Street, off Yalinga Street, off Adetokunbo Ademola Crescent, Wuse 2, Abuja</p>
            <p>Open 24 Hours · +234 808 089 4549</p>
          </div>
        </div>
      </footer>

      {drawerOpen && (
        <div className="drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <aside className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Booking Summary</h3>
              <button className="drawer-close" onClick={() => setDrawerOpen(false)}>
                ×
              </button>
            </div>
            <div className="drawer-body">
              {booking.length === 0 && <p className="empty">No treatments added yet.</p>}
              {booking.map((b) => {
                const t = TREATMENTS.find((x) => x.id === b.treatmentId)!;
                return (
                  <div key={b.id} className="drawer-item">
                    <div>
                      <div className="drawer-item-title">{t.title}</div>
                      <div className="drawer-item-meta">
                        {b.duration} · {b.guests}
                      </div>
                    </div>
                    <div className="drawer-item-right">
                      <span>{formatNaira(b.price)}</span>
                      <button className="remove-btn" onClick={() => handleRemove(b.id)}>
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className="drawer-total">
                <span>Total</span>
                <span>{formatNaira(animatedTotal)}</span>
              </div>

              <label className="field">
                <span>Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </label>
              <label className="field">
                <span>Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234..." />
              </label>
              <label className="field">
                <span>Preferred Time</span>
                <select value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)}>
                  <option>Day</option>
                  <option>Late-Night 24/7</option>
                </select>
              </label>

              <button className="wa-btn" onClick={handleWhatsApp} disabled={booking.length === 0}>
                Send Booking via WhatsApp
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
