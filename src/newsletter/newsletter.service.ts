import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(email: string) {
    const existing = await this.prisma.newsletter.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email ya registrado');
    }
    await this.prisma.newsletter.create({ data: { email } });
    return { message: 'Suscripción exitosa' };
  }
}
