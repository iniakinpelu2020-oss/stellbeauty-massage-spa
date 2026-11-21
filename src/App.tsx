import { useEffect, useMemo, useState } from 'react';
import {
  BUSINESS,
  CATEGORIES,
  COUPLE_MULTIPLIER,
  DURATION_MULTIPLIER,
  MARQUEE_ITEMS,
  TREATMENTS
} from './data';
import type { BookingItem, Category, Duration, Treatment } from './types';

type CardState = { duration: Duration; coupleSuite: boolean };

const PHONE_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.4 21 3 13.6 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WA_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M20 11.5a8.5 8.5 0 0 1-12.65 7.43L4 20l1.2-3.2A8.5 8.5 0 1 1 20 11.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.4 9.3c.2-.5.4-.5.6-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4 0 .6l-.3.4c-.1.2-.1.4 0 .5.4.7 1 1.3 1.7 1.7.2.1.4.1.5 0l.4-.3c.2-.1.4-.1.6 0l1.7.7c.3.1.4.3.4.5v.5c0 .2 0 .4-.5.6-.4.2-1.3.4-2.7-.2-1.6-.7-3.1-2.2-3.8-3.8-.6-1.4-.4-2.3-.3-2.8Z"
      fill="currentColor"
    />
  </svg>
);

const CLOCK_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M12 7.5v4.6l3 1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PIN_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M12 21s6-5.2 6-10.2A6 6 0 1 0 6 10.8C6 15.8 12 21 12 21Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10.8" r="2.2" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

function formatNaira(amount: number) {
  return '₦' + Math.round(amount).toLocaleString('en-NG');
}

function calcPrice(basePrice: number, duration: Duration, coupleSuite: boolean) {
  return basePrice * DURATION_MULTIPLIER[duration] * (coupleSuite ? COUPLE_MULTIPLIER : 1);
}

