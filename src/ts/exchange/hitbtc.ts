import * as request from 'request';
// import { IMarketDataSource, ICandle } from '../engine/MarketData';
import moment = require('moment');
import { IExchange, ICandle } from '../engine/Exchange';

const BASE_URL = 'https://api.hitbtc.com/api/2/';

export class Hitbtc implements IExchange {
  static timeframeFormatter(timeframe: string): string {
    return timeframe;
  };

  async getCandles({ currency, asset, timeframe }: {
    currency: string,
    asset: string,
    timeframe: string,
    // begin?: Date, // FIXME заменить на число или строку, чтобы исключить часовой пояс для даты
    // end?: Date
  }): Promise<ICandle[]> {
    // const periodMoment = moment.duration(period);
    // console.log(periodMoment);

    // const periodFormated = 'M1';
    // PT1M

    
    

    // const { currency, asset, period, begin, end } = options;
    const url = `public/candles/${asset}${currency}`;
    const qs: any = {
      period: Hitbtc.timeframeFormatter(timeframe)
    };

        const options = {
          baseUrl: BASE_URL,
          url,
          qs,
        };

        return new Promise(function(resolve) {
        request.get(options, (err, res, body) => {
          if (err) console.log(err);
          // if (res || res.statusCode !== 200) console.log(res.statusCode);
          // console.log(body);
          // if (res && res.statusCode === 200) {
            // console.log(res.body);
            resolve(JSON.parse(body).slice(0, -1).map(e => (<any>{
              time: moment(e.timestamp).toISOString(),
              open: e.open,
              high: e.max,
              low: e.min,
              close: e.close
            })));
            
          // }
        });
      });
  };
};
