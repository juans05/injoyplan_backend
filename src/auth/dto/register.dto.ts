import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, IsOptional, IsBoolean, IsDateString } from 'class-validator';

export enum UserType {
  NORMAL = 'NORMAL',
  COMPANY = 'COMPANY',
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ enum: UserType, example: UserType.NORMAL, default: UserType.NORMAL })
  @IsEnum(UserType)
  @IsOptional()
  userType?: UserType;

  // Profile fields (optional)
  @ApiPropertyOptional({ example: 'Juan' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @IsString()
  @IsOptional()
  apellido?: string;

  @ApiPropertyOptional({ example: 'M' })
  @IsString()
  @IsOptional()
  genero?: string;

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsDateString()
  @IsOptional()
  f_nacimiento?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  imagenPerfil?: string;

  // Terms and conditions (required for registration)
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  terminoCondiciones?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  politica?: boolean;
}
