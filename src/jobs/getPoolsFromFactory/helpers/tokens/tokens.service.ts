import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tokens } from '../entities/entities/Tokens';
import { Repository, EntityManager } from 'typeorm';
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

  // Добавляем второй аргумент manager
  async create(tokenDto: CreateTokenDto, manager?: EntityManager) {
    // Если manager передан, берем репозитории из него.
    // Если нет — используем стандартные репозитории инжектированные NestJS.
    const tokenRepo = manager
      ? manager.getRepository(Tokens)
      : this.tokensRepository;
    const chainRepo = manager
      ? manager.getRepository(Chains)
      : this.chainsRepository;

    const existingToken = await tokenRepo.findOne({
      where: {
        address: tokenDto.address,
        chain: { chainId: tokenDto.chainId },
      },
    });

    if (existingToken) return existingToken;

    const chain = await chainRepo.findOne({
      where: { chainId: tokenDto.chainId },
    });

    if (!chain) throw new Error(`Chain с id ${tokenDto.chainId} не найден`);

    const token = tokenRepo.create({
      ...tokenDto,
      chain,
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
        chain: {
          chainId: true,
        },
      },
      order: {
        tokenId: 'DESC',
      },
    });
  }

  async findOne(id: number, manager?: EntityManager) {
    const repo = manager
      ? manager.getRepository(Tokens)
      : this.tokensRepository;

    const token = await repo.findOne({
      where: { tokenId: id },
      relations: ['chain'],
    });

    if (!token) {
      throw new Error(`Token with id ${id} not found`);
    }
    return token;
  }

  async findOneByAddress(tokenAddress: string, manager?: EntityManager) {
    const tokenRepo = manager
      ? manager.getRepository(Tokens)
      : this.tokensRepository;

    // ВАЖНО: Если используете QueryBuilder с динамическим менеджером:
    const query = manager
      ? manager.createQueryBuilder(Tokens, 'token')
      : tokenRepo.createQueryBuilder('token');

    const token = await query
      .leftJoinAndSelect('token.chain', 'chain')
      .where('LOWER(token.address) = LOWER(:address)', {
        address: tokenAddress,
      })
      .getOne();

    if (!token) throw new Error(`Token with address ${tokenAddress} not found`);
    return token;
  }
}
