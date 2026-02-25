import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }

  private sanitizeUser<T extends { password?: any }>(user: T): Omit<T, 'password'> {
    if (!user) return user as any;
    const { password, ...rest } = user as any;
    return rest;
  }

  async create(userId: string, dto: CreatePostDto) {
    if (!dto.content && !dto.imageUrl) {
      throw new BadRequestException('Content o imageUrl requerido');
    }

    return this.prisma.post.create({
      data: {
        userId,
        content: dto.content ?? '',
        imageUrl: dto.imageUrl,
      },
    });
  }

  async feed(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          OR: [{ userId }, { userId: { in: followingIds } }],
        },
        include: {
          user: { include: { profile: true } },
          likes: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({
        where: {
          OR: [{ userId }, { userId: { in: followingIds } }],
        },
      }),
    ]);

    return {
      data: data.map((p: any) => ({
        ...p,
        user: p.user ? this.sanitizeUser(p.user) : p.user,
        isLiked: userId ? p.likes.some((l: any) => l.userId === userId && l.type === 'LIKE') : false,
        isLoved: userId ? p.likes.some((l: any) => l.userId === userId && l.type === 'LOVE') : false,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { user: { include: { profile: true } }, likes: true },
    });
    if (!post) throw new NotFoundException('Publicación no encontrada');

    return {
      ...post,
      user: post.user ? this.sanitizeUser(post.user) : post.user,
      isLiked: userId ? post.likes.some((l: any) => l.userId === userId && l.type === 'LIKE') : false,
      isLoved: userId ? post.likes.some((l: any) => l.userId === userId && l.type === 'LOVE') : false,
    };
  }

  async remove(userId: string, id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Publicación no encontrada');
    if (post.userId !== userId) throw new ForbiddenException('No autorizado');

    await this.prisma.post.delete({ where: { id } });
    return { message: 'Publicación eliminada' };
  }

  async like(userId: string, postId: string, type: 'LIKE' | 'LOVE' = 'LIKE') {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Publicación no encontrada');

    await this.prisma.postLike.upsert({
      where: { userId_postId: { userId, postId } },
      update: { type },
      create: { userId, postId, type },
    });

    return { message: 'Reacción registrada' };
  }

  async unlike(userId: string, postId: string) {
    const existing = await this.prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } },
    });
    if (!existing) throw new NotFoundException('No hay reacción para eliminar');

    await this.prisma.postLike.delete({ where: { id: existing.id } });
    return { message: 'Reacción eliminada' };
  }

  async likes(postId: string) {
    const likes = await this.prisma.postLike.findMany({
      where: { postId },
      include: { user: { include: { profile: true } } },
    });

    return likes.map((l: any) => ({
      ...l,
      user: l.user ? this.sanitizeUser(l.user) : l.user,
    }));
  }
}
