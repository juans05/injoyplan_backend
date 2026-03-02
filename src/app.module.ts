import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { PostsModule } from './posts/posts.module';
import { ChatModule } from './chat/chat.module';
import { LocationsModule } from './locations/locations.module';
import { FavoritesModule } from './favorites/favorites.module';
import { FriendshipsModule } from './friendships/friendships.module';
import { ComplaintsModule } from './complaints/complaints.module';
import { BannersModule } from './banners/banners.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { AdminModule } from './admin/admin.module';
import { ContactModule } from './contact/contact.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    EventsModule,
    PostsModule,
    ChatModule,
    LocationsModule,
    FavoritesModule,
    FriendshipsModule,
    ComplaintsModule,
    BannersModule,
    NewsletterModule,
    AdminModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

