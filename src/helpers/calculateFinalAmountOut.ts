/**
 * Расчет финального количества WETH после двух шагов обмена.
 *
 * @param amountInStep0 - Исходное количество WETH (3000000000000000)
 * @param amountOutStep0 - Полученные USDT на шаге 0 (9327672)
 * @param amountInStep1 - Необходимые USDT для получения amountInStep0 (9330171)
 */
export function calculateFinalAmountOut(
  amountInStep0: bigint,
  amountOutStep0: bigint,
  amountInStep1: bigint
): bigint {
  // Пропорция: (Полученный USDT на шаге 0 * Исходный WETH) / Котировка USDT на покупку этого WETH
  return (amountOutStep0 * amountInStep0) / amountInStep1;
}
