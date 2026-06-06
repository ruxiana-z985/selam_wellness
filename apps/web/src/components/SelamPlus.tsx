import { Crown, Sparkles, X } from 'lucide-react';

type Props = {
  onUpgrade: () => void;
  onClose: () => void;
};

const perks = [
  'Unlimited community circles & Women\'s Haven premium',
  'Full ritual library — Inner Spring, Ritual of Rest, and more',
  'Unlimited Kuriftu & retreat bookings',
  'AI wellness check-ins in Amharic & English',
  'Private journaling insights',
];

export function SelamPlus({ onUpgrade, onClose }: Props) {
  return (
    <div className="modal-overlay">
      <div className="selam-plus-modal fade-in">
        <button className="modal-close" onClick={onClose} type="button">
          <X size={20} />
        </button>
        <Crown size={32} />
        <p className="eyebrow">Selam+ Premium</p>
        <h2>ETB 175/month</h2>
        <p>Validated by 5 of 8 user interviews. Less than one coffee ceremony per week.</p>
        <ul className="perk-list">
          {perks.map((perk) => (
            <li key={perk}>
              <Sparkles size={16} /> {perk}
            </li>
          ))}
        </ul>
        <button className="primary wide" onClick={onUpgrade} type="button">
          Activate Selam+ (demo)
        </button>
        <p className="fine-print">Cancel anytime. Data ethics dashboard included.</p>
      </div>
    </div>
  );
}
