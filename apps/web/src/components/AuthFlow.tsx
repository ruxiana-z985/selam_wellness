import { ChevronRight, Globe, Heart, Loader as Loader2, Shield } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { joinCircle } from '../lib/supabase';
import { fallbackCircles } from '../lib/demo-data';
import { t } from '../lib/i18n';
import type { Language } from '../lib/types';

type Props = {
  onComplete: () => void;
};

type Step = 'welcome' | 'auth' | 'profile' | 'circles';

// Circles shown during onboarding — all 7 spec circles
const ONBOARDING_CIRCLES = fallbackCircles.map((c) => ({
  id: c.id,
  name: c.name,
  nameAmharic: c.nameAmharic ?? c.name,
  description: c.description,
  members: c.members,
  isWomenOnly: c.isWomenOnly ?? false,
}));

export function AuthFlow({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [language, setLanguage] = useState<Language>('en');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dataConsent, setDataConsent] = useState(false);
  const [selectedCircleIds, setSelectedCircleIds] = useState<string[]>(['career-anxiety']);
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signUp, signIn, user, updateProfile } = useAuth();

  function toggleCircle(id: string) {
    setSelectedCircleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setSubmitting(true);
    setAuthError('');

    const fn = mode === 'signup' ? signUp : signIn;
    const { error } = await fn(email.trim(), password.trim());

    if (error) {
      setAuthError(error);
      setSubmitting(false);
      return;
    }

    if (mode === 'signup') {
      setStep('profile');
    } else {
      onComplete();
    }
    setSubmitting(false);
  }

  async function handleProfile(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);

    await updateProfile({
      name: name.trim(),
      avatar_initial: name.trim().charAt(0).toUpperCase(),
      language,
      data_consent: dataConsent,
      is_premium: false,
    });

    setStep('circles');
    setSubmitting(false);
  }

  async function handleCirclesJoin() {
    if (!user) {
      onComplete();
      return;
    }
    setSubmitting(true);
    const circleIds = selectedCircleIds.length > 0 ? selectedCircleIds : ['career-anxiety'];
    await Promise.allSettled(circleIds.map((id) => joinCircle(user.id, id)));
    setSubmitting(false);
    onComplete();
  }

  return (
    <div className="onboarding-overlay">
      <div className={`onboarding-card fade-in ${step === 'circles' ? 'onboarding-card--wide' : ''}`}>
        {step === 'welcome' && (
          <>
            <span className="onboarding-mark">ሰ</span>
            <p className="eyebrow">{t(language, 'peace')}</p>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.1 }}>
              {t(language, 'onboardingWelcome')}
            </h1>
            <p style={{ color: '#4e382d', margin: '12px 0 0', fontSize: '1.05rem' }}>
              {language === 'am'
                ? 'ሰላም — ሰላምን፣ ጤናን፣ ሰላምታን አንድ ቃል ያቀፈ።'
                : 'Peace. Health. Greeting. — all in one word, all in one village.'}
            </p>
            <p style={{ color: '#786154', margin: '8px 0 20px', fontSize: '0.93rem' }}>
              {language === 'am'
                ? 'ለኢትዮጵያ ወጣቶች። ለኢዲር መንፈስ። ለወደፊት ትውልድ።'
                : 'For Ethiopian youth. Built on the Idir spirit. Designed for belonging.'}
            </p>
            <div className="onboarding-pillars">
              <span><Heart size={16} /> {language === 'am' ? 'ማህበረሰብ' : 'Community'}</span>
              <span><Shield size={16} /> {language === 'am' ? 'ደህንነት' : 'Safety'}</span>
              <span><Globe size={16} /> {language === 'am' ? 'ባህል' : 'Culture'}</span>
            </div>
            <div className="lang-toggle">
              <button className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')} type="button">
                English
              </button>
              <button className={language === 'am' ? 'active' : ''} onClick={() => setLanguage('am')} type="button">
                አማርኛ
              </button>
            </div>
            <button className="primary wide" onClick={() => setStep('auth')} type="button">
              {t(language, 'getStarted')} <ChevronRight size={18} />
            </button>
            <p className="fine-print" style={{ marginTop: 14 }}>
              {language === 'am'
                ? 'ምንም ምርመራ የለም። ምንም ፍርድ የለም። ይህ ደህንነቱ የተጠበቀ ቦታ ነው።'
                : 'No diagnosis. No judgment. This is a safe space — not a clinical tool.'}
            </p>
          </>
        )}

        {step === 'auth' && (
          <>
            <div className="auth-header">
              <span className="onboarding-mark" style={{ height: 48, width: 48, fontSize: '1.4rem' }}>ሰ</span>
            </div>
            <div className="auth-toggle">
              <button
                className={mode === 'signup' ? 'active' : ''}
                onClick={() => { setMode('signup'); setAuthError(''); }}
                type="button"
              >
                {language === 'am' ? 'አዲስ ተጠቃሚ' : 'Create account'}
              </button>
              <button
                className={mode === 'signin' ? 'active' : ''}
                onClick={() => { setMode('signin'); setAuthError(''); }}
                type="button"
              >
                {language === 'am' ? 'ግባ' : 'Sign in'}
              </button>
            </div>
            <form onSubmit={handleAuth} style={{ width: '100%' }}>
              <div style={{ display: 'grid', gap: 14, margin: '20px 0' }}>
                <label className="onboarding-field">
                  {language === 'am' ? 'ኢሜይል' : 'Email'}
                  <input
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    type="email"
                    value={email}
                  />
                </label>
                <label className="onboarding-field">
                  {language === 'am' ? 'የሚስጥር ቃል' : 'Password'}
                  <input
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    minLength={6}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === 'signup' ? (language === 'am' ? 'ቢያንስ 6 ቁምፊዎች' : 'At least 6 characters') : ''}
                    required
                    type="password"
                    value={password}
                  />
                </label>
              </div>
              {authError && <p className="auth-error">{authError}</p>}
              <button className="primary wide" disabled={submitting} type="submit">
                {submitting
                  ? <><Loader2 className="spin" size={16} /> {language === 'am' ? 'እየተጠበቀ ነው...' : 'Please wait...'}</>
                  : mode === 'signup'
                    ? (language === 'am' ? 'ቀጥሉ →' : 'Continue →')
                    : (language === 'am' ? 'ግባ' : 'Sign in')}
              </button>
            </form>
            <p className="fine-print" style={{ marginTop: 16 }}>
              {language === 'am'
                ? 'ምስጥርዎ ሙሉ በሙሉ ደህና ነው። ምንም መረጃ አይሸጥም።'
                : 'Your data is safe. We never sell personal information.'}
            </p>
          </>
        )}

        {step === 'profile' && (
          <form onSubmit={handleProfile} style={{ width: '100%' }}>
            <p className="eyebrow">{language === 'am' ? 'ማንነትዎ' : 'Your Selam identity'}</p>
            <h2 style={{ marginBottom: 8 }}>
              {language === 'am' ? 'ስምዎን ያስገቡ' : 'What should your circle call you?'}
            </h2>
            <p style={{ color: '#786154', fontSize: '0.95rem', marginBottom: 20 }}>
              {language === 'am'
                ? 'ልጦጣዎ ስም የለሽ መሆን ይቻላል — ሆኖም ለክበቦቹ ስምዎ ጠቃሚ ነው።'
                : 'You can always post anonymously. This name is just for your profile.'}
            </p>
            <label className="onboarding-field">
              {language === 'am' ? 'ስም' : 'Display name'}
              <input
                autoFocus
                onChange={(e) => setName(e.target.value)}
                placeholder={language === 'am' ? 'ለምሳሌ: ሐና' : 'e.g. Hana Bekele'}
                required
                value={name}
              />
            </label>
            <label className="onboarding-check" style={{ marginTop: 16 }}>
              <input
                checked={dataConsent}
                onChange={(e) => setDataConsent(e.target.checked)}
                type="checkbox"
              />
              <span style={{ fontSize: '0.88rem', color: '#786154' }}>
                {language === 'am'
                  ? 'ለስም የለው የዌልነስ አዝማሚያ እፈቅዳለሁ (አማራጭ፣ መሻር ይቻላል)'
                  : 'I consent to anonymized wellness trend data (optional, always revocable)'}
              </span>
            </label>
            <p style={{ fontSize: '0.8rem', color: '#a0896e', marginTop: 8 }}>
              {language === 'am'
                ? 'የመረጃ ስብስብ ≥ 150 ተጠቃሚዎችን ይጠይቃል። መንግሥት ሸጠ።'
                : 'Aggregate data requires ≥ 150 users. No government access. Ever.'}
            </p>
            <button className="primary wide" disabled={submitting} style={{ marginTop: 22 }} type="submit">
              {submitting
                ? <Loader2 className="spin" size={16} />
                : <>{t(language, 'continue')} <ChevronRight size={18} /></>}
            </button>
          </form>
        )}

        {step === 'circles' && (
          <>
            <p className="eyebrow">{language === 'am' ? 'ደርሰዋል' : 'Choose your circles'}</p>
            <h2 style={{ marginBottom: 6 }}>
              {language === 'am' ? 'ክበቦቹ ይጠብቃዎታል' : 'Your circles are waiting'}
            </h2>
            <p style={{ color: '#786154', fontSize: '0.9rem', marginBottom: 20 }}>
              {language === 'am'
                ? '1-3 ክበቦችን ይምረጡ። ማናቸውም ጊዜ ሌሎችን ማከል ይቻላል።'
                : 'Pick 1–3 circles to join. You can always add more later.'}
            </p>
            <div className="circle-picker">
              {ONBOARDING_CIRCLES.map((circle) => (
                <button
                  className={`circle-pick-item ${selectedCircleIds.includes(circle.id) ? 'selected' : ''}`}
                  key={circle.id}
                  onClick={() => toggleCircle(circle.id)}
                  type="button"
                >
                  <div className="circle-pick-check">
                    {selectedCircleIds.includes(circle.id) && <span>✓</span>}
                  </div>
                  <div className="circle-pick-info">
                    <strong>{language === 'am' ? circle.nameAmharic : circle.name}</strong>
                    {circle.isWomenOnly && (
                      <span className="women-only-badge">{language === 'am' ? 'ለሴቶች ብቻ' : 'Women only'}</span>
                    )}
                    <span className="circle-pick-members">{circle.members.toLocaleString()} {language === 'am' ? 'አባላት' : 'members'}</span>
                  </div>
                </button>
              ))}
            </div>
            <button
              className="primary wide"
              disabled={submitting || selectedCircleIds.length === 0}
              onClick={handleCirclesJoin}
              style={{ marginTop: 20 }}
              type="button"
            >
              {submitting
                ? <Loader2 className="spin" size={16} />
                : <>{language === 'am' ? 'ወደ ሰላም ይግቡ' : 'Enter your village'} <ChevronRight size={18} /></>}
            </button>
            <p className="fine-print" style={{ marginTop: 12 }}>
              {selectedCircleIds.length} {language === 'am' ? 'ክበቦች ተመርጠዋል' : 'circles selected'}
            </p>
          </>
        )}

        <div className="onboarding-dots">
          {(['welcome', 'auth', 'profile', 'circles'] as Step[]).map((s) => (
            <span className={step === s ? 'active' : ''} key={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
