import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) { }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post()
  @ApiOperation({ summary: 'Crear publicación' })
  create(@GetUser('id') userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Get('feed')
  @ApiOperation({ summary: 'Feed de publicaciones' })
  feed(
    @GetUser('id') userId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.postsService.feed(userId, page, limit);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener publicación' })
  findOne(@Param('id') id: string, @GetUser('id') userId?: string) {
    return this.postsService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar publicación' })
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.remove(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post(':id/like')
  @ApiOperation({ summary: 'Dar like/me encanta' })
  like(@GetUser('id') userId: string, @Param('id') postId: string) {
    return this.postsService.like(userId, postId, 'LIKE');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Post(':id/love')
  @ApiOperation({ summary: 'Dar me encanta' })
  love(@GetUser('id') userId: string, @Param('id') postId: string) {
    return this.postsService.like(userId, postId, 'LOVE');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @Delete(':id/unlike')
  @ApiOperation({ summary: 'Quitar reacción' })
  unlike(@GetUser('id') userId: string, @Param('id') postId: string) {
    return this.postsService.unlike(userId, postId);
  }

  @Public()
  @Get(':id/likes')
  @ApiOperation({ summary: 'Listar reacciones' })
  likes(@Param('id') postId: string) {
    return this.postsService.likes(postId);
  }
}
