import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tokens } from '../entities/entities/Tokens';
import { Repository } from 'typeorm';
import { CreateTokenDto } from '../dtos/token-dto/token.dto';
import { Chains } from '../entities/entities/Chains';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Tokens)
    private tokensRepository: Repository<Tokens>,
    @InjectRepository(Chains)
    private chainsRepository: Repository<Chains>,
  ) {}

  async create(tokenDto: CreateTokenDto) {
    const existingToken = await this.tokensRepository.findOne({
      where: {
        address: tokenDto.address,
        chain: {
          chainId: tokenDto.chainId,
        },
      },
    });

    if (existingToken) {
      return existingToken;
    }

    const chain = await this.chainsRepository.findOne({
      where: { chainId: tokenDto.chainId },
    });

    if (!chain) throw new Error(`Chain с id ${tokenDto.chainId} не найден`);

    const token = this.tokensRepository.create({
      address: tokenDto.address,
      symbol: tokenDto.symbol,
      tokenName: tokenDto.tokenName,
      decimals: +tokenDto.decimals,
      chain,
      isActive: null,
      isChecked: null,
      balance: null,
    });

    return await this.tokensRepository.save(token);
  }

  async findAll() {
    return await this.tokensRepository.find({
      relations: {
        chain: true,
      },
      select: {
        chain: {
          chainId: true,
        },
      },
      order: {
        tokenId: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const token = await this.tokensRepository.findOne({
      where: { tokenId: id },
      relations: ['chain'],
    });

    if (!token) {
      throw new Error(`Token with id ${id} not found`);
    }
    return token;
  }

  async findOneByAddress(tokenAddress: string) {
    const token = await this.tokensRepository
      .createQueryBuilder('token')
      .leftJoinAndSelect('token.chain', 'chain')
      .where('LOWER(token.address) = LOWER(:address)', {
        address: tokenAddress,
      })
      .getOne();

    if (!token) {
      throw new Error(`Token with address ${tokenAddress} not found`);
    }
    return token;
  }
}
