import { PartialType } from '@nestjs/mapped-types';
import { CreateSwapRateDto } from './create-swap-rate.dto';

export class UpdateSwapRateDto extends PartialType(CreateSwapRateDto) {}
