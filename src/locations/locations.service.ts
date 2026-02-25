import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) { }

  async getDepartments() {
    const locations = await this.prisma.location.findMany({
      select: { department: true },
      distinct: ['department'],
      orderBy: { department: 'asc' },
    });
    return locations.map((l) => l.department);
  }

  async getProvinces(department: string) {
    const locations = await this.prisma.location.findMany({
      where: { department },
      select: { province: true },
      distinct: ['province'],
      orderBy: { province: 'asc' },
    });
    return locations.map((l) => l.province);
  }

  async getDistricts(department: string, province: string) {
    const locations = await this.prisma.location.findMany({
      where: { department, province },
      select: { district: true },
      distinct: ['district'],
      orderBy: { district: 'asc' },
    });
    return locations.map((l) => l.district);
  }

  async createLocation(department: string, province: string, district: string) {
    return this.prisma.location.create({
      data: {
        department,
        province,
        district,
      },
    });
  }
}
