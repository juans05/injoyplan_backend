import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { Public } from './decorators/public.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Post('register')
    @ApiOperation({ summary: 'Registrar nuevo usuario' })
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Public()
    @Post('verify-code')
    @ApiOperation({ summary: 'Verificar código de email' })
    verifyCode(@Body() body: { email: string; code: string }) {
        return this.authService.verifyCode(body.email, body.code);
    }

    @Public()
    @Post('verify-email')
    @ApiOperation({ summary: 'Verificar email (Legacy Link)' })
    verifyEmail(@Query('token') token: string) {
        return this.authService.verifyEmail(token);
    }

    @Public()
    @Post('forgot-password')
    @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
    forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }

    @Public()
    @Post('reset-password')
    @ApiOperation({ summary: 'Restablecer contraseña' })
    resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Get('refresh')
    @ApiOperation({ summary: 'Refrescar token' })
    refreshToken(@GetUser('id') userId: string) {
        return this.authService.refreshToken(userId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Get('me')
    @ApiOperation({ summary: 'Obtener usuario actual' })
    getMe(@GetUser('id') userId: string) {
        return this.authService.getMe(userId);
    }
}
