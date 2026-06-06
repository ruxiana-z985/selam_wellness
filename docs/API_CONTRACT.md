# Selam Wellness API Contract

Base path: `/api`

## Public Demo Endpoints

- `GET /health` — API health check.
- `GET /home` — hero, cycle insight, whispers, practitioner card, and content cards.
- `GET /circles` — circle discovery.
- `POST /circles/:id/join` — join a circle.
- `GET /circles/:id/feed` — circle feed with posts.
- `POST /posts` — create text, anonymous, or question-style post with safety scoring.
- `POST /posts/:id/reactions` — supportive reactions only.
- `GET /women/cycle?day=8` — cycle phase insight.
- `GET /wellness/library` — content library.
- `GET /practitioners` — practitioner directory.
- `GET /retreats` — retreat marketplace.
- `GET /retreats/:id` — experience detail.
- `POST /bookings` — booking flow for Telebirr, CBE Birr, or card.
- `POST /journal` — private mood journal entry.
- `POST /safety/check` — pre-post moderation signal.

## Safety Philosophy

Selam avoids downvotes and public shame mechanics. Community posts use supportive reactions and can be anonymous inside a circle. The MVP safety endpoint flags crisis or harm signals so a production system can route posts to moderation and crisis resources before publication.
