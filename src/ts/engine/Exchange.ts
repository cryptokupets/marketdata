import { Hitbtc } from '../exchange/hitbtc';

const exchanges = {
  hitbtc: new Hitbtc()
};

export interface IExchange {
  getCandles(options: {
    currency: string,
    asset: string,
    timeframe: string,
    start?: string,
    end?: string
  }): Promise<ICandle[]>;
};

export interface ICandle {
  time: string,
  open: number,
  high: number,
  low: number,
  close: number,
  volume?: number
};

export class ExchangeEngine {
  static getExchangeKeys(): string[] {
    return Object.keys(exchanges);
  };

  static getExchange(exchange: string): IExchange {
    return exchanges[exchange];
  };
};
