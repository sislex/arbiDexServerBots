// src/discovery/dto/api-endpoint.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class ApiEndpointDto {
  @ApiProperty({ example: 'GET' })
  method!: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  @ApiProperty({ example: '/api/users' })
  path!: string;

  @ApiProperty({ example: 'List users' })
  description!: string;

  @ApiProperty({ example: ['users', 'admin'], required: false, isArray: true })
  tags?: string[];

  @ApiProperty({ example: 'v1', required: false })
  version?: string;
}
