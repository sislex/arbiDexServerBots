import { Injectable } from '@nestjs/common';
import { PoolDto, UpdateReservesDto } from '../dtos/pools-dto/pool.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, EntityManager } from 'typeorm';
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

  async create(poolDto: PoolDto, chainId: number, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Pools) : this.poolRepository;

    const pool = repo.create({
      poolAddress: poolDto.poolAddress,
      fee: poolDto.fee,
      version: poolDto.version,
      chain: { chainId: poolDto.chainId },
      token0: { tokenId: poolDto.token0 },
      token1: { tokenId: poolDto.token1 },
      dex: { dexId: poolDto.dexId },
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

  async updateReserves(reserves: UpdateReservesDto[], manager?: EntityManager) {
    if (!reserves.length) return;
    const repo = manager ? manager.getRepository(Pools) : this.poolRepository;

    const chunkSize = 500;
    for (let i = 0; i < reserves.length; i += chunkSize) {
      const chunk = reserves.slice(i, i + chunkSize);

      const pools = await repo.find({
        where: chunk.map((r) => ({
          poolAddress: r.address,
          chain: { chainId: r.chainId },
        })),
        relations: ['token0', 'token1', 'chain'],
      });

      const poolsMap = new Map<string, Pools>();
      pools.forEach((p) =>
        poolsMap.set(`${p.poolAddress}-${p.chain.chainId}`, p),
      );

      const toUpdate: Pools[] = [];

      for (const dto of chunk) {
        const key = `${dto.address}-${dto.chainId}`;
        const pool = poolsMap.get(key);
        if (!pool) continue;

        const token0 = await this.tokensService.findOneByAddress(
          dto.token0,
          dto.chainId,
          manager,
        );
        const token1 = await this.tokensService.findOneByAddress(
          dto.token1,
          dto.chainId,
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
        toUpdate.push(pool);
      }

      if (toUpdate.length > 0) {
        await repo.save(toUpdate);
      }
    }
  }

  async findEmptyReserves(
    version: string,
    limit: number = 1000,
    manager?: EntityManager,
  ) {
    const repo = manager ? manager.getRepository(Pools) : this.poolRepository;

    return await repo.find({
      where: [
        { version: version, reserve0: IsNull() },
        { version: version, reserve1: IsNull() },
      ],
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
      take: limit,
    });
  }
}
