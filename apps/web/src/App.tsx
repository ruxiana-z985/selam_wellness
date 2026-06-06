import { Bell, BookMarked, CalendarCheck, Check, CircleUserRound, Crown, FlameKindling, Heart, Hop as Home, Leaf, Loader as Loader2, LogOut, Moon, Mountain, PenLine, Plus, Search, Send, ShieldCheck, Sparkles, Stethoscope, UsersRound, Wifi, WifiOff } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { AuthFlow } from './components/AuthFlow';
import { CrisisModal } from './components/CrisisModal';
import { SelamPlus } from './components/SelamPlus';
import { WhisperCard } from './components/WhisperCard';
import { useAuth } from './context/AuthContext';
import { useSelamApp } from './hooks/useSelamApp';
import { formatPrice } from './lib/api';
import { t } from './lib/i18n';
import type { Circle, CycleInsight, Experience, Language, Practitioner, Ritual, Tab } from './lib/types';

function App() {
  const { loading: authLoading, user } = useAuth();

  if (authLoading) {
    return (
      <main className="loading-screen">
        <span className="brand-mark">ሰ</span>
        <Loader2 className="spin" size={28} />
        <p>Preparing your village...</p>
      </main>
    );
  }

  if (!user) {
    return <AuthFlow onComplete={() => { /* user state updates automatically via onAuthStateChange */ }} />;
  }

  return <AppShell />;
}

function AppShell() {
  const app = useSelamApp();

  return (
    <main>
      <div className="tibeb" />
      <Header app={app} />
      <div className="page-shell">
        {app.tab === 'home' && <HomePage app={app} />}
        {app.tab === 'circles' && <CirclesPage app={app} />}
        {app.tab === 'women' && <WomenPage app={app} />}
        {app.tab === 'wellness' && <WellnessPage app={app} />}
        {app.tab === 'retreats' && <RetreatsPage app={app} />}
        {app.tab === 'practitioners' && <PractitionersPage app={app} />}
        {app.tab === 'profile' && <ProfilePage app={app} />}
      </div>
      <BottomNav tab={app.tab} setTab={app.setTab} lang={app.lang} />
      {app.toast && (
        <button className="toast" onClick={() => app.setToast('')} type="button">
          <Check size={18} /> {app.toast}
        </button>
      )}
      {app.crisisModal && (
        <CrisisModal language={app.lang} onClose={() => app.setCrisisModal(null)} safety={app.crisisModal} />
      )}
      {app.showSelamPlus && <SelamPlus onClose={() => app.setShowSelamPlus(false)} onUpgrade={app.upgradePremium} />}
    </main>
  );
}

type AppState = ReturnType<typeof useSelamApp>;

