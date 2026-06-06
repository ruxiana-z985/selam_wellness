import { ChevronRight, Globe, Heart, Shield } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { t } from '../lib/i18n';
import type { Language } from '../lib/types';

type Props = {
  onComplete: (data: { name: string; language: Language; dataConsent: boolean }) => void;
};

export function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState<Language>('en');
  const [name, setName] = useState('Hana Bekele');
  const [dataConsent, setDataConsent] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onComplete({ name, language, dataConsent });
  }

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card fade-in">
        {step === 0 && (
          <>
            <span className="onboarding-mark">ሰ</span>
            <p className="eyebrow">{t(language, 'peace')}</p>
            <h1>{t(language, 'onboardingWelcome')}</h1>
            <p>{t(language, 'onboardingSubtitle')}</p>
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
            <button className="primary wide" onClick={() => setStep(1)} type="button">
              {t(language, 'getStarted')} <ChevronRight size={18} />
            </button>
          </>
        )}

        {step === 1 && (
          <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
            <p className="eyebrow">Step 2 of 3</p>
            <h2>Your Selam identity</h2>
            <p>A name your circles can witness — or stay anonymous in posts anytime.</p>
            <label className="onboarding-field">
              Display name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="onboarding-check">
              <input checked={dataConsent} onChange={(e) => setDataConsent(e.target.checked)} type="checkbox" />
              {t(language, 'dataConsent')}
            </label>
            <button className="primary wide" type="submit">
              {t(language, 'continue')} <ChevronRight size={18} />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <p className="eyebrow">Step 3 of 3</p>
            <h2>Join your first circle</h2>
            <p>We recommend Career Anxiety Circle — where 4,200+ young Ethiopians rebuild courage together.</p>
            <div className="onboarding-circle-preview">
              <strong>Career Anxiety Circle</strong>
              <span>Young Professionals • Very active</span>
              <p>For interviews, burnout, pivots, and being brave without becoming hard.</p>
            </div>
            <button className="primary wide" type="submit">
              {t(language, 'getStarted')} <ChevronRight size={18} />
            </button>
          </form>
        )}

        <div className="onboarding-dots">
          {[0, 1, 2].map((i) => (
            <span className={step === i ? 'active' : ''} key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
