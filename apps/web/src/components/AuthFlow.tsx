import { ChevronRight, Globe, Heart, Loader as Loader2, Shield } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { joinCircle } from '../lib/supabase';
import { t } from '../lib/i18n';
import type { Language } from '../lib/types';

type Props = {
  onComplete: () => void;
};

type Step = 'welcome' | 'auth' | 'profile' | 'circle';

export function AuthFlow({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const [language, setLanguage] = useState<Language>('en');
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [dataConsent, setDataConsent] = useState(false);
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signUp, signIn, user, updateProfile } = useAuth();

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

    setStep('circle');
    setSubmitting(false);
  }

  async function handleCircleJoin() {
    if (!user) {
      onComplete();
      return;
    }
    setSubmitting(true);
    try {
      await joinCircle(user.id, 'career-anxiety');
    } catch {
      // ignore
    }
    setSubmitting(false);
    onComplete();
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card fade-in">
        {step === 'welcome' && (
          <>
            <span className="onboarding-mark">ሰ</span>
            <p className="eyebrow">{t(language, 'peace')}</p>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', lineHeight: 1.1 }}>
              {t(language, 'onboardingWelcome')}
            </h1>
            <p style={{ color: '#4e382d', margin: '12px 0 0' }}>
              {t(language, 'onboardingSubtitle')}
            </p>
            <div className="onboarding-pillars">
              <span><Heart size={16} /> Community</span>
              <span><Shield size={16} /> Safety</span>
              <span><Globe size={16} /> Culture</span>
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
                    placeholder={mode === 'signup' ? 'At least 6 characters' : ''}
                    required
                    type="password"
                    value={password}
                  />
                </label>
              </div>
              {authError && <p className="auth-error">{authError}</p>}
              <button className="primary wide" disabled={submitting} type="submit">
                {submitting
                  ? <><Loader2 className="spin" size={16} /> {language === 'am' ? 'እየገባ ነው...' : 'Please wait...'}</>
                  : mode === 'signup'
                    ? (language === 'am' ? 'ይቀጥሉ' : 'Continue') + ' →'
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
                : 'You can always post anonymously in circles. This name is just for your profile.'}
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
                {t(language, 'dataConsent')}
              </span>
            </label>
            <button className="primary wide" disabled={submitting} style={{ marginTop: 22 }} type="submit">
              {submitting
                ? <Loader2 className="spin" size={16} />
                : <>{t(language, 'continue')} <ChevronRight size={18} /></>}
            </button>
          </form>
        )}

        {step === 'circle' && (
          <>
            <p className="eyebrow">{language === 'am' ? 'ደርሰዋል' : 'Your first circle'}</p>
            <h2 style={{ marginBottom: 12 }}>
              {language === 'am' ? 'ክበቡ ይጠብቃዎታል' : 'Your circle is waiting'}
            </h2>
            <p style={{ color: '#4e382d', fontSize: '0.95rem' }}>
              {language === 'am'
                ? 'ወደ Career Anxiety Circle እንቀላቀላለን — 4,200+ ሰዎች ድፍረት ያለ ጥንካሬ ይዘዋል።'
                : 'We\'re joining you to the Career Anxiety Circle — 4,200+ young Ethiopians rebuilding courage together.'}
            </p>
            <div className="onboarding-circle-preview">
              <strong>Career Anxiety Circle</strong>
              <span style={{ display: 'block', fontSize: '0.82rem', color: '#786154', margin: '4px 0 8px' }}>
                Young Professionals • Very active
              </span>
              <p style={{ fontSize: '0.9rem', margin: 0 }}>
                For interviews, burnout, pivots, and being brave without becoming hard. No downvotes. Only support.
              </p>
            </div>
            <button className="primary wide" disabled={submitting} onClick={handleCircleJoin} type="button">
              {submitting
                ? <Loader2 className="spin" size={16} />
                : <>{language === 'am' ? 'ክበቡ ይቀላቀሉ' : 'Enter your village'} <ChevronRight size={18} /></>}
            </button>
          </>
        )}

        <div className="onboarding-dots">
          {(['welcome', 'auth', 'profile', 'circle'] as Step[]).map((s) => (
            <span className={step === s ? 'active' : ''} key={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