function Header({ app }: { app: AppState }) {
  const nav: { id: Tab; label: string }[] = [
    { id: 'home', label: t(app.lang, 'home') },
    { id: 'circles', label: t(app.lang, 'circles') },
    { id: 'women', label: t(app.lang, 'women') },
    { id: 'wellness', label: t(app.lang, 'rituals') },
    { id: 'retreats', label: t(app.lang, 'retreats') },
    { id: 'practitioners', label: t(app.lang, 'practitioners') },
  ];

  return (
    <header className="topbar">
      <button className="brand" onClick={() => app.setTab('home')} type="button">
        <span className="brand-mark">ሰ</span>
        <span>{t(app.lang, 'brand')}</span>
      </button>
      <nav className="desktop-nav">
        {nav.map((item) => (
          <button
            className={app.tab === item.id ? 'active' : ''}
            key={item.id}
            onClick={() => app.setTab(item.id)}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="top-actions">
        <span className={`api-status ${app.supabaseOnline ? 'online' : 'offline'}`} title={app.supabaseOnline ? 'Connected' : 'Demo mode'}>
          {app.supabaseOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        </span>
        {app.profile.isPremium && (
          <button className="premium-badge" onClick={() => app.setShowSelamPlus(true)} type="button">
            <Crown size={14} /> Selam+
          </button>
        )}
        {!app.profile.isPremium && (
          <button className="upgrade-btn" onClick={() => app.setShowSelamPlus(true)} type="button">
            {t(app.lang, 'upgrade')}
          </button>
        )}
        <button className="notif-btn" onClick={() => app.setShowNotifications(!app.showNotifications)} type="button">
          <Bell size={19} />
          {app.notifications.length > 0 && <span className="notif-dot" />}
        </button>
        {app.showNotifications && (
          <div className="notif-panel">
            {app.notifications.slice(0, 5).map((n) => (
              <p key={n}>{n}</p>
            ))}
          </div>
        )}
        <button className="avatar" onClick={() => app.setTab('profile')} type="button" title={app.profile.name}>
          {app.profile.avatarInitial}
        </button>
      </div>
    </header>
  );
}

function HomePage({ app }: { app: AppState }) {
  const featured = app.experiences.find((e) => e.featured) ?? app.experiences[0];
  const cycle = app.cycle;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <section className="fade-in village-home">
      <div className="hero-village">
        <div className="hero-copy">
          <p className="eyebrow">{t(app.lang, 'peace')}</p>
          <h1>{t(app.lang, 'heroTitle')}</h1>
          <p className="hero-greeting">{greeting}, {app.profile.name}. Your circle has been waiting.</p>
          <p>{t(app.lang, 'heroText')}</p>
          <div className="hero-actions">
            <button
              className="primary"
              onClick={() => {
                const womens = app.circles.find((c) => c.id === 'womens-haven');
                if (womens) app.joinCircle(womens);
                app.setTab('women');
              }}
              type="button"
            >
              <Heart size={18} /> {t(app.lang, 'enterWomen')}
            </button>
            <button className="ghost" onClick={() => app.setTab('circles')} type="button">
              {t(app.lang, 'exploreCircles')}
            </button>
          </div>
          {featured && (
            <article className="featured-partner">
              <Sparkles size={18} />
              <div>
                <strong>Launch Partner: {featured.partner ?? 'Kuriftu Resort'}</strong>
                <p>
                  {featured.title} — {formatPrice(featured.price)} • Book with Telebirr
                </p>
              </div>
              <button
                className="ghost"
                onClick={() => {
                  app.setBookingDraft({
                    experienceId: featured.id,
                    retreat: featured.title,
                    date: featured.dates[0],
                    guests: 1,
                    payment: 'Telebirr',
                  });
                  app.setTab('retreats');
                }}
                type="button"
              >
                Book
              </button>
            </article>
          )}
        </div>
        <div className="courtyard" aria-label="Selam village map">
          <div className="courtyard-ring ring-one" />
          <div className="courtyard-ring ring-two" />
          <button className="hearth" onClick={() => app.setTab('wellness')} type="button">
            <FlameKindling />
            <span>{t(app.lang, 'dailySelam')}</span>
          </button>
          <button className="path-node node-community" onClick={() => app.setTab('circles')} type="button">
            <UsersRound /> {t(app.lang, 'circles')}
          </button>
          <button className="path-node node-women" onClick={() => app.setTab('women')} type="button">
            <Moon /> {t(app.lang, 'women')}
          </button>
          <button className="path-node node-retreats" onClick={() => app.setTab('retreats')} type="button">
            <Mountain /> {t(app.lang, 'retreats')}
          </button>
          <button className="path-node node-practice" onClick={() => app.setTab('wellness')} type="button">
            <Leaf /> {t(app.lang, 'rituals')}
          </button>
        </div>
      </div>

      <section className="story-ribbon">
        {[
          ['Belong', 'Find a circle that speaks your language and season — Idir-inspired, judgment-free.'],
          ['Listen', cycle ? `Today: ${cycle.phase}. ${cycle.suggestion ?? cycle.prompt}` : 'Cycle wisdom awaits.'],
          ['Heal', 'From Kuriftu retreats to coffee ceremony calm — wellness that feels like coming home.'],
        ].map(([title, text]) => (
          <article key={title}>
            <span>{title}</span>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <div className="two-column">
        {cycle && <CycleCard cycle={cycle} />}
        <section>
          <SectionTitle title="Whispers around the hearth" />
          <div className="stack">
            {app.posts.slice(0, 3).map((post) => (
              <WhisperCard key={post.id} language={app.lang} onReact={app.reactToPost} post={post} />
            ))}
            <article className="village-note">
              <ShieldCheck />
              <div>
                <strong>
                  {app.joinedCircles.length} circle{app.joinedCircles.length !== 1 ? 's' : ''} joined
                  {app.activeCircle ? ` • active: ${app.activeCircle.name}` : ''}
                </strong>
                <p>No downvotes. No public shaming. Supportive reactions only. AI + human moderation.</p>
              </div>
            </article>
          </div>
        </section>
      </div>

      {app.practitioners[0] && (
        <section className="practitioner-spotlight">
          <SectionTitle title="Practitioner of the week" />
          <PractitionerCard practitioner={app.practitioners[0]} onBook={() => app.setTab('practitioners')} />
        </section>
      )}
    </section>
  );
}

function CycleCard({ cycle }: { cycle: CycleInsight }) {
  return (
    <article className="cycle-card">
      <p className="eyebrow">Cycle altar • Day {cycle.day}</p>
      <h2>{cycle.phase}</h2>
      <div className="moon-bowl">
        <span className="moon-drop" />
        <span className="bowl-line line-a" />
        <span className="bowl-line line-b" />
        <strong>{cycle.energy}%</strong>
        <small>energy</small>
      </div>
      <p className="quote">"{cycle.suggestion ?? cycle.prompt}"</p>
      {cycle.bestFor && <p>Best for: {cycle.bestFor.join(', ')}</p>}
    </article>
  );
}

function CirclesPage({ app }: { app: AppState }) {
  const [query, setQuery] = useState('');
  const filtered = app.circles.filter((c) =>
    `${c.name} ${c.category} ${c.description}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <section className="fade-in">
      <PageIntro
        eyebrow="Community Circles"
        title="Find your Mahber for this season."
        text="Idir-inspired peer groups with AI safety, human moderation, and clinical escalation pathways. No downvotes — ever."
      />
      <div className="searchbar">
        <Search size={18} />
        <input
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search: career anxiety, ALX, grief, women's wellness..."
          value={query}
        />
      </div>
      <div className="circle-grid">
        {filtered.map((circle) => (
          <CircleCard
            active={app.activeCircle?.id === circle.id}
            circle={circle}
            joined={!!circle.joined}
            key={circle.id}
            lang={app.lang}
            onJoin={() => app.joinCircle(circle)}
          />
        ))}
      </div>
      {app.activeCircle && (
        <section className="circle-feed">
          <div className="feed-tabs">
            {['Posts', 'Events', 'Resources', 'Members'].map((tab) => (
              <button
                className={app.feedTab === tab ? 'active' : ''}
                key={tab}
                onClick={() => app.setFeedTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          {app.feedTab === 'Posts' && (
            <div className="stack">
              {app.activePosts.length > 0
                ? app.activePosts.map((post) => (
                    <WhisperCard key={post.id} language={app.lang} onReact={app.reactToPost} post={post} />
                  ))
                : <p className="timeline-entry" style={{ textAlign: 'center', padding: '32px 0' }}>Be the first to share in this circle.</p>}
            </div>
          )}
          {app.feedTab === 'Events' && (
            <div className="stack">
              <article className="soft-panel">Sunday courage check-in — Every Sunday, 7 PM</article>
              <article className="soft-panel">Coffee ceremony calm — Next Saturday</article>
            </div>
          )}
          {app.feedTab === 'Resources' && (
            <div className="stack">
              <article className="soft-panel">Circle guidelines — How we hold space without shame</article>
              <article className="soft-panel">Crisis support pathways — Amanuel Hospital referral: 0116-62-52-09</article>
            </div>
          )}
          {app.feedTab === 'Members' && (
            <p className="timeline-entry">{app.activeCircle.members.toLocaleString()} members in this circle</p>
          )}
        </section>
      )}
    </section>
  );
}

function CircleCard({
  circle,
  joined,
  active,
  onJoin,
  lang,
}: {
  circle: Circle;
  joined: boolean;
  active: boolean;
  onJoin: () => void;
  lang: Language;
}) {
  return (
    <article className={`circle-card ${active ? 'selected' : ''}`}>
      <span className="tag">{circle.category}</span>
      <h3>{circle.name}</h3>
      <p>{circle.description}</p>
      <div className="circle-stats">
        <span>{circle.members.toLocaleString()} members</span>
        <span>{circle.activity}</span>
      </div>
      {circle.ritual && <p className="ritual-line">{circle.ritual}</p>}
      <button className={joined ? 'joined' : ''} onClick={onJoin} type="button">
        {joined ? t(lang, 'enterCircle') : t(lang, 'joinCircle')}
      </button>
    </article>
  );
}

function WomenPage({ app }: { app: AppState }) {
  const womenPosts = app.posts.filter((p) => p.circleId === 'womens-haven' || p.circle === "Women's Haven");
  const phases = [
    { key: 3, label: 'Inner Winter' },
    { key: 8, label: 'Inner Spring' },
    { key: 16, label: 'Inner Summer' },
    { key: 24, label: 'Inner Autumn' },
  ];

  return (
    <section className="fade-in">
      <PageIntro
        eyebrow="Flagship Feature"
        title="Women's Haven"
        text="Cycle wisdom, hormonal wellness, certified practitioners, and protected peer support — Ethiopia's first culturally grounded FemTech space."
      />
      <div className="two-column">
        {app.cycle && <CycleCard cycle={app.cycle} />}
        <article className="soft-panel cycle-dashboard">
          <h3>Choose today's inner season</h3>
          <p>Your cycle is not a problem to solve. It is a rhythm to know.</p>
          <div className="phase-buttons">
            {phases.map((p) => (
              <button
                className={app.cycleDay === p.key ? 'active-phase' : ''}
                key={p.key}
                onClick={() => app.updateCycleDay(p.key)}
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="care-grid">
            <span>Practice: gentle flow</span>
            <span>Food: warm iron-rich bowl</span>
            <span>Support: ask, don't perform</span>
          </div>
        </article>
      </div>
      <div className="two-column lower-grid">
        <PostComposer
          anonymous={app.anonymous}
          composer={app.composer}
          lang={app.lang}
          onSubmit={(e) => app.submitPost(e, 'womens-haven')}
          posting={app.posting}
          setAnonymous={app.setAnonymous}
          setComposer={app.setComposer}
        />
        <section>
          <SectionTitle title="Women's whispers" />
          <div className="stack">
            {womenPosts.length > 0
              ? womenPosts.map((post) => (
                  <WhisperCard key={post.id} language={app.lang} onReact={app.reactToPost} post={post} />
                ))
              : <p className="timeline-entry" style={{ textAlign: 'center', padding: '32px 0' }}>Be the first voice in this safe space.</p>}
          </div>
        </section>
      </div>
    </section>
  );
}

function PostComposer({
  composer,
  setComposer,
  anonymous,
  setAnonymous,
  onSubmit,
  posting,
  lang,
}: {
  composer: string;
  setComposer: (v: string) => void;
  anonymous: boolean;
  setAnonymous: (v: boolean) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  posting: boolean;
  lang: Language;
}) {
  return (
    <form className="create-post" onSubmit={onSubmit}>
      <div className="form-heading">
        <PenLine />
        <h3>Create a protected whisper</h3>
      </div>
      <textarea
        onChange={(e) => setComposer(e.target.value)}
        placeholder="What do you need your circle to witness today?"
        value={composer}
      />
      <div className="form-footer">
        <label>
          <input checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} type="checkbox" />
          {t(lang, 'anonymous')}
        </label>
        <span>
          <ShieldCheck size={14} /> {t(lang, 'safetyEnabled')}
        </span>
        <button disabled={posting} type="submit">
          {posting ? <Loader2 className="spin" size={16} /> : <Send size={16} />}
          {t(lang, 'post')}
        </button>
      </div>
    </form>
  );
}

function WellnessPage({ app }: { app: AppState }) {
  const ritual = app.selectedRitual ?? app.rituals[0];

  return (
    <section className="fade-in">
      <PageIntro
        eyebrow="Daily Selam"
        title="A ritual library, not content sludge."
        text="Coffee ceremony calm, teff nutrition, career resets — culturally familiar therapeutic objects that belong to you."
      />
      <div className="ritual-layout">
        <div className="ritual-list">
          {app.rituals.map((r) => (
            <button
              className={`ritual-card ${ritual?.id === r.id ? 'selected' : ''}`}
              key={r.id}
              onClick={() => app.setSelectedRitual(r)}
              type="button"
            >
              <span>
                {r.category} {r.premium && <Crown size={12} className="inline-crown" />}
              </span>
              <strong>{r.title}</strong>
              <small>{r.duration}</small>
            </button>
          ))}
        </div>
        {ritual && (
          <article className="ritual-reader">
            <BookMarked />
            <span>
              {ritual.category} • {ritual.duration}
            </span>
            <h2>{ritual.title}</h2>
            <p>{ritual.text ?? ritual.description}</p>
            <div className="ceremony-steps">
              <span>Arrive</span>
              <span>Breathe</span>
              <span>Reflect</span>
              <span>Return</span>
            </div>
            <button className="primary" onClick={() => app.saveRitual(ritual.id)} type="button">
              {app.saved.includes(ritual.id) ? t(app.lang, 'saved') : t(app.lang, 'saveRitual')}
            </button>
          </article>
        )}
      </div>
      <div className="two-column lower-grid">
        <form className="journal-card" onSubmit={app.saveMood}>
          <h3>Mood journal</h3>
          <label>
            Feeling
            <input onChange={(e) => app.setMood({ ...app.mood, feeling: e.target.value })} value={app.mood.feeling} />
          </label>
          <label>
            Energy
            <input
              max="10"
              min="1"
              onChange={(e) => app.setMood({ ...app.mood, energy: e.target.value })}
              type="range"
              value={app.mood.energy}
            />
          </label>
          <textarea
            onChange={(e) => app.setMood({ ...app.mood, note: e.target.value })}
            placeholder="What gave you peace today?"
            value={app.mood.note}
          />
          <button type="submit">
            <Plus size={16} /> Save privately
          </button>
        </form>
        <article className="soft-panel">
          <h3>Private timeline</h3>
          {app.journal.length > 0
            ? app.journal.map((entry) => (
                <p className="timeline-entry" key={entry.id}>{entry.text}</p>
              ))
            : <p className="timeline-entry">Your private wellness map starts here.</p>}
        </article>
      </div>
    </section>
  );
}

function RetreatsPage({ app }: { app: AppState }) {
  const draft = app.bookingDraft;
  const selected = app.experiences.find((e) => e.id === draft?.experienceId) ?? app.experiences[0];

  return (
    <section className="fade-in">
      <PageIntro
        eyebrow="Retreats & Experiences"
        title="Healing beyond the screen."
        text="Digital circles become real revenue: 10–15% commission on Kuriftu, spa, yoga, and retreat bookings via Telebirr."
      />
      <div className="retreat-grid">
        {app.experiences.map((retreat) => (
          <button
            className={`retreat-card ${retreat.tone ?? 'forest'} ${draft?.experienceId === retreat.id ? 'selected' : ''} ${retreat.featured ? 'featured-retreat' : ''}`}
            key={retreat.id}
            onClick={() =>
              app.setBookingDraft({
                experienceId: retreat.id,
                retreat: retreat.title,
                date: retreat.dates[0],
                guests: draft?.guests ?? 1,
                payment: draft?.payment ?? 'Telebirr',
              })
            }
            type="button"
          >
            {retreat.featured && <span className="partner-badge">Launch Partner</span>}
            <span>{retreat.category}</span>
            <h3>{retreat.title}</h3>
            <p>{retreat.description}</p>
            <strong>
              {retreat.location} • {formatPrice(retreat.price)}
            </strong>
          </button>
        ))}
      </div>
      {selected && draft && (
        <form className="booking-form" onSubmit={app.reserveRetreat}>
          <h3>Book {selected.title}</h3>
          <label>
            Date
            <select onChange={(e) => app.setBookingDraft({ ...draft, date: e.target.value })} value={draft.date}>
              {selected.dates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </label>
          <label>
            Guests
            <input
              min="1"
              onChange={(e) => app.setBookingDraft({ ...draft, guests: Number(e.target.value) })}
              type="number"
              value={draft.guests}
            />
          </label>
          <label>
            Payment
            <select
              onChange={(e) => app.setBookingDraft({ ...draft, payment: e.target.value })}
              value={draft.payment}
            >
              <option>Telebirr</option>
              <option>CBE Birr</option>
              <option>Card</option>
            </select>
          </label>
          <div className="booking-total">
            <strong>{formatPrice(selected.price * draft.guests)}</strong>
            <small>12% marketplace commission to Selam</small>
          </div>
          <button disabled={app.paymentProcessing} type="submit">
            {app.paymentProcessing ? <Loader2 className="spin" size={16} /> : <CalendarCheck size={16} />}
            {t(app.lang, 'reserve')}
          </button>
        </form>
      )}
      {app.bookings[0] && (
        <article className="confirmation-card">
          <Sparkles />
          <div>
            <h3>
              {t(app.lang, 'bookingConfirmed')}: {app.bookings[0].retreat ?? selected?.title}
            </h3>
            <p>
              {app.bookings[0].date} • {app.bookings[0].guests} guest(s) • {app.bookings[0].payment}
              {app.bookings[0].paymentRef && ` • Ref: ${app.bookings[0].paymentRef}`}
            </p>
          </div>
        </article>
      )}
    </section>
  );
}

function PractitionersPage({ app }: { app: AppState }) {
  return (
    <section className="fade-in">
      <PageIntro
        eyebrow="Certified Practitioners"
        title="Human care, culturally grounded."
        text="Partnerships with Amanuel Hospital pathway. Book cycle educators, coaches, and wellness practitioners — in Amharic and English."
      />
      <div className="practitioner-grid">
        {app.practitioners.map((p) => (
          <PractitionerCard
            key={p.id}
            onBook={() => app.showToast(`Session request sent to ${p.name}. They will confirm within 2 hours.`)}
            practitioner={p}
          />
        ))}
      </div>
    </section>
  );
}

function PractitionerCard({ practitioner, onBook }: { practitioner: Practitioner; onBook: () => void }) {
  return (
    <article className="practitioner-card">
      <div className="practitioner-avatar">
        {practitioner.avatarUrl ? (
          <img alt={practitioner.name} src={practitioner.avatarUrl} />
        ) : (
          <Stethoscope size={32} />
        )}
      </div>
      <div>
        <h3>{practitioner.name}</h3>
        <p className="practitioner-title">{practitioner.title}</p>
        <p>{practitioner.specialization}</p>
        <div className="practitioner-meta">
          <span>★ {practitioner.rating}</span>
          <span>{practitioner.languages.join(', ')}</span>
          <span>{formatPrice(practitioner.price)}/session</span>
          <span>{practitioner.availability}</span>
        </div>
        <button className="primary" onClick={onBook} type="button">
          Request session
        </button>
      </div>
    </article>
  );
}

function ProfilePage({ app }: { app: AppState }) {
  return (
    <section className="fade-in">
      <PageIntro
        eyebrow="Wellness Identity"
        title={`${app.profile.name}'s private Selam map.`}
        text="A healing record, not a social scoreboard. Your data is yours — never sold individually, never shared with governments."
      />
      <div className="profile-grid">
        <article className="profile-card">
          <div className="avatar xl">{app.profile.avatarInitial}</div>
          <h3>{app.profile.name}</h3>
          <p>{app.profile.email}</p>
          {app.profile.isPremium && (
            <span className="premium-badge large">
              <Crown size={16} /> Selam+ Member
            </span>
          )}
          <div className="profile-stats">
            <span><b>{app.joinedCircles.length}</b> circles</span>
            <span><b>{app.saved.length}</b> saved</span>
            <span><b>{app.bookings.length}</b> bookings</span>
            <span><b>{app.journal.length}</b> entries</span>
          </div>
          <div className="lang-toggle profile-lang">
            <button
              className={app.lang === 'en' ? 'active' : ''}
              onClick={() => app.persistProfile({ language: 'en' })}
              type="button"
            >
              English
            </button>
            <button
              className={app.lang === 'am' ? 'active' : ''}
              onClick={() => app.persistProfile({ language: 'am' })}
              type="button"
            >
              አማርኛ
            </button>
          </div>
          <button
            className="ghost"
            onClick={() => app.signOut()}
            style={{ marginTop: 16, width: '100%' }}
            type="button"
          >
            <LogOut size={16} /> Sign out
          </button>
        </article>
        <article className="soft-panel">
          <h3>Recent path</h3>
          {[
            ...app.joinedCircles.map((c) => `Joined ${c.name}`),
            ...app.saved.map((id) => `Saved ${id}`),
            ...app.bookings.map((b) => `Booked ${b.retreat}`),
            ...app.journal.map((j) => j.text.slice(0, 60) + '...'),
          ].slice(0, 8).map((item, i) => (
            <p className="timeline-entry" key={i}>{item}</p>
          ))}
          {app.joinedCircles.length === 0 && app.saved.length === 0 && app.bookings.length === 0 && (
            <p className="timeline-entry">Your wellness journey starts here.</p>
          )}
        </article>
      </div>

      {app.revenue && (
        <section className="investor-panel">
          <SectionTitle title="Revenue model — investor view" />
          <p className="ethics-banner">
            <ShieldCheck size={16} /> {app.revenue.ethicsNote}
          </p>
          <div className="revenue-grid">
            {app.revenue.streams.map((stream) => (
              <article className="revenue-card" key={stream.name}>
                <h3>{stream.name}</h3>
                <span>{stream.model}</span>
                <strong>{stream.price}</strong>
                <p>{stream.yearOneTarget}</p>
              </article>
            ))}
          </div>
          <p className="partner-line">
            Launch partner: <strong>{app.revenue.launchPartner}</strong> — venue advantage for Day 2 finals
          </p>
        </section>
      )}

      {app.profile.dataConsent && (
        <article className="soft-panel data-dashboard">
          <h3>Your data dashboard (90 days)</h3>
          <p>Aggregated contributions: mood trends (anonymized), circle activity patterns.</p>
          <p>No individual data sold. Government excluded from buyers. k-anonymity ≥ 150 users.</p>
        </article>
      )}
    </section>
  );
}

function BottomNav({ tab, setTab, lang }: { tab: Tab; setTab: (t: Tab) => void; lang: Language }) {
  const items: { id: Tab; label: string; icon: JSX.Element }[] = [
    { id: 'home', label: t(lang, 'home'), icon: <Home /> },
    { id: 'circles', label: t(lang, 'circles'), icon: <UsersRound /> },
    { id: 'women', label: t(lang, 'women'), icon: <Moon /> },
    { id: 'wellness', label: t(lang, 'rituals'), icon: <Leaf /> },
    { id: 'retreats', label: t(lang, 'retreats'), icon: <Mountain /> },
    { id: 'profile', label: t(lang, 'profile'), icon: <CircleUserRound /> },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button className={tab === item.id ? 'active' : ''} key={item.id} onClick={() => setTab(item.id)} type="button">
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="page-intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="section-title">{title}</h2>;
}

export default App;
