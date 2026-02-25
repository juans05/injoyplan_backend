import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@ApiTags('Admin')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    // Dashboard
    @Get('stats')
    @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
    getStats() {
        return this.adminService.getStats();
    }

    // Users Management
    @Get('users')
    @ApiOperation({ summary: 'Listar usuarios' })
    getUsers(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
    ) {
        return this.adminService.getUsers(
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            search,
        );
    }

    @Patch('users/:id/role')
    @ApiOperation({ summary: 'Actualizar rol de usuario' })
    updateUserRole(
        @Param('id') id: string,
        @Body() body: { role: 'USER' | 'ADMIN' },
    ) {
        return this.adminService.updateUserRole(id, body.role);
    }

    // Banners Management
    @Get('banners')
    @ApiOperation({ summary: 'Listar banners' })
    getBanners() {
        return this.adminService.getBanners();
    }

    @Post('banners')
    @ApiOperation({ summary: 'Crear banner' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    createBanner(
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.adminService.createBanner(body, file);
    }

    @Patch('banners/:id')
    @ApiOperation({ summary: 'Actualizar banner' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    updateBanner(
        @Param('id') id: string,
        @Body() body: any,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.adminService.updateBanner(id, body, file);
    }

    @Delete('banners/:id')
    @ApiOperation({ summary: 'Eliminar banner' })
    deleteBanner(@Param('id') id: string) {
        return this.adminService.deleteBanner(id);
    }

    @Post('banners/reorder')
    @ApiOperation({ summary: 'Reordenar banners' })
    reorderBanners(@Body() body: { bannerIds: string[] }) {
        return this.adminService.reorderBanners(body.bannerIds);
    }

    // Events Management
    @Post('events/import')
    @ApiOperation({ summary: 'Importar eventos desde Excel/CSV' })
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    importEvents(@UploadedFile() file: Express.Multer.File) {
        return this.adminService.importEventsFromFile(file);
    }
}