function getAbujaStatus() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: BUSINESS.timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(new Date());
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  // Open 24 hours daily
  const open = hour >= 0 && hour <= 23 && minute >= 0;
  const timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} WAT`;
  return { open, timeLabel };
}

function FallbackImage({ className }: { className?: string }) {
  return <div className={className} aria-hidden="true" />;
}

function SmartImage({
  src,
  alt,
  className,
  width,
  height,
  loading
}: {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
  loading?: 'lazy' | 'eager';
}) {
  const [error, setError] = useState(false);
  if (error) return <FallbackImage className={className} />;
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={loading}
      onError={() => setError(true)}
    />
  );
}

function DeckCard({
  treatment,
  kicker,
  index,
  active,
  onActivate
}: {
  treatment: Treatment;
  kicker: string;
  index: number;
  active: boolean;
  onActivate: () => void;
}) {
  return (
    <article
      className={`deck-card ${active ? 'active' : ''}`}
      style={{ zIndex: active ? 6 : 3 - index }}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`${treatment.title} highlight card`}
    >
      <div className="deck-media">
        <SmartImage src={treatment.image} alt={treatment.title} width={640} height={480} loading={index === 0 ? 'eager' : 'lazy'} />
      </div>
      <div className="deck-body">
        <div className="deck-kicker">{kicker}</div>
        <h3 className="deck-title">{treatment.title}</h3>
        <p className="deck-meta">From {formatNaira(treatment.basePrice)} · {treatment.category}</p>
      </div>
    </article>
  );
}

export default function App() {
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [cardStates, setCardStates] = useState<Record<string, CardState>>(() => {
    const initial: Record<string, CardState> = {};
    for (const t of TREATMENTS) initial[t.id] = { duration: '60 Mins', coupleSuite: false };
    return initial;
  });
  const [booking, setBooking] = useState<BookingItem[]>([]);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [filterTick, setFilterTick] = useState(0);
  const [activeDeck, setActiveDeck] = useState(0);
  const [status, setStatus] = useState(getAbujaStatus);

  useEffect(() => {
    const id = window.setInterval(() => setStatus(getAbujaStatus()), 30000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!lastAddedId) return;
    const id = window.setTimeout(() => setLastAddedId(null), 1400);
    return () => window.clearTimeout(id);
  }, [lastAddedId]);

  const filtered = useMemo(
    () => (category === 'All' ? TREATMENTS : TREATMENTS.filter((t) => t.category === category)),
    [category]
  );

  const total = useMemo(() => booking.reduce((sum, item) => sum + item.price, 0), [booking]);

  const heroDeck = useMemo(() => [TREATMENTS[0], TREATMENTS[2], TREATMENTS[5]], []);

  const updateCardState = (id: string, patch: Partial<CardState>) => {
    setCardStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const addToBooking = (treatment: Treatment) => {
    const state = cardStates[treatment.id] ?? { duration: '60 Mins', coupleSuite: false };
    const price = calcPrice(treatment.basePrice, state.duration, state.coupleSuite);
    const item: BookingItem = {
      id: `${treatment.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      treatmentId: treatment.id,
      duration: state.duration,
      coupleSuite: state.coupleSuite,
      price,
      addedAt: Date.now()
    };
    setBooking((prev) => [...prev, item]);
    setLastAddedId(treatment.id);
  };

  const removeBookingItem = (id: string) => {
    setBooking((prev) => prev.filter((b) => b.id !== id));
  };

  const bookingSummary = useMemo(() => {
    if (booking.length === 0) return 'Select treatments and tailor duration or Couple’s Suite.';
    return booking
      .map((b) => {
        const t = TREATMENTS.find((x) => x.id === b.treatmentId);
        if (!t) return null;
        return `${t.title} (${b.duration}${b.coupleSuite ? ", Couple's Suite" : ''})`;
      })
      .filter(Boolean)
      .join(' · ');
  }, [booking]);

  const whatsappHref = useMemo(() => {
    if (booking.length === 0) {
      return `${BUSINESS.whatsapp}?text=${encodeURIComponent(
        `Hello ${BUSINESS.name}, I would like to make a booking at your ${BUSINESS.area} sanctuary.`
      )}`;
    }
    const lines = [
      `Hello ${BUSINESS.name}, I would like to book the following:`,
      '',
      ...booking.map((b, i) => {
        const t = TREATMENTS.find((x) => x.id === b.treatmentId)!;
        const suite = b.coupleSuite ? ", Couple's Suite" : '';
        return `${i + 1}. ${t.title} — ${b.duration}${suite} — ${formatNaira(b.price)}`;
      }),
      '',
      `Total: ${formatNaira(total)}`,
      `Location: ${BUSINESS.address}`
    ];
    return `${BUSINESS.whatsapp}?text=${encodeURIComponent(lines.join('\n'))}`;
  }, [booking, total]);

  const onFilterChange = (next: Category | 'All') => {
    setCategory(next);
    setFilterTick((t) => t + 1);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand" aria-label={BUSINESS.name}>
            Stellbeauty <em>Massage & Spa</em>
          </div>
          <div className="topbar-actions">
            <a className="topbar-link" href={BUSINESS.phoneTel}>{BUSINESS.phoneDisplay}</a>
            <a className="btn btn-secondary" href={BUSINESS.phoneTel} aria-label="Call Stellbeauty">
              {PHONE_ICON}
              <span>Call</span>
            </a>
            <a className="btn btn-primary" href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Book on WhatsApp">
              {WA_ICON}
              <span>WhatsApp Booking</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow">Wuse 2, Abuja · 24-Hour Sanctuary</span>
              <h1>
                An editorial ritual of calm, <em>crafted for</em> body and skin.
              </h1>
              <p className="hero-lead">
                {BUSINESS.name} offers unhurried massage, facial, and body therapies in a private Wuse 2 sanctuary.
                Tailor each session by duration or Couple’s Suite and reserve instantly on WhatsApp.
              </p>
              <div className="status-pill" role="status" aria-live="polite">
                <span className="status-dot" aria-hidden="true" />
                <span>{status.open ? 'Open now' : 'Closed'} · Abuja (WAT) {status.timeLabel}</span>
              </div>
              <div className="hero-meta">
                <span>{CLOCK_ICON}{BUSINESS.hoursLabel}</span>
                <span>{PIN_ICON}{BUSINESS.area}</span>
              </div>
              <div className="hero-cta">
                <a className="btn btn-accent" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  {WA_ICON}
                  <span>Book on WhatsApp</span>
                </a>
                <a className="btn btn-secondary" href={BUSINESS.phoneTel}>
                  {PHONE_ICON}
                  <span>Call {BUSINESS.phoneDisplay}</span>
                </a>
              </div>
            </div>

            <div className="hero-right">
              <div className="deck" aria-label="Signature treatment highlights">
                {heroDeck.map((t, i) => (
                  <DeckCard
                    key={t.id}
                    treatment={t}
                    kicker={i === 0 ? 'Signature Massage' : i === 1 ? 'Radiance Facial' : 'VIP Sanctuary'}
                    index={i}
                    active={activeDeck === i}
                    onActivate={() => setActiveDeck(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="marquee-wrap" aria-label="Signature treatments and sanctuary perks">
          <div className="marquee">
            {[0, 1].map((copy) => (
              <div className="marquee-track" key={copy} aria-hidden={copy === 1}>
                {MARQUEE_ITEMS.map((item, idx) => (
                  <span className="marquee-item" key={`${copy}-${idx}`}>{item}</span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="section" id="services">
          <div className="container">
            <div className="section-head">
              <div>
                <h2 className="section-title">Curated treatments, <em>priced live</em></h2>
                <p className="section-sub">
                  Explore the full {BUSINESS.shortName} service menu. Choose 60 or 90 minutes and add a Couple’s Suite to see your ₦ total update instantly.
                </p>
              </div>
            </div>

            <div className="filters" role="tablist" aria-label="Treatment categories">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={category === c}
                  className={`filter-pill ${category === c ? 'active' : ''}`}
                  onClick={() => onFilterChange(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="services-grid" key={`${category}-${filterTick}`}>
              {filtered.map((treatment) => {
                const state = cardStates[treatment.id] ?? { duration: '60 Mins', coupleSuite: false };
                const livePrice = calcPrice(treatment.basePrice, state.duration, state.coupleSuite);
                const justAdded = lastAddedId === treatment.id;
                return (
                  <article className="service-card enter" key={treatment.id}>
                    <div className="service-media">
                      <SmartImage src={treatment.image} alt={treatment.title} width={800} height={600} loading="lazy" />
                      <span className="service-tag">{treatment.category}</span>
                    </div>
                    <div className="service-body">
                      <h3 className="service-title">{treatment.title}</h3>
                      <p className="service-desc">{treatment.description}</p>
                      <p className="service-includes"><strong>Includes:</strong> {treatment.includes.join(' · ')}</p>

                      <div className="service-price-row">
                        <div className="price">{formatNaira(livePrice)}</div>
                        <div className="price-note">Live total</div>
                      </div>

                      <div className="option-block">
                        <span className="option-label">Duration / Add-On</span>
                        <div className="pill-row" role="group" aria-label={`Options for ${treatment.title}`}>
                          {(['60 Mins', '90 Mins'] as Duration[]).map((d) => (
                            <button
                              key={d}
                              type="button"
                              className={`option-pill ${state.duration === d ? 'active' : ''}`}
                              aria-pressed={state.duration === d}
                              onClick={() => updateCardState(treatment.id, { duration: d })}
                            >
                              {d}
                            </button>
                          ))}
                          <button
                            type="button"
                            className={`option-pill ${state.coupleSuite ? 'active' : ''}`}
                            aria-pressed={state.coupleSuite}
                            onClick={() => updateCardState(treatment.id, { coupleSuite: !state.coupleSuite })}
                          >
                            Couple&apos;s Suite
                          </button>
                        </div>
                      </div>

                      <div className="service-actions">
                        <button
                          type="button"
                          className={`btn btn-primary btn-small ${justAdded ? 'btn-added' : ''}`}
                          onClick={() => addToBooking(treatment)}
                        >
                          {justAdded ? 'Added to Booking' : 'Add to Booking'}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <div className="booking-bar" aria-label="Booking bar">
          <div className="container">
            <div className="booking-bar-inner">
              <div className="booking-summary">
                <p className="booking-title">
                  {booking.length === 0 ? 'Your booking' : `${booking.length} treatment${booking.length > 1 ? 's' : ''} selected`}
                </p>
                <p className="booking-detail">{bookingSummary}</p>
                <div className="booking-total">{formatNaira(total)}</div>
              </div>
              <div className="booking-actions">
                {booking.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => removeBookingItem(booking[booking.length - 1].id)}
                    aria-label="Remove last selected treatment"
                  >
                    Remove Last
                  </button>
                )}
                <a className="btn btn-secondary" href={BUSINESS.phoneTel}>
                  {PHONE_ICON}
                  <span>Call</span>
                </a>
                <a className="btn btn-accent" href={whatsappHref} target="_blank" rel="noopener noreferrer">
                  {WA_ICON}
                  <span>WhatsApp Booking</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <footer className="footer">
          <div className="container footer-grid">
            <div>
              <h3>{BUSINESS.name}</h3>
              <p>{BUSINESS.address}</p>
              <p>{BUSINESS.hoursLabel} · Abuja (WAT)</p>
              <p>Direct line: <a href={BUSINESS.phoneTel}>{BUSINESS.phoneDisplay}</a></p>
            </div>
            <div>
              <p><strong>Reserve your sanctuary session</strong></p>
              <p>Message us on <a href={whatsappHref} target="_blank" rel="noopener noreferrer">WhatsApp</a> for instant booking assistance, or call directly for immediate arrangements.</p>
              <p className="sr-only">Service area: Wuse 2, Abuja, Nigeria.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
