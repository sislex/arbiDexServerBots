import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tokens } from '../entities/entities';
import { Repository, EntityManager, In, Raw } from 'typeorm';
import { CreateTokenDto } from '../dtos/token-dto/token.dto';
import { Chains } from '../entities/entities';

@Injectable()
export class TokensService {
  constructor(
    @InjectRepository(Tokens)
    private tokensRepository: Repository<Tokens>,
    @InjectRepository(Chains)
    private chainsRepository: Repository<Chains>,
  ) {}

  async create(tokenDto: CreateTokenDto, manager?: EntityManager) {
    const tokenRepo = manager
      ? manager.getRepository(Tokens)
      : this.tokensRepository;

    const existingToken = await tokenRepo.findOne({
      where: {
        address: tokenDto.address,
        chain: { chainId: tokenDto.chainId },
      },
    });

    if (existingToken) return existingToken;

    const token = tokenRepo.create({
      ...tokenDto,
      chain: { chainId: tokenDto.chainId }, // Передаем ID как объект
      decimals: +tokenDto.decimals,
    });

    return await tokenRepo.save(token);
  }

  async findAll(manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Tokens)
      : this.tokensRepository;

    return await repo.find({
      relations: {
        chain: true,
      },
      select: {
        tokenId: true,
        address: true,
        symbol: true,
        decimals: true,
        chain: {
          chainId: true,
        },
      },
      order: {
        tokenId: 'DESC',
      },
    });
  }

  async findOneByAddress(
    tokenAddress: string,
    chainId: number,
    manager?: EntityManager,
  ) {
    const repo = manager
      ? manager.getRepository(Tokens)
      : this.tokensRepository;

    const token = await repo.findOne({
      where: {
        address: Raw((alias) => `LOWER(${alias}) = LOWER(:address)`, {
          address: tokenAddress,
        }),
        chain: { chainId: chainId },
      },
      relations: ['chain'],
    });

    if (!token) throw new Error(`Token ${tokenAddress} not found`);
    return token;
  }

  async findExistingByAddresses(
    addresses: string[],
    chainId: number,
    manager?: EntityManager,
  ): Promise<string[]> {
    const repo = manager
      ? manager.getRepository(Tokens)
      : this.tokensRepository;

    const normalizedAddresses = addresses.map((addr) => addr.toLowerCase());

    const existing = await repo.find({
      where: {
        address: In(normalizedAddresses),
        chain: { chainId: chainId },
      },
      select: ['address'],
    });

    return existing.map((t) => t.address.toLowerCase());
  }
}
