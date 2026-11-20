import { useMemo, useRef, useState } from 'react';
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

function formatNaira(n: number) {
  return '₦' + Math.round(n).toLocaleString('en-NG');
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
  const [openAcc, setOpenAcc] = useState<string>('What\'s Included');

  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ dragging: false, startX: 0, scrollStart: 0 });

  const filtered = useMemo(
    () =>
      category === 'All'
        ? TREATMENTS
        : TREATMENTS.filter((t) => t.category === category),
    [category]
  );

  const selected = TREATMENTS.find((t) => t.id === selectedId) || null;

  const price = selected
    ? selected.basePrice * DURATION_MULTIPLIER[duration] * GUEST_MULTIPLIER[guests]
    : 0;

  const total = booking.reduce((s, b) => s + b.price, 0);

  const handleSelect = (t: Treatment) => {
    setSelectedId(t.id);
    setDuration('60 Mins');
    setGuests('Solo Session');
    setAdded(false);
    setOpenAcc("What's Included");
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  // drag handlers
  const onPointerDown = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    dragState.current = { dragging: true, startX: e.clientX, scrollStart: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el || !dragState.current.dragging) return;
    const dx = e.clientX - dragState.current.startX;
    el.scrollLeft = dragState.current.scrollStart - dx;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const el = trackRef.current;
    if (!el) return;
    dragState.current.dragging = false;
    try {
      el.releasePointerCapture(e.pointerId);
    } catch {}
  };

  const scrollTrack = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  const exploreMore = selected
    ? TREATMENTS.filter((t) => t.id !== selected.id).slice(0, 3)
    : [];

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
          <section className="gallery-section">
            <div className="caption-row">
              <span className="caption">THE SPA GALLERY · WUSE 2, ABUJA</span>
              <span className="caption">4.8★ · 108 GOOGLE REVIEWS · OPEN 24/7</span>
            </div>
            <h1 className="display">Curated Spa & Wellness Treatments</h1>
            <p className="lead">
              Glide through our gallery of restorative treatments, then configure your session in seconds.
            </p>

            <div className="category-row">
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

            <div className="gallery-wrap">
              <button className="nav-arrow left" onClick={() => scrollTrack(-1)} aria-label="Previous">
                ‹
              </button>
              <div
                className="gallery-track"
                ref={trackRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <div className="gallery-arc">
                  {filtered.map((t) => (
                    <article
                      key={t.id}
                      className="gallery-card"
                      onClick={() => handleSelect(t)}
                    >
                      <div className="frame">
                        <img
                          src={t.image}
                          alt={t.title}
                          width={400}
                          height={520}
                          loading="lazy"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div className="frame-fallback" />
                      </div>
                      <div className="card-meta">
                        <span className="card-cat">{t.category}</span>
                        <h3 className="card-title">{t.title}</h3>
                        <span className="card-price">{formatNaira(t.basePrice)}</span>
                      </div>
                      <button
                        className="inspect-btn"
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
              <button className="nav-arrow right" onClick={() => scrollTrack(1)} aria-label="Next">
                ›
              </button>
            </div>
          </section>
        )}

        {selected && (
          <section className="configurator">
            <button className="back-btn" onClick={() => setSelectedId(null)}>
              ← Back to Gallery
            </button>
            <div className="config-grid">
              <div className="config-image-wrap">
                <div className="config-frame">
                  <img
                    src={selected.image}
                    alt={selected.title}
                    width={800}
                    height={960}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div className="frame-fallback large" />
                </div>
              </div>
              <div className="config-details">
                <span className="config-cat">{selected.category}</span>
                <h2 className="config-title">{selected.title}</h2>
                <div className="config-rating">
                  <span className="stars">4.8★</span>
                  <span className="tag">Open 24/7</span>
                </div>
                <div className="config-price">{formatNaira(price)}</div>
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

                <button
                  className={`add-btn ${added ? 'added' : ''}`}
                  onClick={handleAdd}
                >
                  {added ? 'ADDED TO BOOKING ✓' : 'ADD TO BOOKING'}
                </button>

                <div className="accordion">
                  {[
                    { key: "What's Included", content: selected.includes.join(' · ') },
                    {
                      key: 'Private Suite & Hygiene',
                      content:
                        'Private treatment suite, fresh linens, sanitised tools, and single-use disposables for every guest. Hygiene-first protocol maintained 24/7.'
                    },
                    {
                      key: 'Wuse 2 Location & 24/7 Hours',
                      content:
                        'No. 5 Birao Street, off Yalinga Street, off Adetokunbo Ademola Crescent, Wuse 2, Abuja. Open 24 Hours every day.'
                    }
                  ].map((a) => (
                    <div key={a.key} className="acc-item">
                      <button
                        className={`acc-header ${openAcc === a.key ? 'open' : ''}`}
                        onClick={() => setOpenAcc(openAcc === a.key ? '' : a.key)}
                      >
                        {a.key}
                        <span className="acc-icon">{openAcc === a.key ? '−' : '+'}</span>
                      </button>
                      {openAcc === a.key && <div className="acc-body">{a.content}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="explore-more">
              <h3 className="section-title">EXPLORE MORE TREATMENTS</h3>
              <div className="explore-grid">
                {exploreMore.map((t) => (
                  <button
                    key={t.id}
                    className="explore-card"
                    onClick={() => handleSelect(t)}
                  >
                    <img src={t.image} alt={t.title} width={300} height={200} loading="lazy" />
                    <span className="explore-title">{t.title}</span>
                    <span className="explore-price">{formatNaira(t.basePrice)}</span>
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
              { name: 'Amina O.', text: 'Best massage in Wuse 2. The hot stone ritual was heavenly and the suite was spotless.' },
              { name: 'Chidi N.', text: 'Open 24/7 saved me after a late flight. Deep tissue was exactly what I needed.' },
              { name: 'Fatima B.', text: 'Glass-skin facial left me glowing for days. Lovely staff and serene space.' }
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
              <button className="drawer-close" onClick={() => setDrawerOpen(false)}>×</button>
            </div>
            <div className="drawer-body">
              {booking.length === 0 && <p className="empty">No treatments added yet.</p>}
              {booking.map((b) => {
                const t = TREATMENTS.find((x) => x.id === b.treatmentId)!;
                return (
                  <div key={b.id} className="drawer-item">
                    <div>
                      <div className="drawer-item-title">{t.title}</div>
                      <div className="drawer-item-meta">{b.duration} · {b.guests}</div>
                    </div>
                    <div className="drawer-item-right">
                      <span>{formatNaira(b.price)}</span>
                      <button className="remove-btn" onClick={() => handleRemove(b.id)}>×</button>
                    </div>
                  </div>
                );
              })}
              <div className="drawer-total">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
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
