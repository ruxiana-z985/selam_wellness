import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, CreateJournalDto, CreatePostDto, ReactToPostDto } from './wellness.dto';
import {
  circles,
  cycleInsight,
  demoUser,
  experiences,
  practitioners,
  revenueModel,
  safetyCheck,
  wellnessLibrary,
} from './demo-data';
import {
  addSessionPost,
  getJoinedCircleIds,
  getSessionPosts,
  joinSessionCircle,
  reactToSessionPost,
} from './session-store';

@Injectable()
export class WellnessService {
  constructor(private readonly prisma: PrismaService) {}

  async home() {
    const whispers = getSessionPosts().slice(0, 3);
    return {
      greeting: `Good Morning ${demoUser.name}`,
      hero: {
        title: 'Your circle has missed you.',
        subtitle: 'A calm place for belonging, wisdom, and real-world healing.',
        recommendation: 'Try Coffee Ceremony Breathing before your first task.',
      },
      cycle: cycleInsight(8),
      whispers,
      practitioner: practitioners[0],
      content: wellnessLibrary,
      pillars: ['Community Circles', "Women's Haven", 'Wellness Library', 'Retreats & Experiences'],
      featuredExperience: experiences.find((item) => item.featured) ?? experiences[0],
      revenue: revenueModel,
    };
  }

  async circles() {
    const dbCircles = await this.safeDb(() => this.prisma.circle.findMany({ orderBy: { members: 'desc' } }), circles);
    const joined = getJoinedCircleIds();
    return dbCircles.map((circle) => ({
      ...circle,
      joined: joined.includes(circle.id),
    }));
  }

  async joinCircle(id: string) {
    const joined = joinSessionCircle(id);
    if (!joined) {
      throw new NotFoundException('Circle not found');
    }

    if (process.env.DATABASE_URL) {
      await this.safeDb(
        async () => {
          const user = await this.prisma.user.findUnique({ where: { email: demoUser.email } });
          if (user) {
            await this.prisma.circleMember.upsert({
              where: { userId_circleId: { userId: user.id, circleId: id } },
              update: {},
              create: { userId: user.id, circleId: id },
            });
            await this.prisma.circle.update({
              where: { id },
              data: { members: { increment: 1 } },
            });
          }
        },
        null,
      );
    }

    return {
      ...joined,
      message: 'Welcome in. Your Selam circle is ready.',
    };
  }

  async circleFeed(id: string) {
    const circle = circles.find((item) => item.id === id);
    if (!circle) {
      throw new NotFoundException('Circle not found');
    }
    return {
      circle: { ...circle, joined: getJoinedCircleIds().includes(id) },
      tabs: ['Posts', 'Events', 'Resources', 'Members'],
      events: [
        { title: 'Sunday courage check-in', when: 'Every Sunday, 7 PM', host: 'Circle moderators' },
        { title: 'Coffee ceremony calm', when: 'Next Saturday', host: 'Selam facilitators' },
      ],
      resources: [
        { title: 'Circle guidelines', type: 'PDF', description: 'How we hold space without shame.' },
        { title: 'Crisis support pathways', type: 'Guide', description: 'When and how to reach clinical help.' },
      ],
      members: Math.min(circle.members, 12),
      posts: getSessionPosts(id),
    };
  }

  async createPost(dto: CreatePostDto) {
    const check = safetyCheck(dto.content);
    const circle = circles.find((item) => item.id === dto.circleId);
    const newPost = {
      id: `post-${Date.now()}`,
      circleId: dto.circleId,
      author: dto.anonymous ? 'Anonymous' : demoUser.name,
      avatarUrl: dto.anonymous ? '' : demoUser.avatarUrl,
      content: dto.content,
      time: 'now',
      reactions: { RELATE: 0, ENCOURAGED: 0, THANK_YOU: 0, INSPIRED: 0 },
      comments: 0,
      anonymous: dto.anonymous ?? false,
      pending: !check.safeToPost,
    };

    if (check.safeToPost) {
      addSessionPost(newPost);
    }

    if (process.env.DATABASE_URL && check.safeToPost) {
      await this.safeDb(
        () =>
          this.prisma.post.create({
            data: {
              circleId: dto.circleId,
              content: dto.content,
              anonymous: dto.anonymous ?? false,
              safetyScore: check.score,
            },
          }),
        null,
      );
    }

    return {
      ...newPost,
      circle: circle?.name,
      safety: check,
      createdAt: new Date().toISOString(),
    };
  }

  async reactToPost(id: string, dto: ReactToPostDto) {
    const result = reactToSessionPost(id, dto.type);
    return {
      ...result,
      message: 'Reaction received without negativity.',
    };
  }

  async cycle(day: number) {
    return cycleInsight(day);
  }

  async library() {
    return this.safeDb(() => this.prisma.wellnessContent.findMany({ orderBy: { title: 'asc' } }), wellnessLibrary);
  }

  async practitioners() {
    return this.safeDb(() => this.prisma.practitioner.findMany({ orderBy: { rating: 'desc' } }), practitioners);
  }

  async retreats() {
    const dbRetreats = await this.safeDb(
      () => this.prisma.experience.findMany({ orderBy: { price: 'asc' } }),
      experiences,
    );
    return dbRetreats;
  }

  async retreat(id: string) {
    const retreat = experiences.find((item) => item.id === id);
    if (!retreat) {
      throw new NotFoundException('Experience not found');
    }
    return retreat;
  }

  async createBooking(dto: CreateBookingDto) {
    const experience = experiences.find((item) => item.id === dto.experienceId);
    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    const commission = Math.round(experience.price * 0.12);
    const booking = {
      id: `booking-${Date.now()}`,
      status: 'CONFIRMED' as const,
      experience,
      ...dto,
      total: experience.price * dto.guests,
      commission,
      message: 'Your healing experience is reserved.',
      paymentRef: `TB-${Date.now().toString(36).toUpperCase()}`,
    };

    if (process.env.DATABASE_URL) {
      await this.safeDb(
        () =>
          this.prisma.booking.create({
            data: {
              experienceId: dto.experienceId,
              date: dto.date,
              guests: dto.guests,
              payment: dto.payment,
              status: 'CONFIRMED',
            },
          }),
        null,
      );
    }

    return booking;
  }

  async createJournal(dto: CreateJournalDto) {
    const entry = {
      id: `journal-${Date.now()}`,
      ...dto,
      insight: 'You are building a private map of your peace.',
      createdAt: new Date().toISOString(),
    };

    if (process.env.DATABASE_URL) {
      await this.safeDb(() => this.prisma.journalEntry.create({ data: dto }), null);
    }

    return entry;
  }

  async safety(content: string) {
    return safetyCheck(content);
  }

  async revenue() {
    return revenueModel;
  }

  private async safeDb<DbResult, Fallback>(
    operation: () => Promise<DbResult>,
    fallback: Fallback,
  ): Promise<DbResult | Fallback> {
    if (!process.env.DATABASE_URL) {
      return fallback;
    }

    try {
      return await operation();
    } catch {
      return fallback;
    }
  }
}
