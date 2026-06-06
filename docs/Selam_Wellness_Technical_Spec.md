# SELAM WELLNESS — MASTER TECHNICAL SPECIFICATION
## Version 1.0 | For AI-Assisted Development
> **Note to AI coder:** This document is your single source of truth. Every feature, every database table, every API route, every business rule, and every integration is described here. Do not invent structure that isn't here. If something is ambiguous, ask before building. UI and color palette are handled separately — this spec covers everything else.

---

# TABLE OF CONTENTS
1. [Project Overview & Guiding Principles](#1)
2. [Tech Stack & Project Structure](#2)
3. [Database Schema](#3)
4. [Authentication & Onboarding](#4)
5. [Community Circles Feature](#5)
6. [Women's Wellness Circle Feature](#6)
7. [Crisis Detection & Safety System](#7)
8. [Human Moderation System](#8)
9. [Wellness Experience Booking (Kuriftu)](#9)
10. [Payments (Telebirr, CBE Birr, Stripe)](#10)
11. [Real-Time System (WebSockets)](#11)
12. [Notifications](#12)
13. [Content & Feed System](#13)
14. [User Data Dashboard (Privacy)](#14)
15. [B2B Wellness Intelligence Module](#15)
16. [Admin Panel](#16)
17. [AI/NLP Components](#17)
18. [API Reference — All Endpoints](#18)
19. [Security Rules](#19)
20. [Environment Variables](#20)
21. [Seed Data & Initial Config](#21)

---

# 1. PROJECT OVERVIEW & GUIDING PRINCIPLES

## 1.1 What This Product Is
Selam Wellness is a community-first mental wellness platform for Ethiopian youth. It is NOT a therapy app. It is NOT a clinical tool. It is a peer support and wellness community with a clinical escalation pathway baked in.

## 1.2 Core User Promise
- Every user can find a safe community of people like them
- Every user can access culturally relevant wellness resources in Amharic, Oromiffa, or Tigrinya
- If a user is in crisis, they are never left alone — automated AND human response kicks in
- User data is never sold individually, ever

## 1.3 Non-Negotiable Product Rules (Enforce These Everywhere)
1. **No clinical diagnosis language** — the app never says "you have depression" or "you are at risk." It says "we noticed something" or "a support person will reach out."
2. **Crisis posts are immediately hidden** from the public feed — they are never visible to other community members while pending review.
3. **Anonymous posting is always available** — users can post to any community circle anonymously. Their username is replaced with a random Ethiopian name (e.g., "Lemlem from Addis").
4. **B2B data requires minimum 150-user cohort** — no aggregate stat is surfaced unless 150+ users contributed to it.
5. **Government entities are blocked from B2B buyer list** — this is enforced at signup level, not honor system.
6. **Amharic is the primary language** — every core user-facing string exists in Amharic first, then English.

---

# 2. TECH STACK & PROJECT STRUCTURE

## 2.1 Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Mobile App | React Native | 0.74+ | Expo managed workflow |
| Web Admin | Next.js | 14 (App Router) | Separate repo, same backend |
| Backend API | Node.js + Express | Node 20 LTS | REST + WebSocket |
| Database | PostgreSQL | 16 | Primary data store |
| Cache / Pub-Sub | Redis | 7.2 | Feed caching, WebSocket pub-sub, sessions |
| Cloud | AWS af-south-1 (Cape Town) | — | All services in this region |
| File Storage | AWS S3 (af-south-1) | — | Media, profile photos, documents |
| AI/NLP | Google Gemini API + custom classifier | gemini-1.5-flash | Crisis detection + Amharic NLP |
| Payments | Telebirr SDK + CBE Birr + Stripe | — | See Section 10 |
| Email | AWS SES | — | Transactional only |
| SMS | Ethio Telecom API or Africa's Talking | — | Crisis alerts, OTP |
| Push Notifications | Expo Push Notifications | — | Mobile push |
| Auth | JWT (access + refresh tokens) | — | No third-party auth provider |
| ORM | Prisma | 5+ | Type-safe DB access |

## 2.2 Monorepo Structure
```
selam-wellness/
├── apps/
│   ├── mobile/               # React Native (Expo)
│   │   ├── app/              # Expo Router file-based routing
│   │   │   ├── (auth)/       # Onboarding, login, register
│   │   │   ├── (tabs)/       # Main app tabs
│   │   │   │   ├── home/
│   │   │   │   ├── circles/
│   │   │   │   ├── women/    # Women's circle (gated)
│   │   │   │   ├── booking/
│   │   │   │   └── profile/
│   │   │   ├── circle/[id]/  # Individual circle view
│   │   │   ├── post/[id]/    # Individual post view
│   │   │   └── booking/[id]/ # Individual venue
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/            # Zustand global state
│   │   ├── services/         # API call wrappers
│   │   ├── i18n/             # Translations (am, en, om, ti)
│   │   └── utils/
│   └── admin/                # Next.js admin panel
│       ├── app/
│       │   ├── dashboard/
│       │   ├── moderation/
│       │   ├── users/
│       │   ├── crisis/
│       │   ├── b2b/
│       │   └── reports/
│       └── components/
├── packages/
│   ├── api/                  # Express backend
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── middleware/
│   │   │   ├── models/       # Prisma client wrappers
│   │   │   ├── workers/      # Background jobs
│   │   │   ├── websocket/
│   │   │   └── utils/
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   └── shared/               # Shared types, constants
│       ├── types/
│       └── constants/
├── package.json              # Workspace root
└── turbo.json                # Turborepo config
```

---

# 3. DATABASE SCHEMA

> **All Prisma schema.** Copy this exactly into `packages/api/prisma/schema.prisma`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────

enum Language {
  AMHARIC
  ENGLISH
  OROMIFFA
  TIGRINYA
}

enum Gender {
  MALE
  FEMALE
  PREFER_NOT_TO_SAY
}

enum SubscriptionTier {
  FREE
  SELAM_PLUS
}

enum CircleCategory {
  STRESS_MANAGEMENT
  CAREER_ANXIETY
  GRIEF_AND_LOSS
  PARENTING
  RELATIONSHIPS
  SPIRITUALITY
  PHYSICAL_WELLNESS
  STUDENT_LIFE
  WOMENS_HEALTH       // Women's Circle only
  REPRODUCTIVE_HEALTH // Women's Circle only
  GENERAL
}

enum PostStatus {
  PENDING_REVIEW     // AI flagged — hidden from public
  LIVE               // Approved / no flags
  HIDDEN_BY_MOD      // Moderator removed
  DELETED_BY_USER    // User deleted own post
  CRISIS_ESCALATED   // Moved to crisis workflow
}

enum CrisisLevel {
  NONE
  LOW         // Mild distress language
  MEDIUM      // Clear distress, not immediate danger
  HIGH        // Immediate self-harm or danger language
}

enum CrisisStatus {
  OPEN
  MODERATOR_ASSIGNED
  CLINICAL_REFERRED
  RESOLVED
  FALSE_POSITIVE
}

enum BookingStatus {
  PENDING_PAYMENT
  CONFIRMED
  CANCELLED_BY_USER
  CANCELLED_BY_VENUE
  COMPLETED
  REFUND_ISSUED
}

enum PaymentMethod {
  TELEBIRR
  CBE_BIRR
  STRIPE
}

enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
}

enum ModeratorRole {
  VOLUNTEER           // Community moderator, 12h coverage
  SENIOR_MODERATOR    // Reviews escalations
  CLINICAL_PARTNER    // Psychologist — crisis review only
  ADMIN               // Full access
}

enum NotificationType {
  CIRCLE_POST         // New post in your circle
  POST_REPLY          // Reply to your post
  CRISIS_ALERT        // Internal — moderators only
  BOOKING_CONFIRMED
  BOOKING_REMINDER
  SUBSCRIPTION_RENEWED
  SUBSCRIPTION_EXPIRING
  MODERATOR_RESPONSE  // Human mod reached out
  SYSTEM_ANNOUNCEMENT
  B2B_REPORT_PREVIEW  // 7-day preview before publishing
}

enum DataConsentAction {
  OPT_IN
  OPT_OUT
  DATA_DELETED
  FLAG_RAISED
}

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

model User {
  id                    String           @id @default(cuid())
  phone                 String?          @unique  // Primary identifier in Ethiopia
  email                 String?          @unique
  passwordHash          String
  displayName           String
  avatarUrl             String?
  bio                   String?          @db.VarChar(300)
  gender                Gender?
  dateOfBirth           DateTime?
  city                  String?          @default("Addis Ababa")
  preferredLanguage     Language         @default(AMHARIC)
  isVerified            Boolean          @default(false)
  isActive              Boolean          @default(true)
  isBanned              Boolean          @default(false)
  banReason             String?
  bannedAt              DateTime?
  subscriptionTier      SubscriptionTier @default(FREE)
  subscriptionExpiresAt DateTime?
  dataConsentGiven      Boolean          @default(false)
  dataConsentDate       DateTime?
  dataOptedOut          Boolean          @default(false)
  onboardingCompleted   Boolean          @default(false)
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt
  lastActiveAt          DateTime?

  // Relations
  sessions              Session[]
  circleMemberships     CircleMembership[]
  posts                 Post[]
  comments              Comment[]
  reactions             Reaction[]
  bookings              Booking[]
  notifications         Notification[]
  crisisIncidents       CrisisIncident[]       @relation("UserCrisisIncidents")
  moderatorProfile      ModeratorProfile?
  dataAuditLog          DataAuditLog[]
  flagsRaised           B2BReportFlag[]
  subscriptionHistory   SubscriptionHistory[]
  deviceTokens          DeviceToken[]

  @@index([phone])
  @@index([email])
  @@index([subscriptionTier])
  @@index([createdAt])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshToken String   @unique
  deviceInfo   String?
  ipAddress    String?
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([refreshToken])
}

model DeviceToken {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique  // Expo push token
  platform  String   // "ios" | "android"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

// ─────────────────────────────────────────────
// COMMUNITY CIRCLES
// ─────────────────────────────────────────────

model Circle {
  id              String         @id @default(cuid())
  name            String
  nameAmharic     String         // Always required
  nameOromiffa    String?
  nameTigrinya    String?
  description     String         @db.Text
  descriptionAmharic String      @db.Text
  category        CircleCategory
  coverImageUrl   String?
  isWomensCircle  Boolean        @default(false)  // True = female-only membership enforced
  isActive        Boolean        @default(true)
  isFeatured      Boolean        @default(false)
  memberCount     Int            @default(0)       // Denormalized for performance
  postCount       Int            @default(0)
  sortOrder       Int            @default(0)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  members         CircleMembership[]
  posts           Post[]
  moderationRules CircleModerationRule[]

  @@index([category])
  @@index([isWomensCircle])
  @@index([isFeatured])
}

model CircleMembership {
  id        String   @id @default(cuid())
  userId    String
  circleId  String
  joinedAt  DateTime @default(now())
  isMuted   Boolean  @default(false)

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  circle Circle @relation(fields: [circleId], references: [id], onDelete: Cascade)

  @@unique([userId, circleId])
  @@index([userId])
  @@index([circleId])
}

// ─────────────────────────────────────────────
// POSTS & COMMENTS
// ─────────────────────────────────────────────

model Post {
  id               String      @id @default(cuid())
  circleId         String
  authorId         String
  isAnonymous      Boolean     @default(false)
  anonymousAlias   String?     // Generated name like "Lemlem from Addis"
  contentText      String      @db.Text
  contentImages    String[]    // S3 URLs
  status           PostStatus  @default(LIVE)
  crisisLevel      CrisisLevel @default(NONE)
  crisisScore      Float?      // 0.0 – 1.0 from NLP classifier
  viewCount        Int         @default(0)
  commentCount     Int         @default(0)
  reactionCount    Int         @default(0)
  isPinned         Boolean     @default(false)
  moderationNote   String?     // Internal note from moderator
  moderatedBy      String?     // Moderator userId
  moderatedAt      DateTime?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  circle          Circle          @relation(fields: [circleId], references: [id])
  author          User            @relation(fields: [authorId], references: [id])
  comments        Comment[]
  reactions       Reaction[]
  crisisIncident  CrisisIncident?

  @@index([circleId, status, createdAt])
  @@index([authorId])
  @@index([crisisLevel])
  @@index([status])
}

model Comment {
  id             String   @id @default(cuid())
  postId         String
  authorId       String
  isAnonymous    Boolean  @default(false)
  anonymousAlias String?
  contentText    String   @db.Text
  parentId       String?  // For nested comments (max 2 levels)
  isHidden       Boolean  @default(false)
  moderationNote String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  post    Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  author  User      @relation(fields: [authorId], references: [id])
  parent  Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies Comment[] @relation("CommentReplies")

  @@index([postId, createdAt])
  @@index([authorId])
}

model Reaction {
  id        String   @id @default(cuid())
  postId    String
  userId    String
  emoji     String   // "❤️" | "🤲" | "💪" | "🌸" | "✨"
  createdAt DateTime @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([postId, userId])
  @@index([postId])
}

// ─────────────────────────────────────────────
// CRISIS SYSTEM
// ─────────────────────────────────────────────

model CrisisIncident {
  id                  String       @id @default(cuid())
  postId              String?      @unique
  userId              String
  crisisLevel         CrisisLevel
  nlpScore            Float        // Classifier confidence
  nlpFlags            String[]     // Which phrases triggered detection
  status              CrisisStatus @default(OPEN)
  assignedModeratorId String?
  assignedAt          DateTime?
  moderatorNotes      String?      @db.Text
  clinicalReferralAt  DateTime?
  clinicalPartnerName String?
  resolvedAt          DateTime?
  resolutionNotes     String?
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt

  post               Post?             @relation(fields: [postId], references: [id])
  user               User              @relation("UserCrisisIncidents", fields: [userId], references: [id])
  assignedModerator  ModeratorProfile? @relation(fields: [assignedModeratorId], references: [id])
  timeline           CrisisTimeline[]

  @@index([status, createdAt])
  @@index([userId])
  @@index([assignedModeratorId])
}

model CrisisTimeline {
  id           String   @id @default(cuid())
  incidentId   String
  actorId      String?  // null = system
  action       String   // e.g. "AI_DETECTED", "MOD_ASSIGNED", "USER_CONTACTED", "CLINICAL_REFERRED"
  note         String?
  createdAt    DateTime @default(now())

  incident CrisisIncident @relation(fields: [incidentId], references: [id], onDelete: Cascade)

  @@index([incidentId, createdAt])
}

// ─────────────────────────────────────────────
// MODERATION
// ─────────────────────────────────────────────

model ModeratorProfile {
  id               String        @id @default(cuid())
  userId           String        @unique
  role             ModeratorRole
  specialization   String?       // e.g., "Crisis Response", "Women's Circle"
  shiftStart       Int?          // Hour of day 0-23 (UTC+3)
  shiftEnd         Int?
  isOnDuty         Boolean       @default(false)
  totalCasesHandled Int          @default(0)
  createdAt        DateTime      @default(now())

  user            User             @relation(fields: [userId], references: [id])
  crisisIncidents CrisisIncident[]

  @@index([isOnDuty])
  @@index([role])
}

model CircleModerationRule {
  id          String   @id @default(cuid())
  circleId    String
  rule        String   @db.Text
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())

  circle Circle @relation(fields: [circleId], references: [id], onDelete: Cascade)
}

model UserReport {
  id            String   @id @default(cuid())
  reporterId    String
  reportedPostId   String?
  reportedCommentId String?
  reportedUserId   String?
  reason        String
  details       String?  @db.Text
  isReviewed    Boolean  @default(false)
  reviewedBy    String?
  reviewedAt    DateTime?
  action        String?  // "post_hidden" | "user_warned" | "user_banned" | "no_action"
  createdAt     DateTime @default(now())

  @@index([isReviewed, createdAt])
}

// ─────────────────────────────────────────────
// WELLNESS EXPERIENCE BOOKING
// ─────────────────────────────────────────────

model Venue {
  id                String   @id @default(cuid())
  name              String
  nameAmharic       String
  description       String   @db.Text
  descriptionAmharic String  @db.Text
  address           String
  city              String
  latitude          Float?
  longitude         Float?
  phoneNumber       String?
  websiteUrl        String?
  coverImageUrl     String
  galleryImages     String[] // S3 URLs
  tags              String[] // ["spa", "yoga", "retreat", "meditation"]
  isActive          Boolean  @default(true)
  isLaunchPartner   Boolean  @default(false) // Kuriftu = true
  commissionRate    Float    @default(0.12)  // 12% default
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  services       VenueService[]
  bookings       Booking[]

  @@index([city])
  @@index([isActive])
  @@index([tags])
}

model VenueService {
  id              String   @id @default(cuid())
  venueId         String
  name            String
  nameAmharic     String
  description     String   @db.Text
  durationMinutes Int
  price           Int      // In ETB (Ethiopian Birr), stored as integer (birr)
  maxParticipants Int      @default(1)
  imageUrl        String?
  isActive        Boolean  @default(true)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())

  venue    Venue     @relation(fields: [venueId], references: [id], onDelete: Cascade)
  bookings Booking[]

  @@index([venueId])
}

model Booking {
  id              String        @id @default(cuid())
  userId          String
  venueId         String
  serviceId       String
  scheduledDate   DateTime
  scheduledTime   String        // "09:00" — stored as string for display
  participants    Int           @default(1)
  totalAmountEtb  Int           // In ETB
  commissionEtb   Int           // Platform commission
  status          BookingStatus @default(PENDING_PAYMENT)
  notes           String?
  cancellationReason String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user    User         @relation(fields: [userId], references: [id])
  venue   Venue        @relation(fields: [venueId], references: [id])
  service VenueService @relation(fields: [serviceId], references: [id])
  payment Payment?

  @@index([userId, createdAt])
  @@index([venueId, scheduledDate])
  @@index([status])
}

// ─────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────

model Payment {
  id                 String        @id @default(cuid())
  userId             String
  bookingId          String?       @unique
  subscriptionId     String?       @unique
  method             PaymentMethod
  status             PaymentStatus @default(PENDING)
  amountEtb          Int           // In ETB
  amountUsd          Float?        // Only for Stripe (international)
  currency           String        @default("ETB")
  externalRef        String?       // Telebirr/CBE transaction ref
  stripePaymentIntentId String?
  errorMessage       String?
  paidAt             DateTime?
  refundedAt         DateTime?
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  booking      Booking?             @relation(fields: [bookingId], references: [id])
  subscription SubscriptionHistory? @relation(fields: [subscriptionId], references: [id])

  @@index([userId, createdAt])
  @@index([status])
  @@index([externalRef])
}

model SubscriptionHistory {
  id          String           @id @default(cuid())
  userId      String
  tier        SubscriptionTier
  startDate   DateTime
  endDate     DateTime
  amountEtb   Int
  createdAt   DateTime         @default(now())

  user    User     @relation(fields: [userId], references: [id])
  payment Payment?

  @@index([userId])
}

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  titleAmharic String?
  body      String
  bodyAmharic String?
  data      Json?            // Extra payload (postId, bookingId, etc.)
  isRead    Boolean          @default(false)
  readAt    DateTime?
  createdAt DateTime         @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead, createdAt])
}

// ─────────────────────────────────────────────
// DATA ETHICS & PRIVACY
// ─────────────────────────────────────────────

model DataAuditLog {
  id          String            @id @default(cuid())
  userId      String
  action      DataConsentAction
  description String?
  ipAddress   String?
  createdAt   DateTime          @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}

model B2BReport {
  id                String         @id @default(cuid())
  title             String
  description       String         @db.Text
  dataCategories    String[]       // e.g. ["stress_levels", "age_group", "city"]
  cohortSize        Int            // Must be >= 150 to publish
  previewStartDate  DateTime       // 7-day preview window start
  publishDate       DateTime?      // Set when preview passes
  isPublished       Boolean        @default(false)
  buyerId           String?        // B2BInstitution id
  reportUrl         String?        // S3 URL of actual report
  createdAt         DateTime       @default(now())

  flags B2BReportFlag[]

  @@index([isPublished])
  @@index([previewStartDate])
}

model B2BReportFlag {
  id        String   @id @default(cuid())
  reportId  String
  userId    String
  reason    String
  createdAt DateTime @default(now())

  report B2BReport @relation(fields: [reportId], references: [id])
  user   User      @relation(fields: [userId], references: [id])

  @@unique([reportId, userId])
}

model B2BInstitution {
  id               String   @id @default(cuid())
  name             String
  type             String   // "university" | "ngo" | "corporate" | "health_org"
  contactEmail     String
  isGovernmentBlocked Boolean @default(false)
  contractStartDate DateTime?
  contractEndDate   DateTime?
  monthlyFeeEtb    Int?
  isActive         Boolean  @default(true)
  createdAt        DateTime @default(now())

  @@index([type])
  @@index([isActive])
}

// ─────────────────────────────────────────────
// CONTENT LIBRARY (Phase 2 forward)
// ─────────────────────────────────────────────

model ContentItem {
  id              String   @id @default(cuid())
  title           String
  titleAmharic    String
  category        String   // "meditation" | "article" | "ritual" | "exercise"
  body            String?  @db.Text
  bodyAmharic     String?  @db.Text
  mediaUrl        String?
  thumbnailUrl    String?
  isPremium       Boolean  @default(false)
  viewCount       Int      @default(0)
  isActive        Boolean  @default(true)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())

  @@index([category, isPremium])
}
```

---

# 4. AUTHENTICATION & ONBOARDING

## 4.1 Registration Flow
Users register with either phone number OR email. Phone is the primary path for Ethiopian users.

**Step 1 — Phone/Email Signup**
- `POST /auth/send-otp` — sends 6-digit OTP via SMS (phone) or email
- OTP expires in 10 minutes, stored in Redis: `otp:{phone_or_email}` = `{code, attempts: 0}`
- Max 3 failed attempts → lockout for 30 minutes

**Step 2 — OTP Verification**
- `POST /auth/verify-otp` — validates OTP
- Returns a temporary `registration_token` (JWT, 30 min TTL) if valid
- `registration_token` payload: `{ phone_or_email, verified: true, type: "registration" }`

**Step 3 — Set Password**
- `POST /auth/complete-registration`
- Body: `{ registration_token, displayName, password, gender, dateOfBirth, city, preferredLanguage }`
- Creates User record
- Returns: `access_token` (15 min TTL) + `refresh_token` (30 days TTL)
- Stores refresh_token in `Session` table

**Step 4 — Data Consent Screen**
- This is a REQUIRED onboarding step — user cannot skip it
- App shows plain-language explanation in their chosen language
- User must tap either "I agree" or "I do not agree to aggregate data use"
- Either choice is accepted — refusal does not affect platform access
- `POST /auth/consent` — records consent to `DataAuditLog`

**Step 5 — Circle Selection**
- `GET /circles` — returns all active circles
- User picks 1–3 circles to join
- `POST /circles/join-batch` — body `{ circleIds: string[] }`
- After this, `onboardingCompleted` is set to `true`

## 4.2 Login
- `POST /auth/login` — phone/email + password
- Returns access_token + refresh_token
- Old refresh tokens for same device are invalidated

## 4.3 Token Refresh
- `POST /auth/refresh`
- Body: `{ refreshToken }`
- Validates against Session table, issues new access_token
- Rotates refresh token (old one deleted, new one issued)

## 4.4 Access Token Middleware
All protected routes use this middleware:
```javascript
// middleware/authenticate.js
// 1. Extract Bearer token from Authorization header
// 2. Verify JWT signature with process.env.JWT_SECRET
// 3. Check token not expired
// 4. Load user from DB — check isActive and isBanned
// 5. Attach user to req.user
// 6. If banned, return 403 with message in user's preferred language
```

## 4.5 Anonymous Alias Generation
When a user posts anonymously, generate an alias:
```javascript
// utils/anonymousAlias.js
const firstNames = ["Lemlem", "Tigist", "Hana", "Sara", "Meron", "Selam", 
                    "Dawit", "Yohannes", "Abel", "Samuel", "Betel", "Eden",
                    "Biruk", "Naomi", "Ruth", "Abebe", "Tsion", "Miriam"];
const cities = ["Addis", "Adama", "Bahir Dar", "Hawassa", "Mekelle", "Jimma", "Dire Dawa"];

function generateAlias(): string {
  const name = firstNames[Math.floor(Math.random() * firstNames.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  return `${name} from ${city}`;
}
// The same user gets the SAME alias within a single circle 
// (deterministic hash of userId + circleId) so they can have a 
// consistent anonymous identity per circle, but cannot be identified across circles.
```

---

# 5. COMMUNITY CIRCLES FEATURE

## 5.1 Circle Feed
The feed for each circle shows posts sorted by `createdAt DESC`. Pinned posts always appear first.

**Feed loading rules:**
- FREE users: full access to all circles, all posts
- SELAM+ users: no additional circle access (circles are free for all)
- Unauthenticated: cannot access any circle content (login wall)

`GET /circles/:circleId/posts`
- Query params: `?cursor=postId&limit=20` (cursor-based pagination)
- Returns only posts with `status = LIVE`
- Response includes: post content, anonymousAlias or displayName, reactions summary, commentCount, isOwnPost flag

## 5.2 Creating a Post
`POST /circles/:circleId/posts`

**Body:**
```json
{
  "contentText": "string (required, max 2000 chars)",
  "contentImages": ["s3_url", "..."],
  "isAnonymous": false
}
```

**Server-side processing order:**
1. Validate user is a member of the circle
2. Validate circle is active
3. If `isWomensCircle = true`, validate user's gender = FEMALE (else 403)
4. **Run NLP crisis scan** (see Section 7) — this is synchronous and must complete before the post is saved
5. If crisisLevel = HIGH → set `status = PENDING_REVIEW`, create `CrisisIncident`, trigger crisis workflow
6. If crisisLevel = MEDIUM → set `status = PENDING_REVIEW`, create `CrisisIncident` at MEDIUM level
7. If crisisLevel = NONE or LOW → set `status = LIVE`
8. If `isAnonymous = true` → generate/retrieve deterministic alias for userId + circleId
9. Save Post to DB
10. Increment `circle.postCount` (use PostgreSQL counter, not application-level)
11. Emit WebSocket event to circle room (only if status = LIVE)
12. Return created post

## 5.3 Reactions
Available reactions (culturally chosen):
- ❤️ Love / Warmth
- 🤲 I'm with you (prayer hands — resonant in Ethiopia)
- 💪 Strength
- 🌸 Peace / Softness
- ✨ This helped me

`POST /posts/:postId/react`
Body: `{ emoji: "❤️" }`
Rules: one reaction per user per post. If same emoji → delete (toggle off). If different emoji → replace.

## 5.4 Comments
`POST /posts/:postId/comments`
Body: `{ contentText, isAnonymous, parentId? }`
- Max nesting depth: 2 levels
- Comments on a post with `status != LIVE` are not allowed
- Run NLP crisis scan on comment text too (lighter scan — flag only HIGH)

---

# 6. WOMEN'S WELLNESS CIRCLE FEATURE

## 6.1 Access Control
- Membership is restricted to users who registered with `gender = FEMALE`
- This is enforced at the API level on every write operation
- If a male user somehow reaches this screen, show: "This circle is a safe space created for women. We hope you find your own circle." — no accusatory language.

## 6.2 Dedicated Categories in Women's Circle
The Women's Circle contains sub-spaces (implemented as category filters, NOT separate circles):
- **Reproductive Health** — menstrual health, PCOS, fertility, pregnancy support
- **Mental Wellness for Women** — anxiety, postpartum, domestic pressures
- **Career & Ambition** — work-life, workplace harassment, ambition support
- **Body Positivity** — Ethiopian beauty standards, body acceptance
- **Certified Practitioner Posts** — flagged posts from verified OB/GYN or psychologist partners (read-only from practitioners, comments enabled)

## 6.3 Certified Practitioner Posts
- Practitioners are added to the `ModeratorProfile` table with `role = CLINICAL_PARTNER`
- Their posts have a `isPractitionerPost` flag visible in the feed with a verified badge
- They cannot see user private data — only the public circle feed

## 6.4 Menstrual Tracking (Selam+ Feature)
This is a premium feature. Data is stored completely separately and is explicitly excluded from the B2B aggregate data pool.

`POST /women/cycle/log`
Body: `{ date, type: "period_start" | "period_end" | "symptom", symptom?: string, notes? }`

`GET /women/cycle/history?months=3`
- Returns cycle history for the authenticated user only
- Never included in aggregate reports — enforced at the query level for B2B (add a `excludeFromB2B: true` flag to the table)

---

# 7. CRISIS DETECTION & SAFETY SYSTEM

## 7.1 Overview
This is the most critical system in the app. It must work reliably. Every post and comment is scanned before it is saved.

## 7.2 NLP Crisis Scanner
```javascript
// services/crisisNLP.js

const CRISIS_KEYWORDS_AMHARIC = [
  "መሞት", "እራሴን ማጥፋት", "አልፈልግም", "ህይወቴ", "ልሞት", "መጥፋት",
  "ማንም አይፈልገኝም", "ጥቅም የለሽ", "ተስፋ ቆርጫለሁ"
];

const CRISIS_KEYWORDS_ENGLISH = [
  "kill myself", "end my life", "want to die", "suicide", "no reason to live",
  "nobody cares", "better off dead", "can't go on", "self harm", "hurt myself",
  "worthless", "hopeless", "disappear forever"
];

const CRISIS_KEYWORDS_OROMIFFA = [
  "of du'uu", "jiraachuu hin barbaadu", "hiyyummaanoo", "abdii kutadhe"
];

// Crisis level determination:
// Score 0.0 – 0.3: NONE
// Score 0.3 – 0.6: LOW
// Score 0.6 – 0.8: MEDIUM  
// Score 0.8 – 1.0: HIGH

async function scanText(text: string, language: Language): Promise<{
  crisisLevel: CrisisLevel;
  score: number;
  flags: string[];
}> {
  // Step 1: Fast keyword scan (synchronous, <10ms)
  const foundKeywords = runKeywordScan(text, language);
  
  if (foundKeywords.length === 0) {
    return { crisisLevel: "NONE", score: 0.0, flags: [] };
  }
  
  // Step 2: If keywords found, send to Gemini for deeper analysis
  const geminiResult = await callGeminiCrisisClassifier(text, language);
  
  return {
    crisisLevel: scoreToLevel(geminiResult.score),
    score: geminiResult.score,
    flags: [...foundKeywords, ...geminiResult.additionalFlags]
  };
}
```

**Gemini Prompt for Crisis Classification:**
```
System: You are a mental health crisis language classifier. 
You analyze text written by young Ethiopians and determine if it contains crisis signals.
Respond ONLY with valid JSON: { "score": 0.0-1.0, "additionalFlags": [], "reasoning": "" }

Score guide:
0.0-0.3: No crisis signals or normal expression of everyday stress
0.4-0.6: Elevated distress, sadness, hopelessness language — concerning but not acute
0.7-0.8: Clear self-harm ideation signals, expressions of wanting to not exist
0.9-1.0: Direct, explicit statements of suicidal intent or plan

Context: This text was posted in a mental wellness community app by an Ethiopian youth.
Language: {language}
Text: "{text}"
```

## 7.3 Crisis Response Workflow

**When crisisLevel = HIGH:**
1. Post `status` → `PENDING_REVIEW` (immediately hidden from public feed)
2. Create `CrisisIncident` record
3. Add `CrisisTimeline` event: `AI_DETECTED`
4. Send in-app notification to user (within 2 seconds of post submission):
   > **Amharic:** "ፖስትህን/ሿን አይተናል። አንተ/ቺ ብቻ አይደለህ/ሽም። የሰላም ድጋፍ ሰጪ ሰው በ30 ደቂቃ ውስጥ ያገኝሃል/ሻል።"
   > **English fallback:** "We noticed your post. You are not alone. A Selam support person will reach out within 30 minutes."
5. Send push notification + SMS to on-duty moderators (all moderators with `isOnDuty = true`)
6. Post goes into the moderation queue with HIGH priority
7. If no moderator responds within 25 minutes → escalate to SENIOR_MODERATOR + send alert to admin

**When crisisLevel = MEDIUM:**
1. Post `status` → `PENDING_REVIEW`
2. Create `CrisisIncident`
3. Goes into moderation queue with MEDIUM priority
4. No immediate user notification (handled by moderator)
5. 4-hour SLA for moderator review

**When crisisLevel = LOW:**
1. Post goes `LIVE` immediately
2. Soft internal flag logged but no incident created
3. Human moderator may review if volume is low

## 7.4 What Users See During PENDING_REVIEW
- Their post appears in their own "My Posts" feed with a badge: "Under Review"
- A message: "We're making sure this is a safe space for everyone. Your post will be reviewed shortly."
- The post does NOT appear in the circle feed to other users

## 7.5 Crisis Resource Display
When a user's post is flagged HIGH, always display (in their preferred language):
- **Amanuel Mental Specialized Hospital Crisis Line:** 0116-62-52-09
- **Selam Crisis Chat:** link to in-app support chat with on-duty moderator
- **You are not alone** message in Amharic, with local reference (community, idir spirit)

---

# 8. HUMAN MODERATION SYSTEM

## 8.1 Moderation Queue
The admin panel has a moderation queue page that moderators see when logged in.

Queue shows posts sorted by:
1. Priority: HIGH crisis (RED) → MEDIUM crisis (ORANGE) → User-reported (YELLOW) → General review (WHITE)
2. Within same priority: oldest first (FIFO)

Each queue item shows:
- Post text (full)
- NLP score and flags
- User's circle membership history
- Previous crisis incidents for this user (anonymized summary: "2 previous HIGH incidents")
- Action buttons: APPROVE (go LIVE), HIDE (go HIDDEN_BY_MOD), ESCALATE_TO_CLINICAL, MARK_FALSE_POSITIVE

## 8.2 Moderator Actions

`POST /moderation/posts/:postId/approve`
- Sets status = LIVE
- Emits WebSocket event to circle room
- Updates CrisisIncident if exists → add timeline event

`POST /moderation/posts/:postId/hide`
- Body: `{ reason: string }`
- Sets status = HIDDEN_BY_MOD
- Sends user notification: "Your post was reviewed and couldn't be shared in the community. You can contact support if you have questions."

`POST /moderation/crisis/:incidentId/assign`
- Assigns incident to requesting moderator
- Sets `assignedModeratorId`, `assignedAt`
- Adds timeline event

`POST /moderation/crisis/:incidentId/refer-clinical`
- Sets status = CLINICAL_REFERRED
- Records `clinicalReferralAt`, `clinicalPartnerName`
- Triggers in-app message to user with clinical partner contact info
- Adds timeline event

## 8.3 Moderator Coverage Enforcement
- Moderators set their shift hours in their profile
- System tracks `isOnDuty` in real-time based on shift hours
- If 0 moderators are on duty and a HIGH crisis incident arrives → automated escalation:
  1. Send SMS to ALL active moderators (regardless of shift)
  2. Send email to admin account
  3. Auto-assign to the moderator who most recently resolved a case

---

# 9. WELLNESS EXPERIENCE BOOKING (KURIFTU)

## 9.1 Venue Discovery

`GET /venues`
- Query params: `?city=Addis+Ababa&tags=spa&sort=rating`
- Returns list of active venues with cover image, tags, service count, price range

`GET /venues/:venueId`
- Returns full venue detail including all services with prices and durations

`GET /venues/:venueId/services`
- Returns all active services for a venue

## 9.2 Availability Check
> **Note:** For MVP, availability is managed manually by the venue. There is no real-time calendar sync. Users pick a date and time from a list of available slots that the venue admin pre-configures.

Model to add to schema:
```prisma
model VenueAvailability {
  id          String   @id @default(cuid())
  venueId     String
  serviceId   String
  date        DateTime @db.Date
  timeSlots   String[] // ["09:00", "11:00", "14:00", "16:00"]
  bookedSlots String[] // Slots already booked
  
  @@unique([venueId, serviceId, date])
}
```

`GET /venues/:venueId/services/:serviceId/availability?date=2026-07-15`
- Returns available time slots for that date

## 9.3 Booking Flow

**Step 1 — Create Booking (holds slot for 10 minutes)**
`POST /bookings`
```json
{
  "venueId": "string",
  "serviceId": "string",
  "scheduledDate": "2026-07-15",
  "scheduledTime": "09:00",
  "participants": 1,
  "notes": "optional"
}
```
- Server validates slot is available
- Creates Booking with `status = PENDING_PAYMENT`
- Temporarily holds slot in Redis: `slot:{venueId}:{serviceId}:{date}:{time}` with 10-min TTL
- Returns `bookingId` + `totalAmountEtb` + payment initiation endpoint

**Step 2 — Initiate Payment**
`POST /bookings/:bookingId/pay`
```json
{
  "method": "TELEBIRR" | "CBE_BIRR" | "STRIPE"
}
```
- Calls appropriate payment gateway (see Section 10)
- Returns payment initiation URL/QR code

**Step 3 — Payment Webhook**
`POST /webhooks/telebirr` / `POST /webhooks/cbe` / `POST /webhooks/stripe`
- Validates webhook signature
- Updates `Payment.status`
- If SUCCESS → updates `Booking.status = CONFIRMED`, releases slot hold, sends confirmation notification
- If FAILED → updates `Booking.status = PENDING_PAYMENT` (user can retry), releases slot hold

## 9.4 Booking Management

`GET /bookings/my` — user's booking history
`POST /bookings/:bookingId/cancel` — cancel booking
- If >24h before appointment → full refund
- If <24h → no refund (configurable per venue)
- Updates status, triggers refund process if applicable

---

# 10. PAYMENTS

## 10.1 Telebirr Integration
Telebirr is the primary payment method. Ethiopian users pay via USSD or the Telebirr app.

```javascript
// services/payments/telebirr.js

// Telebirr uses a request-signing mechanism
// Official docs: https://developer.ethiotelecom.et/

async function initiateTelebirrPayment(booking: Booking, user: User) {
  const payload = {
    appid: process.env.TELEBIRR_APP_ID,
    merch_code: process.env.TELEBIRR_MERCHANT_CODE,
    nonce: generateNonce(),
    notify_url: `${process.env.API_BASE_URL}/webhooks/telebirr`,
    out_trade_no: booking.id,
    short_code: process.env.TELEBIRR_SHORT_CODE,
    subject: `Selam Wellness - ${booking.service.name}`,
    timestamp: Date.now().toString(),
    total_amount: booking.totalAmountEtb.toString(),
    trade_type: "Payment",
    return_url: `${process.env.APP_DEEP_LINK}/booking/${booking.id}/confirm`
  };

  const signature = signPayload(payload, process.env.TELEBIRR_APP_KEY);
  payload.sign = signature;
  
  // Encrypt with Telebirr public key
  const encrypted = rsaEncrypt(JSON.stringify(payload), TELEBIRR_PUBLIC_KEY);
  
  const response = await fetch("https://app.ethiotelebirr.et/openApi/payment/v1/prepay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appid: process.env.TELEBIRR_APP_ID,
      sign: signature,
      ussd: encrypted
    })
  });
  
  return response.json(); // Contains toPayUrl
}
```

## 10.2 CBE Birr Integration
Commercial Bank of Ethiopia's mobile payment.
```javascript
// services/payments/cbeBirr.js
// CBE Birr uses HTTPS API with merchant credentials
// Endpoint: provided by CBE upon merchant registration
// Process: similar to Telebirr — create payment order → get redirect URL → webhook on completion
```

## 10.3 Stripe Integration (International / Diaspora)
For users paying with international cards (diaspora sending money to family in Ethiopia):
```javascript
// services/payments/stripe.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createStripePaymentIntent(booking: Booking) {
  // Convert ETB to USD at current rate (fetch from exchange rate API or hardcode update weekly)
  const amountUsd = booking.totalAmountEtb / process.env.ETB_TO_USD_RATE;
  
  const intent = await stripe.paymentIntents.create({
    amount: Math.round(amountUsd * 100), // Stripe uses cents
    currency: 'usd',
    metadata: {
      bookingId: booking.id,
      userId: booking.userId
    }
  });
  
  return intent;
}
```

## 10.4 Subscription Payments
`POST /subscriptions/subscribe`
Body: `{ method: PaymentMethod, tier: "SELAM_PLUS" }`
- Creates `SubscriptionHistory` record
- Initiates payment for ETB 150 (default) or ETB 200 (annual prorate)
- On success: updates `User.subscriptionTier = SELAM_PLUS`, sets `subscriptionExpiresAt = now + 30 days`
- Sends renewal reminder 3 days before expiry (background job)

---

# 11. REAL-TIME SYSTEM (WEBSOCKETS)

## 11.1 WebSocket Architecture
Using `ws` library with Redis Pub/Sub for horizontal scaling.

```javascript
// websocket/server.js

// Connection authentication:
// Client sends: { type: "AUTH", token: "Bearer ..." }
// Server validates token, associates socket with userId

// Rooms (Redis channels):
// "circle:{circleId}" — all members of a circle
// "moderation" — all active moderators
// "crisis:{incidentId}" — crisis response team for specific incident
// "user:{userId}" — private channel per user (for personal notifications)
```

## 11.2 Events the Server Emits

| Event | Channel | Payload | When |
|---|---|---|---|
| `new_post` | `circle:{id}` | Post object (LIVE posts only) | Post approved/created with no flags |
| `post_reaction` | `circle:{id}` | `{postId, emoji, count}` | Reaction added/removed |
| `new_comment` | `circle:{id}` | Comment object | New comment added |
| `crisis_alert` | `moderation` | Incident summary | New HIGH/MEDIUM crisis |
| `post_approved` | `user:{id}` | `{postId}` | User's pending post approved |
| `moderator_message` | `user:{id}` | Message text | Moderator sends user a message |
| `booking_confirmed` | `user:{id}` | Booking object | Payment confirmed |
| `notification` | `user:{id}` | Notification object | Any notification |

## 11.3 Client-Side WebSocket Usage (React Native)
```javascript
// services/websocket.js
// Connect on app foreground
// Disconnect on app background (to save battery)
// Reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s)
// Store incoming messages in Zustand store
// All WS updates are optimistic — they supplement, not replace, the REST API
```

---

# 12. NOTIFICATIONS

## 12.1 Notification Delivery Priority

| Type | In-App | Push | SMS |
|---|---|---|---|
| CRISIS_ALERT (to moderators) | ✅ | ✅ | ✅ |
| MODERATOR_RESPONSE (to user) | ✅ | ✅ | ✅ |
| CIRCLE_POST | ✅ | ✅ | ❌ |
| POST_REPLY | ✅ | ✅ | ❌ |
| BOOKING_CONFIRMED | ✅ | ✅ | ✅ |
| BOOKING_REMINDER | ✅ | ✅ | ✅ |
| SUBSCRIPTION_EXPIRING | ✅ | ✅ | ❌ |
| B2B_REPORT_PREVIEW | ✅ | ❌ | ❌ |

## 12.2 Notification Service
```javascript
// services/notifications.js

async function sendNotification(userId, type, data) {
  // 1. Create Notification record in DB (always)
  // 2. If user has device token → send Expo push notification
  // 3. If SMS required → call Africa's Talking SMS API
  // 4. Emit WebSocket event to user:{userId} channel
  
  // Respect user's preferred language for notification text
  const user = await getUser(userId);
  const text = getNotificationText(type, data, user.preferredLanguage);
  
  await createDbNotification(userId, type, text, data);
  await sendPush(userId, text);
  if (requiresSMS(type)) await sendSMS(user.phone, text.body);
  emitWebSocket(`user:${userId}`, 'notification', { type, ...text, data });
}
```

## 12.3 Notification Text Templates (Amharic + English)
Every notification type needs both Amharic and English text. Examples:

**BOOKING_CONFIRMED:**
- AM: "✅ ቦኪንህ ተረጋግጧል! {venueName} — {date} {time}"
- EN: "✅ Booking confirmed! {venueName} — {date} {time}"

**CIRCLE_POST:**
- AM: "📢 {circleName} ክበብ ውስጥ አዲስ ፖስት አለ"
- EN: "📢 New post in {circleName} circle"

**SUBSCRIPTION_EXPIRING:**
- AM: "⚡ የሰላም+ ደንበኝነት በ3 ቀናት ያልቃል"
- EN: "⚡ Your Selam+ subscription expires in 3 days"

---

# 13. CONTENT & FEED SYSTEM

## 13.1 Home Feed
The home screen shows a personalized feed assembled from:
1. **Latest posts** from circles the user has joined (last 24h, LIVE posts only)
2. **Featured content** from the content library (max 2 items per refresh)
3. **Booking spotlight** — featured venue with a call to action (if user has active subscription)

`GET /feed/home`
- Returns max 20 items per call
- Each item has a `type`: "circle_post" | "content_item" | "venue_spotlight"

## 13.2 Circle Feed
See Section 5. Cursor-based pagination, 20 posts per page.

## 13.3 Search
`GET /search?q=anxiety&type=circles|posts|venues`
- Circles: full-text search on name + description (Amharic and English)
- Posts: full-text search on LIVE posts only
- Venues: search on name, tags, city

Use PostgreSQL full-text search with `tsvector` for Amharic support, supplemented by `ILIKE` for simple matching where FTS falls short.

---

# 14. USER DATA DASHBOARD (PRIVACY)

## 14.1 What Users Can See
A "My Data" screen in the profile section shows:
- What data categories have been included in aggregate reports in the past 90 days
- A log of all consent actions taken
- The ability to delete any data point

`GET /privacy/my-data-usage`
- Returns list of B2BReport items that included data from this user (anonymized — just category and date, not which institution bought it)

`GET /privacy/consent-log`
- Returns full `DataAuditLog` for the user

`POST /privacy/delete-data-point`
Body: `{ dataType: "cycle_logs" | "mood_entries" | "post_history" }`
- Soft-deletes the specified data from aggregate eligibility
- Creates a `DataAuditLog` entry

`POST /privacy/opt-out`
- Sets `User.dataOptedOut = true`
- Creates `DataAuditLog` entry
- User's data is excluded from all future B2B reports

---

# 15. B2B WELLNESS INTELLIGENCE MODULE

## 15.1 Who Can Access This
Only admin accounts and B2BInstitution accounts (separate auth flow).

## 15.2 Report Generation Rules (ENFORCE STRICTLY)
Before any B2B report is generated, the system must check:
1. Cohort size ≥ 150 users (k-anonymity minimum)
2. Buyer institution is NOT of type "government" or "political"
3. Report does not contain individual-identifiable data
4. Women's health / menstrual data is EXCLUDED (separate flag)
5. Crisis incident content is EXCLUDED

## 15.3 Report Preview Workflow
1. Admin creates report draft: `POST /admin/b2b/reports`
2. System calculates cohort size — if <150, rejects immediately
3. System posts in-app notification to all contributing users: `B2B_REPORT_PREVIEW`
4. 7-day preview window opens
5. Users can flag the report: `POST /b2b/reports/:reportId/flag`
6. If ≥10 flags received → report goes to review before publishing
7. After 7 days with <10 flags (or after review with <10 flags) → auto-publish
8. `POST /admin/b2b/reports/:reportId/publish` — admin manually confirms

## 15.4 What Data Can Be in Reports
Allowed aggregate metrics:
- Stress level trends by age group, city, time of week (no individual data)
- Circle membership patterns (which topics are most active, by demographic)
- Booking patterns (most popular wellness services, by age group)
- App engagement patterns (daily active usage, session length averages)

---

# 16. ADMIN PANEL (Next.js)

## 16.1 Admin Auth
Separate login: `POST /admin/auth/login`
- Admin users are in the same `User` table but have `ModeratorProfile.role = ADMIN`
- Admin JWT has a separate secret: `process.env.ADMIN_JWT_SECRET`

## 16.2 Admin Panel Pages & Their Data Needs

**Dashboard** (`/dashboard`)
- Total users (today vs yesterday vs 7-day trend)
- Active circles and post count (last 24h)
- Open crisis incidents (by level)
- Revenue today (bookings + subscriptions)
- Moderation queue size

**Moderation Queue** (`/moderation`)
- List of PENDING_REVIEW posts with NLP scores
- Filter by: crisis level, circle, time
- Action buttons: APPROVE, HIDE, ESCALATE
- Inline crisis timeline view

**Crisis Management** (`/crisis`)
- All CrisisIncidents with status filter
- Moderator assignment view
- Timeline per incident
- Outcome tracking

**Users** (`/users`)
- Search users by phone/email/name
- View user details, post history, circle memberships
- Ban user with reason
- Subscription status

**Venues & Bookings** (`/venues`)
- Manage venue listings
- View all bookings with status
- Manage availability slots
- Commission report

**B2B Reports** (`/b2b`)
- Create and manage reports
- Preview workflow
- Institution management (add/remove buyers)
- Flag review queue

---

# 17. AI/NLP COMPONENTS

## 17.1 Gemini API Usage
```javascript
// services/ai/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Rate limiting: use a token bucket — max 60 calls/minute
// Cache identical text results for 5 minutes in Redis to avoid redundant calls
// If Gemini is unavailable → fall back to keyword-only scan, log the failure
```

## 17.2 Amharic Language Handling
- Amharic text is stored as UTF-8 in PostgreSQL (default)
- No special column settings needed — PostgreSQL handles Unicode natively
- For full-text search, use `pg_trgm` extension for trigram similarity on Amharic
- Display names and post content can mix Amharic and English (code-switching is common)

## 17.3 Auto-Translation (Phase 2)
- For MVP: no auto-translation. Content is in whatever language the user writes.
- Phase 2: Integrate Gemini to optionally translate posts between Amharic/English for users who set preferred language differently from post language.

---

# 18. API REFERENCE — ALL ENDPOINTS

> **Base URL:** `https://api.selamwellness.com/v1`
> **Auth header:** `Authorization: Bearer {access_token}` (all except /auth routes)

## Auth
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | /auth/send-otp | No | Send OTP to phone or email |
| POST | /auth/verify-otp | No | Verify OTP → registration token |
| POST | /auth/complete-registration | No | Complete signup |
| POST | /auth/consent | Yes | Record data consent decision |
| POST | /auth/login | No | Login with phone/email + password |
| POST | /auth/refresh | No | Refresh access token |
| POST | /auth/logout | Yes | Invalidate session |
| GET | /auth/me | Yes | Current user profile |

## Users
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /users/profile | Yes | Own profile |
| PATCH | /users/profile | Yes | Update profile |
| POST | /users/avatar | Yes | Upload avatar (multipart) |
| GET | /users/notifications | Yes | Notification list |
| PATCH | /users/notifications/:id/read | Yes | Mark notification read |
| POST | /users/notifications/read-all | Yes | Mark all as read |
| GET | /users/my-posts | Yes | Own posts (all statuses) |

## Circles
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /circles | Yes | All active circles |
| GET | /circles/:id | Yes | Circle detail |
| GET | /circles/:id/posts | Yes | Circle feed (paginated) |
| POST | /circles/:id/join | Yes | Join circle |
| POST | /circles/:id/leave | Yes | Leave circle |
| POST | /circles/join-batch | Yes | Join multiple circles (onboarding) |

## Posts
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | /circles/:id/posts | Yes | Create post |
| GET | /posts/:id | Yes | Single post with comments |
| DELETE | /posts/:id | Yes | Delete own post |
| POST | /posts/:id/react | Yes | Add/remove reaction |
| POST | /posts/:id/comments | Yes | Add comment |
| DELETE | /comments/:id | Yes | Delete own comment |
| POST | /posts/:id/report | Yes | Report a post |

## Women's Circle
| Method | Endpoint | Auth Required | Notes |
|---|---|---|---|
| GET | /women/circle | Yes (female only) | Women's circle feed |
| POST | /women/cycle/log | Yes (female only) | Log cycle data |
| GET | /women/cycle/history | Yes (female only) | Cycle history |

## Booking
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /venues | Yes | All active venues |
| GET | /venues/:id | Yes | Venue detail |
| GET | /venues/:id/services | Yes | Venue services |
| GET | /venues/:id/services/:sid/availability | Yes | Available slots |
| POST | /bookings | Yes | Create booking |
| GET | /bookings/my | Yes | My bookings |
| GET | /bookings/:id | Yes | Booking detail |
| POST | /bookings/:id/pay | Yes | Initiate payment |
| POST | /bookings/:id/cancel | Yes | Cancel booking |

## Subscriptions
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /subscriptions/plans | Yes | Available plans and prices |
| POST | /subscriptions/subscribe | Yes | Start subscription |
| GET | /subscriptions/my | Yes | My subscription history |

## Feed
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /feed/home | Yes | Personalized home feed |
| GET | /search | Yes | Search circles/posts/venues |

## Privacy
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /privacy/my-data-usage | Yes | What data was in reports |
| GET | /privacy/consent-log | Yes | Consent history |
| POST | /privacy/delete-data-point | Yes | Remove data from reports |
| POST | /privacy/opt-out | Yes | Opt out of all data use |

## B2B (Public — for report preview)
| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /b2b/reports/preview | Yes | Reports in 7-day preview |
| POST | /b2b/reports/:id/flag | Yes | Flag a report |

## Webhooks (No auth — validated by signature)
| Method | Endpoint | Description |
|---|---|---|
| POST | /webhooks/telebirr | Telebirr payment callback |
| POST | /webhooks/cbe | CBE Birr payment callback |
| POST | /webhooks/stripe | Stripe payment callback |

## Admin (Separate auth)
All admin routes are prefixed with `/admin` and require `role = ADMIN` or `SENIOR_MODERATOR`.

| Method | Endpoint | Description |
|---|---|---|
| GET | /admin/dashboard/stats | Dashboard metrics |
| GET | /admin/moderation/queue | Moderation queue |
| POST | /admin/moderation/posts/:id/approve | Approve post |
| POST | /admin/moderation/posts/:id/hide | Hide post |
| GET | /admin/crisis/incidents | All crisis incidents |
| POST | /admin/crisis/:id/assign | Assign to moderator |
| POST | /admin/crisis/:id/refer-clinical | Refer to clinical |
| POST | /admin/crisis/:id/resolve | Resolve incident |
| GET | /admin/users | Users list (searchable) |
| POST | /admin/users/:id/ban | Ban user |
| GET | /admin/venues | Venues list |
| POST | /admin/venues | Create venue |
| PATCH | /admin/venues/:id | Update venue |
| POST | /admin/venues/:id/services | Add service |
| POST | /admin/venues/:id/availability | Set availability |
| GET | /admin/b2b/reports | B2B reports |
| POST | /admin/b2b/reports | Create report |
| POST | /admin/b2b/reports/:id/publish | Publish report |
| GET | /admin/b2b/institutions | Buyer institutions |
| POST | /admin/b2b/institutions | Add institution |

---

# 19. SECURITY RULES

## 19.1 Rate Limiting (Express middleware, backed by Redis)
```javascript
// Apply to all routes
const rateLimits = {
  "POST /auth/send-otp": "5 requests per phone/email per hour",
  "POST /auth/login": "10 requests per IP per 15 minutes",
  "POST /circles/:id/posts": "20 posts per user per hour",
  "POST /posts/:id/react": "100 requests per user per minute",
  "POST /posts/:id/report": "10 reports per user per hour",
  "default": "200 requests per user per minute"
}
```

## 19.2 Input Validation
- All inputs validated with `zod` schemas before processing
- Post content: strip HTML, max 2000 characters
- Images: validate S3 URL format, check file extension, max 5 images per post
- Phone numbers: validate Ethiopian format (+251XXXXXXXXX or 09XXXXXXXX)
- Never trust client-side crisisLevel — always re-scan server-side

## 19.3 Sensitive Data Handling
- Passwords: bcrypt with salt rounds = 12
- OTPs: stored in Redis (not DB), deleted on use
- JWT secrets: separate secrets for user and admin tokens
- Webhook signatures: HMAC-SHA256 validation on all payment webhooks
- Crisis content: accessible only to users with `VOLUNTEER` or higher moderator role
- B2B reports: accessible only to verified `B2BInstitution` accounts

## 19.4 Women's Circle Data
- Women's circle post data has an additional `isWomensCircleData: true` flag
- This data is explicitly excluded from all B2B aggregate queries
- Menstrual tracking data is stored in a separate table, never joined into analytics queries

---

# 20. ENVIRONMENT VARIABLES

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/selam_wellness"

# Redis
REDIS_URL="redis://host:6379"

# Auth
JWT_SECRET="your-256-bit-secret"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="30d"
ADMIN_JWT_SECRET="different-256-bit-secret"

# AWS
AWS_REGION="af-south-1"
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
S3_BUCKET_NAME="selam-wellness-media"
SES_FROM_EMAIL="noreply@selamwellness.com"

# Payments
TELEBIRR_APP_ID=""
TELEBIRR_APP_KEY=""
TELEBIRR_MERCHANT_CODE=""
TELEBIRR_SHORT_CODE=""
CBE_BIRR_MERCHANT_ID=""
CBE_BIRR_SECRET=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
ETB_TO_USD_RATE="55"  # Update weekly

# AI/NLP
GEMINI_API_KEY=""

# SMS
AFRICA_TALKING_API_KEY=""
AFRICA_TALKING_USERNAME=""

# App URLs
API_BASE_URL="https://api.selamwellness.com/v1"
APP_DEEP_LINK="selamwellness://"
ADMIN_URL="https://admin.selamwellness.com"
```

---

# 21. SEED DATA & INITIAL CONFIG

## 21.1 Initial Circles (Seed These)
```javascript
const circles = [
  {
    name: "Career Anxiety",
    nameAmharic: "የሥራ ጭንቀት",
    category: "CAREER_ANXIETY",
    description: "A space to talk about workplace stress, career pressure, and professional growth.",
    descriptionAmharic: "ስለ ሥራ ቦታ ጭንቀት፣ የሙያ ጫና እና ሙያዊ ዕድገት ለመነጋገር ቦታ።",
    isFeatured: true,
    sortOrder: 1
  },
  {
    name: "Student Life",
    nameAmharic: "የተማሪ ሕይወት",
    category: "STUDENT_LIFE",
    description: "University stress, exams, ALX, and student support.",
    descriptionAmharic: "የዩኒቨርሲቲ ጭንቀት፣ ፈተናዎች፣ ALX እና የተማሪ ድጋፍ።",
    isFeatured: true,
    sortOrder: 2
  },
  {
    name: "Grief & Loss",
    nameAmharic: "ሐዘን እና ኪሳራ",
    category: "GRIEF_AND_LOSS",
    description: "Processing loss with people who understand.",
    descriptionAmharic: "ከሚረዱ ሰዎች ጋር ኪሳራን ማስተናገድ።",
    sortOrder: 3
  },
  {
    name: "Relationships",
    nameAmharic: "ግንኙነቶች",
    category: "RELATIONSHIPS",
    description: "Family, romantic relationships, friendships, and social connections.",
    descriptionAmharic: "ቤተሰብ፣ የፍቅር ግንኙነቶች፣ ወዳጅነት እና ማህበራዊ ትስስሮች።",
    sortOrder: 4
  },
  {
    name: "Stress Management",
    nameAmharic: "የጭንቀት አስተዳደር",
    category: "STRESS_MANAGEMENT",
    description: "Daily stress, overwhelm, and finding balance.",
    descriptionAmharic: "ዕለታዊ ጭንቀት፣ ከመጠን ያለፈ ሸክም እና ሚዛን ማግኘት።",
    isFeatured: true,
    sortOrder: 5
  },
  {
    name: "Spirituality & Faith",
    nameAmharic: "መንፈሳዊነት እና እምነት",
    category: "SPIRITUALITY",
    description: "Faith journeys, spiritual wellness, and community.",
    descriptionAmharic: "የእምነት ጉዞዎች፣ መንፈሳዊ ደህንነት እና ማህበረሰብ።",
    sortOrder: 6
  },
  {
    name: "Women's Wellness Circle",
    nameAmharic: "የሴቶች ጤንነት ክበብ",
    category: "WOMENS_HEALTH",
    isWomensCircle: true,
    isFeatured: true,
    description: "A safe, private space exclusively for women to discuss health, wellness, and life.",
    descriptionAmharic: "ጤና፣ ደህንነት እና ሕይወትን ለመወያየት ለሴቶች ብቻ ደህንነቱ የተጠበቀ ቦታ።",
    sortOrder: 0  // Always first
  }
];
```

## 21.2 Kuriftu Resort Initial Seed
```javascript
const kuriftu = {
  name: "Kuriftu Resort & Spa",
  nameAmharic: "ኩሪፍቱ ሪዞርት እና ስፓ",
  address: "Kuriftu Africa Village, Bishoftu, Ethiopia",
  city: "Bishoftu",
  isLaunchPartner: true,
  commissionRate: 0.10,  // 10% as launch partner rate
  tags: ["spa", "resort", "pool", "wellness", "retreat", "yoga"],
  services: [
    {
      name: "Full Body Massage",
      nameAmharic: "የሙሉ ሰውነት ማሳጅ",
      durationMinutes: 60,
      price: 1200,
      maxParticipants: 1
    },
    {
      name: "Couples Spa Package",
      nameAmharic: "የጥንዶች ስፓ ፓኬጅ",
      durationMinutes: 90,
      price: 2200,
      maxParticipants: 2
    },
    {
      name: "Day Retreat — Pool & Spa",
      nameAmharic: "የቀን ሪትሪት — ፑል እና ስፓ",
      durationMinutes: 480,
      price: 1800,
      maxParticipants: 1
    },
    {
      name: "Yoga & Meditation Session",
      nameAmharic: "ዮጋ እና ሜዲቴሽን ክፍለ ጊዜ",
      durationMinutes: 75,
      price: 800,
      maxParticipants: 8
    }
  ]
};
```

## 21.3 Background Jobs (Set Up on Deploy)
Use a job queue (Bull + Redis):

| Job | Schedule | What It Does |
|---|---|---|
| `subscription-expiry-reminder` | Every day at 9am ET | Sends reminder to users expiring in 3 days |
| `subscription-expire` | Every hour | Marks expired subscriptions, downgrades tier |
| `crisis-escalation-check` | Every 5 minutes | Checks open HIGH crises with no mod assigned for >25 min, auto-escalates |
| `b2b-report-publish` | Every day at midnight | Auto-publishes reports past their 7-day preview with <10 flags |
| `feed-cache-refresh` | Every 15 minutes | Refreshes home feed cache in Redis |
| `moderator-oncall-update` | Every 30 minutes | Updates `isOnDuty` for moderators based on shift hours |

---

# APPENDIX: DEMO FLOW (HACKATHON PRESENTATION)
> 4 minutes, one uninterrupted flow

1. **(0:00)** App opens → Amharic splash screen → "ሰላም ወደ ሰላም ዌልኔስ"
2. **(0:20)** Onboarding: Language selection (Amharic tapped) → consent screen (plain Amharic) → circle picker
3. **(0:50)** User joins "Career Anxiety" circle → sees live feed of posts
4. **(1:10)** User creates a new post: "ALX ፕሮጀክቶቼ ጭንቀት ውስጥ ጥለውኛል ☕" (anonymous toggle ON)
5. **(1:30)** NLP scans → no crisis → post goes LIVE → appears in feed with anonymous alias "Dawit from Addis"
6. **(1:50)** Another "user" reacts with 🤲 — reaction appears in real-time (WebSocket)
7. **(2:10)** Tap bottom nav → Booking → Kuriftu Resort card appears
8. **(2:25)** Tap Kuriftu → services list → "Full Body Massage — 1,200 ETB"
9. **(2:40)** Select date (July 15) → select 09:00 slot → booking summary screen
10. **(3:00)** Tap "Pay with Telebirr" → Telebirr QR/USSD screen appears
11. **(3:15)** Payment success screen → booking confirmed notification (push + in-app in Amharic)
12. **(3:30)** Navigate to profile → "My Data" section → shows consent status + opt-out option
13. **(3:50)** End on home screen with the tagline: **ሰ ላ ም — Peace. Health. Greeting.**

---
*End of Selam Wellness Master Technical Specification v1.0*
*Built for Ethiopia. Built for impact.*
