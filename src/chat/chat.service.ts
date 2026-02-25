import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) { }

  private sanitizeUser<T extends { password?: any }>(user: T): Omit<T, 'password'> {
    if (!user) return user as any;
    const { password, ...rest } = user as any;
    return rest;
  }

  private sanitizeRoom(room: any) {
    if (!room) return room;

    const participants = Array.isArray(room.participants)
      ? room.participants.map((p: any) => ({
        ...p,
        user: p?.user ? this.sanitizeUser(p.user) : p?.user,
      }))
      : room.participants;

    const messages = Array.isArray(room.messages)
      ? room.messages.map((m: any) => ({
        ...m,
        sender: m?.sender ? this.sanitizeUser(m.sender) : m?.sender,
      }))
      : room.messages;

    return { ...room, participants, messages };
  }

  async createRoom(
    userId: string,
    dto: { type: 'INDIVIDUAL' | 'GROUP'; name?: string; participantIds?: string[] },
  ) {
    if (dto.type === 'INDIVIDUAL') {
      const otherId = dto.participantIds?.[0];
      if (!otherId) throw new BadRequestException('participantIds[0] es requerido');
      if (otherId === userId) throw new BadRequestException('No puedes crear chat contigo mismo');

      // Mutual follow check removed as requested
      // The user wants anyone to be able to message anyone.


      // Check if room exists with both participants
      const existing = await this.prisma.chatRoom.findFirst({
        where: {
          type: 'INDIVIDUAL',
          AND: [
            { participants: { some: { userId } } },
            { participants: { some: { userId: otherId } } },
          ],
        },
      });

      const roomId = existing?.id;
      if (roomId) {
        const room = await this.prisma.chatRoom.findUnique({
          where: { id: roomId },
          include: {
            participants: { include: { user: { include: { profile: true } } } },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
              include: { sender: { include: { profile: true } } },
            },
          },
        });
        return this.sanitizeRoom(room);
      }

      const created = await this.prisma.chatRoom.create({
        data: {
          type: 'INDIVIDUAL',
          participants: {
            createMany: {
              data: [{ userId }, { userId: otherId }],
            },
          },
        },
      });

      const room = await this.prisma.chatRoom.findUnique({
        where: { id: created.id },
        include: {
          participants: { include: { user: { include: { profile: true } } } },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: { sender: { include: { profile: true } } },
          },
        },
      });
      return this.sanitizeRoom(room);
    }

    const participantIds = Array.from(new Set([userId, ...(dto.participantIds ?? [])]));

    const created = await this.prisma.chatRoom.create({
      data: {
        type: 'GROUP',
        name: dto.name ?? 'Grupo',
        participants: {
          createMany: {
            data: participantIds.map((id) => ({ userId: id })),
          },
        },
      },
    });

    const room = await this.prisma.chatRoom.findUnique({
      where: { id: created.id },
      include: {
        participants: { include: { user: { include: { profile: true } } } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { sender: { include: { profile: true } } },
        },
      },
    });

    return this.sanitizeRoom(room);
  }

  async myRooms(userId: string) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: { participants: { some: { userId } } },
      include: {
        participants: { include: { user: { include: { profile: true } } } },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { sender: { include: { profile: true } } },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Deduplicate INDIVIDUAL rooms: keep the one with most recent message or update
    const uniqueRooms: typeof rooms = [];
    const seenPartners = new Set();

    for (const room of rooms) {
      if (room.type === 'INDIVIDUAL') {
        const other = room.participants.find((p) => p.userId !== userId);
        const otherId = other?.userId;
        if (otherId) {
          if (seenPartners.has(otherId)) continue;
          seenPartners.add(otherId);
        }
      }
      uniqueRooms.push(room);
    }

    return uniqueRooms.map((r) => this.sanitizeRoom(r));
  }

  async sendMessage(userId: string, roomId: string, content: string) {
    const room = await this.prisma.chatRoom.findUnique({
      where: { id: roomId },
      include: { participants: true },
    });
    if (!room) throw new NotFoundException('Sala no encontrada');
    const isParticipant = room.participants.some((p) => p.userId === userId);
    if (!isParticipant) throw new ForbiddenException('No eres participante de la sala');

    const msg = await this.prisma.message.create({
      data: { chatRoomId: roomId, senderId: userId, content },
      include: { sender: { include: { profile: true } } },
    });

    await this.prisma.chatRoom.update({ where: { id: roomId }, data: { updatedAt: new Date() } });
    return { ...msg, sender: msg.sender ? this.sanitizeUser(msg.sender) : msg.sender };
  }

  async getMessages(roomId: string) {
    const msgs = await this.prisma.message.findMany({
      where: { chatRoomId: roomId },
      orderBy: { createdAt: 'asc' },
      include: { sender: { include: { profile: true } } },
    });

    return msgs.map((m) => ({
      ...m,
      sender: m.sender ? this.sanitizeUser(m.sender) : m.sender,
    }));
  }

  async contacts(userId: string) {
    const [following, followers] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      }),
      this.prisma.follow.findMany({
        where: { followingId: userId },
        select: { followerId: true },
      }),
    ]);

    const followingSet = new Set(following.map((f) => f.followingId));
    const mutualIds = followers
      .map((f) => f.followerId)
      .filter((id) => followingSet.has(id));

    if (mutualIds.length === 0) return [];

    const users = await this.prisma.user.findMany({
      where: { id: { in: mutualIds } },
      include: { profile: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => {
      const { password, ...rest } = u;
      return rest;
    });
  }
}
