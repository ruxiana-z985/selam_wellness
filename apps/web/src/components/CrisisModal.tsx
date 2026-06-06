import { Phone, ShieldCheck, X } from 'lucide-react';
import type { SafetyResult } from '../lib/types';

type Props = {
  safety: SafetyResult;
  language: 'en' | 'am';
  onClose: () => void;
};

export function CrisisModal({ safety, language, onClose }: Props) {
  const resources = safety.resources;
  const message = language === 'am' && resources?.amharicMessage ? resources.amharicMessage : resources?.message;

  return (
    <div className="modal-overlay">
      <div className="crisis-modal fade-in">
        <button className="modal-close" onClick={onClose} type="button">
          <X size={20} />
        </button>
        <ShieldCheck size={36} />
        <h2>{language === 'am' ? 'ብቻ አይደሉም' : 'You are not alone'}</h2>
        <p>{message ?? safety.moderation}</p>
        <div className="crisis-actions">
          <a className="primary" href={`tel:${resources?.hotline ?? '0116625209'}`}>
            <Phone size={18} />
            {resources?.hotline ?? '0116-62-52-09'}
          </a>
          <p className="crisis-note">
            {resources?.hospital ?? 'Amanuel Mental Specialized Hospital'} — same-day referral available.
          </p>
          <p className="crisis-note">A Selam moderator will reach out within 30 minutes during operating hours.</p>
        </div>
        <button className="ghost wide" onClick={onClose} type="button">
          I understand — keep me safe
        </button>
      </div>
    </div>
  );
}
