import { Hitbtc } from '../exchange/hitbtc';

const exchanges = {
  hitbtc: new Hitbtc()
};

export interface IExchange {
  getCandles(options: {
    currency: string,
    asset: string,
    period: string,
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

export class ExchangeEngine {
  static getExchangeKeys(): string[] {
    return Object.keys(exchanges);
  };

  static getExchange(exchange: string): IExchange {
    return exchanges[exchange];
  };
};
