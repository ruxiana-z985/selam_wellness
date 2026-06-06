import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateBookingDto, CreateJournalDto, CreatePostDto, ReactToPostDto, SafetyCheckDto } from './wellness.dto';
import { WellnessService } from './wellness.service';

@Controller()
export class WellnessController {
  constructor(private readonly wellness: WellnessService) {}

  @Get('health')
  health() {
    return { ok: true, service: 'selam-wellness-api' };
  }

  @Get('home')
  home() {
    return this.wellness.home();
  }

  @Get('circles')
  circles() {
    return this.wellness.circles();
  }

  @Post('circles/:id/join')
  joinCircle(@Param('id') id: string) {
    return this.wellness.joinCircle(id);
  }

  @Get('circles/:id/feed')
  circleFeed(@Param('id') id: string) {
    return this.wellness.circleFeed(id);
  }

  @Post('posts')
  createPost(@Body() dto: CreatePostDto) {
    return this.wellness.createPost(dto);
  }

  @Post('posts/:id/reactions')
  reactToPost(@Param('id') id: string, @Body() dto: ReactToPostDto) {
    return this.wellness.reactToPost(id, dto);
  }

  @Get('women/cycle')
  cycle(@Query('day') day?: string) {
    return this.wellness.cycle(Number(day) || 8);
  }

  @Get('wellness/library')
  library() {
    return this.wellness.library();
  }

  @Get('practitioners')
  practitioners() {
    return this.wellness.practitioners();
  }

  @Get('retreats')
  retreats() {
    return this.wellness.retreats();
  }

  @Get('retreats/:id')
  retreat(@Param('id') id: string) {
    return this.wellness.retreat(id);
  }

  @Post('bookings')
  createBooking(@Body() dto: CreateBookingDto) {
    return this.wellness.createBooking(dto);
  }

  @Post('journal')
  journal(@Body() dto: CreateJournalDto) {
    return this.wellness.createJournal(dto);
  }

  @Post('safety/check')
  safety(@Body() dto: SafetyCheckDto) {
    return this.wellness.safety(dto.content);
  }

  @Get('revenue')
  revenue() {
    return this.wellness.revenue();
  }
}
