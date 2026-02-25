import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadService } from '../users/upload.service';

@Module({
    imports: [PrismaModule],
    controllers: [AdminController],
    providers: [AdminService, UploadService],
    exports: [AdminService],
})
export class AdminModule { }
