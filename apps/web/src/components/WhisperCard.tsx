import { ChevronRight, Heart, MessageCircle, Sparkles, ThumbsUp } from 'lucide-react';
import { t } from '../lib/i18n';
import type { CommunityPost, Language, ReactionType } from '../lib/types';

const reactionLabels: Record<ReactionType, string> = {
  RELATE: 'I relate',
  ENCOURAGED: 'Encouraged',
  THANK_YOU: 'Thank you',
  INSPIRED: 'Inspired',
};

type Props = {
  post: CommunityPost;
  language: Language;
  onReact: (id: string, type: ReactionType) => void;
};

export function WhisperCard({ post, language, onReact }: Props) {
  const displayName = post.name ?? post.author;
  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <article className={`whisper-card ${post.anonymous ? 'anonymous-card' : ''} ${post.pending ? 'pending-card' : ''}`}>
      <div className="mini-avatar">{post.anonymous ? 'A' : displayName.slice(0, 1)}</div>
      <div>
        <div className="card-meta">
          <strong>{displayName}</strong>
          <span>
            {post.circle} • {post.time}
            {post.pending && ' • Under review'}
          </span>
        </div>
        <p>{post.content}</p>
        <div className="reaction-row">
          <div className="reaction-buttons">
            {(Object.keys(reactionLabels) as ReactionType[]).map((type) => (
              <button key={type} onClick={() => onReact(post.id, type)} type="button">
                {type === 'RELATE' && <Heart size={14} />}
                {type === 'ENCOURAGED' && <ThumbsUp size={14} />}
                {type === 'THANK_YOU' && <Sparkles size={14} />}
                {type === 'INSPIRED' && <Sparkles size={14} />}
                {reactionLabels[type]}
                {(post.reactions[type] ?? 0) > 0 && ` • ${post.reactions[type]}`}
              </button>
            ))}
          </div>
          <span>
            <MessageCircle size={16} /> {post.comments}
          </span>
          <button type="button">
            {t(language, 'holdSpace')} <ChevronRight size={16} />
          </button>
        </div>
        {totalReactions > 0 && <span className="reaction-total">{totalReactions} supportive reactions</span>}
      </div>
    </article>
  );
}
