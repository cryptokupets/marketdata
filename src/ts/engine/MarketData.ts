import { Hitbtc } from '../exchange/hitbtc';

const exchanges = {
  hitbtc: new Hitbtc()
};

export interface IMarketDataSource {
  getCandles(options: {
    currency: string,
    asset: string,
    timeframe: string,
    begin?: Date,
    end?: Date
  }): Promise<ICandle[]>;
};

export interface ICandle {
  time: Date,
  open: number,
  high: number,
  low: number,
  close: number,
  volume?: number
};

export class MarketDataEngine {
  static getExchangeKeys(): string[] {
    return Object.keys(exchanges);
  };

  static getExchange(exchange: string): IMarketDataSource {
    return exchanges[exchange];
  };
};
