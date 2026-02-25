import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  async getActiveBanners() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async findAll() {
    return this.prisma.banner.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.banner.findUnique({ where: { id } });
  }

  async create(data: { title: string; imageUrl: string; link?: string; order?: number }) {
    return this.prisma.banner.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.banner.delete({ where: { id } });
    return { message: 'Banner eliminado' };
  }
}
