import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('rooms')
  @ApiOperation({ summary: 'Crear sala de chat (individual o grupal)' })
  createRoom(
    @GetUser('id') userId: string,
    @Body() dto: { type: 'INDIVIDUAL' | 'GROUP'; name?: string; participantIds?: string[]; },
  ) {
    return this.chatService.createRoom(userId, dto);
  }

  @Get('rooms')
  @ApiOperation({ summary: 'Listar mis salas de chat' })
  myRooms(@GetUser('id') userId: string) {
    return this.chatService.myRooms(userId);
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Listar contactos (seguimiento mutuo) para chatear' })
  contacts(@GetUser('id') userId: string) {
    return this.chatService.contacts(userId);
  }

  @Post('rooms/:id/messages')
  @ApiOperation({ summary: 'Enviar mensaje a una sala' })
  sendMessage(
    @GetUser('id') userId: string,
    @Param('id') roomId: string,
    @Body() dto: { content: string },
  ) {
    return this.chatService.sendMessage(userId, roomId, dto.content);
  }

  @Get('rooms/:id/messages')
  @ApiOperation({ summary: 'Listar mensajes de una sala' })
  getMessages(@Param('id') roomId: string) {
    return this.chatService.getMessages(roomId);
  }
}
