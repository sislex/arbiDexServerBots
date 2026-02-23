import { Injectable } from '@nestjs/common';
import { PoolDto, UpdateReservesDto } from '../dtos/pools-dto/pool.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, EntityManager } from 'typeorm';
import { Pools } from '../entities/entities';
import { TokensService } from '../tokens/tokens.service';
import { ChainsService } from '../chains/chains.service';
import { DexesService } from '../dexes/dexes.service';

@Injectable()
export class PoolsService {
  constructor(
    @InjectRepository(Pools)
    private poolRepository: Repository<Pools>,
    private tokensService: TokensService,
    private chainsService: ChainsService,
    private dexesService: DexesService,
  ) {}

  async create(poolDto: PoolDto, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Pools) : this.poolRepository;

    const chain = await this.chainsService.findOne(poolDto.chainId, manager);
    const token0 = await this.tokensService.findOne(poolDto.token0, manager);
    const token1 = await this.tokensService.findOne(poolDto.token1, manager);
    const dex = await this.dexesService.findOne(poolDto.dexId, manager);

    const pool = repo.create({
      chain,
      token0,
      token1,
      dex,
      version: poolDto.version,
      fee: poolDto.fee,
      poolAddress: poolDto.poolAddress,
    });

    return await repo.save(pool);
  }

  async findAll(manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Pools) : this.poolRepository;

    return await repo.find({
      relations: {
        chain: true,
        dex: true,
        token0: true,
        token1: true,
      },
      select: {
        poolId: true,
        poolAddress: true,
        reserve0: true,
        reserve1: true,
        version: true,
        fee: true,
        chain: { chainId: true },
        dex: { dexId: true },
        token0: { tokenId: true },
        token1: { tokenId: true },
      },
      order: {
        poolId: 'DESC',
      },
    });
  }

  async findOldestReserves(
    version: string,
    limit: number = 1000,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Pools) : this.poolRepository;

    return await repo.find({
      where: {
        version: version,
      },
      relations: {
        chain: true,
        dex: true,
        token0: true,
        token1: true,
      },
      select: {
        poolId: true,
        poolAddress: true,
        reserve0: true,
        reserve1: true,
        version: true,
        fee: true,
        reserves_updated_at: true,
        chain: { chainId: true },
        dex: { dexId: true },
        token0: { tokenId: true },
        token1: { tokenId: true },
      },
      order: {
        reserves_updated_at: 'ASC',
      },
      take: limit,
    });
  }

  async findOne(id: number, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Pools) : this.poolRepository;

    const item = await repo.findOne({
      where: { poolId: id },
      relations: ['token0', 'token1', 'chain', 'dex'],
    });
    if (!item) {
      throw new Error(`Pool with id ${id} not found`);
    }
    return item;
  }

  async updateReserves(reserves: UpdateReservesDto[], manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Pools) : this.poolRepository;

    const poolsMap = new Map<string, Pools>();
    const poolAddresses = reserves.map((r) => r.address);

    const pools = await repo.find({
      where: { poolAddress: In(poolAddresses) },
      relations: ['token0', 'token1'],
    });

    pools.forEach((pool) => poolsMap.set(pool.poolAddress!, pool));

    for (const dto of reserves) {
      const pool = poolsMap.get(dto.address);
      if (!pool) continue;

      const token0 = await this.tokensService.findOneByAddress(
        dto.token0,
        manager,
      );
      const token1 = await this.tokensService.findOneByAddress(
        dto.token1,
        manager,
      );

      if (!token0 || !token1) continue;

      if (
        pool.token0.tokenId === token0.tokenId &&
        pool.token1.tokenId === token1.tokenId
      ) {
        pool.reserve0 = dto.reserve0;
        pool.reserve1 = dto.reserve1;
      } else {
        pool.reserve0 = dto.reserve1;
        pool.reserve1 = dto.reserve0;
      }

      pool.reserves_updated_at = new Date();
    }

    const updatedPools = await repo.save(Array.from(poolsMap.values()));
    // console.log(`Total pools updated: ${updatedPools.length}`);
    return updatedPools;
  }
}
