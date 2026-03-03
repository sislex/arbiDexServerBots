import {ArbResult, IQuote} from '../../../store/state.types';

export function mapArbResult(r: any, pairsToQuote: IQuote[]): ArbResult {
  const buyIdx  = Number(r.buyIndex  ?? r.buyPoolIndex  ?? 0);
  const sellIdx = Number(r.sellIndex ?? r.sellPoolIndex ?? 0);
  const buyP  = pairsToQuote[buyIdx];
  const sellP = pairsToQuote[sellIdx];
  return {
    buyIndex:  buyIdx,
    sellIndex: sellIdx,
    buyPair:  buyP  ? `${buyP.dex}-${buyP.version}`  : undefined,
    sellPair: sellP ? `${sellP.dex}-${sellP.version}` : undefined,
    profit:        r.profit.toString(),
    buyAmountOut:  r.buyAmountOut.toString(),
    sellAmountOut: r.sellAmountOut.toString(),
    gasUsed:       r.gasUsed.toString(),
    success:       r.success,
  };
}
