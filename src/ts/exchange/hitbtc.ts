import * as request from 'request';
import { IMarketDataSource, ICandle } from '../engine/MarketData';
import moment = require('moment');

const BASE_URL = 'https://api.hitbtc.com/api/2/';

export class Hitbtc implements IMarketDataSource {
  async getCandles(options: {
    currency: string,
    asset: string,
    period: string,
    begin?: Date, // FIXME заменить на число или строку, чтобы исключить часовой пояс для даты
    end?: Date
  }): Promise<ICandle[]> {
    const { currency, asset, period, begin, end } = options;
    const url = `public/candles/${asset}${currency}`;
    const qs: any = {
      period
    };

    if (begin) qs.from = moment(begin).toISOString();
    // UNDONE !!! должно из локального переводиться в UTC

    let candles = [];
    const MAX_LIMIT = 1000;
    const TIMEOUT = 100;
    let from = moment(begin);
    let duration = begin ? moment(end).diff(begin, period === 'M1' ? 'm' : (period === 'H1' ? 'h' : 'd')) : MAX_LIMIT;
    // UNDONE поддержка остальных периодов

    while (duration > 0) { // FIXME должно быть асинхронно?
      qs.limit = Math.min(duration, MAX_LIMIT);
      if (qs.limit) candles = candles.concat(await new Promise<any>(resolve => {
        const options = {
          baseUrl: BASE_URL,
          url,
          qs,
        };
        request.get(options, (err, res, body) => {
          if (err) console.log(err);
          if (res && res.statusCode === 200) {
            resolve(JSON.parse(body).slice(0, -1).map(e => (<any>{
              time: moment(e.timestamp).toDate(),
              open: +e.open,
              high: +e.max,
              low: +e.min,
              close: +e.close,
            })));
            duration -= qs.limit;
          } else {
            setTimeout(() => { resolve([]); }, TIMEOUT);
          }
        });
      }));
      from = from.add(qs.limit, period === 'M1' ? 'm' : (period === 'H1' ? 'h' : 'd'));
      qs.from = from.toISOString();
    }

    return candles;
  };
};
