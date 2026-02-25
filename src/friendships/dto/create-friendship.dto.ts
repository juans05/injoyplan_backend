import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateFriendshipDto {
  @ApiProperty({ description: 'ID del usuario a enviar solicitud' })
  @IsString()
  @IsNotEmpty()
  friendId: string;
}
