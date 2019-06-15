import * as request from 'request';
// import { IMarketDataSource, ICandle } from '../engine/MarketData';
import * as momentjs from 'moment';
import { extendMoment } from 'moment-range';

const moment = extendMoment(momentjs);

import { IExchange, ICandle } from '../engine/Exchange';

const BASE_URL = 'https://api.hitbtc.com/api/2/';
const CANDLES_LIMIT = 3;

export class Hitbtc implements IExchange {
  // static timeframeFormatter(timeframe: string): string {
  //   return timeframe;
  // };
  // M1, M3, M5, M15, M30, H1, H4, D1, D7, 1M
  // хотя правильно MN

  static timeframeToMinutes(timeframe: string): number {
    let duration = 'P';
    if (timeframe === '1M') {
      duration += timeframe;
    } else if (['D1', 'D7'].indexOf(timeframe) > -1) {
      duration += timeframe.slice(1) + timeframe.slice(0, 1);
    } else if (['M1', 'M3', 'M5', 'M15', 'M30', 'H1', 'H4'].indexOf(timeframe) > -1) {
      duration += 'T' + timeframe.slice(1) + timeframe.slice(0, 1);
    }

    // console.log(duration);
    return moment.duration(duration).asMinutes(); // FIXME для месяца не сработает
  };

  static timeframeToTimeunits(timeframe: string): any {
    let timeunits;
    if (timeframe === '1M') {
      timeunits = 'M';
    } else if (['D1', 'D7'].indexOf(timeframe) > -1) {
      timeunits = 'D';
    } else if (['M1', 'M3', 'M5', 'M15', 'M30'].indexOf(timeframe) > -1) {
      timeunits = 'm';
    } else if (['H1', 'H4'].indexOf(timeframe) > -1) {
      timeunits = 'h';
    }
    return timeunits;
  };

  async _requestCandles(url: string, period: string, limit: number, from: string): Promise<ICandle[]> {
    console.log(from);
    const options = {
      baseUrl: BASE_URL,
      url,
      qs: {
        period,
        from,
        limit
      },
    };

    return new Promise(function(resolve) {
      request.get(options, (err, res, body) => {
        // resolve(JSON.parse(body).slice(0, -1).map(e => (<any>{ // обрезать можно только у текущего значения
        console.log(JSON.parse(body));
        resolve(JSON.parse(body).map(e => (<any>{
          time: moment(e.timestamp).toISOString(),
          open: +e.open,
          high: +e.max,
          low: +e.min,
          close: +e.close
        })));
      });
    });
  };

  async getCandles({ currency, asset, timeframe, start, end }: {
    currency: string,
    asset: string,
    timeframe: string,
    start?: string,
    end?: string
  }): Promise<ICandle[]> {
    const url = `public/candles/${asset}${currency}`;
    // console.log(start, end);

    const startMoment = moment.utc(start);
    console.log(startMoment.toISOString());
    const endMoment = moment.utc(end);
    console.log(endMoment.toISOString());

    const timeframeMinutes = Hitbtc.timeframeToMinutes(timeframe);
    const rangeMinutes = endMoment.diff(startMoment, 'm');
    const ticks = rangeMinutes / timeframeMinutes;
    const iterations = ticks / CANDLES_LIMIT;
    
    console.log(rangeMinutes, timeframeMinutes, ticks, iterations);

    // цикл по этим итерациям
    const candles: ICandle[] = [];
    for (let index = 0; index < iterations; index++) {
      // start каждый раз увеличивать
      // CANDLES_LIMIT * timeframeMinutes
      
      startMoment.add(CANDLES_LIMIT * timeframeMinutes, 'm');
      const response = await this._requestCandles(url, timeframe, CANDLES_LIMIT, startMoment.toISOString());
      for (let i = 0; i < response.length; i++) {
        // console.log(response[i]);
        candles.push(response[i]);
      }
    }

    // const range = moment.range(startMoment, endMoment);

    // console.log(startMoment, endMoment, range);
    // определить количество тиков

    // const periodMoment = moment.duration(period);
    // console.log(periodMoment);

    // const periodFormated = 'M1';
    // PT1M
    // const duration = Hitbtc.timeframeToDuration(timeframe);
   
    return candles;
  };
};
