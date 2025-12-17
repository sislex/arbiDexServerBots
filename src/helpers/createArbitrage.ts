export interface IArbitrage {
  createdAt: string;      // UTC ISO string
  [key: string]: any;
}

export function createArbitrage(params: any): IArbitrage {
  return {
    createdAt: new Date().toISOString(),
    ...params
  };
}
