import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AddUserDto {
  @ApiProperty({ example: 123 })
  id?: string;

  @ApiProperty({ example: 'nat' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'nat@email.com' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'natchen' })
  @IsNotEmpty()
  username: string;
}
