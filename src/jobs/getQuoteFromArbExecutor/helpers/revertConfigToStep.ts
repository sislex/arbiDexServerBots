import {Address, IContractStep, SwapKind} from '../../../store/state.types';

export const revertConfigToStep = (step: IContractStep): IContractStep => {
  let path: Address[]  = [];
  if(step.kind === SwapKind.V2_EXACT_IN) {
    path = [step.path[1], step.path[0]];
  }

  return {
    ...step,
    path,
    tokenIn: step.tokenOut,
    tokenOut: step.tokenIn,
  };
};
