export interface Limit {
  code: string;
  price: number;
  min_amount: number;
  max_amount: number;
  max_bondless_amount: number;
}

export type LimitList = Record<string, Limit>;

export default Limit;
