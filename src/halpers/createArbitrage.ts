export interface IArbitrage {
  createdAt: string;      // UTC ISO string
  details: any;
}

export function createArbitrage(params: {
  details: any;
}): IArbitrage {
  return {
    createdAt: new Date().toISOString(),
    details: params.details,
  };
}
