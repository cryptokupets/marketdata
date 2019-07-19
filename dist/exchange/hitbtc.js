"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const request = __importStar(require("request-promise-native"));
const BASE_URL = "https://api.hitbtc.com/api/2/";
const CANDLES_LIMIT = 1000;
class Hitbtc {
    // UNDONE перевести в общепринятые обозначения
    static timeframeToMinutes(timeframe) {
        let duration = "P";
        if (timeframe === "1M") {
            duration += timeframe;
        }
        else if (["D1", "D7"].indexOf(timeframe) > -1) {
            duration += timeframe.slice(1) + timeframe.slice(0, 1);
        }
        else if (["M1", "M3", "M5", "M15", "M30", "H1", "H4"].indexOf(timeframe) > -1) {
            duration += "T" + timeframe.slice(1) + timeframe.slice(0, 1);
        }
        return moment_1.default.duration(duration).asMinutes(); // FIXME для месяца не сработает
    }
    static timeframeToTimeunits(timeframe) {
        let timeunits;
        if (timeframe === "1M") {
            timeunits = "M";
        }
        else if (["D1", "D7"].indexOf(timeframe) > -1) {
            timeunits = "D";
        }
        else if (["M1", "M3", "M5", "M15", "M30"].indexOf(timeframe) > -1) {
            timeunits = "m";
        }
        else if (["H1", "H4"].indexOf(timeframe) > -1) {
            timeunits = "h";
        }
        return timeunits;
    }
    _requestCandles(currency, asset, period, limit, from // UNDONE унифицировать здесь
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                baseUrl: BASE_URL,
                url: `public/candles/${asset}${currency}`,
                qs: {
                    period,
                    from,
                    limit
                }
            };
            return JSON.parse(yield request.get(options)).map(e => {
                return {
                    time: e.timestamp,
                    open: +e.open,
                    high: +e.max,
                    low: +e.min,
                    close: +e.close,
                    volume: +e.volume
                };
            });
        });
    }
    // TODO перенести логику работы с лимитом в обобщающий класс
    getCandles({ currency, asset, timeframe, start, end, limit }) {
        return __awaiter(this, void 0, void 0, function* () {
            const endMoment = moment_1.default.utc(end); // FIXME некорректно срабатывает
            const timeframeMinutes = Hitbtc.timeframeToMinutes(timeframe);
            const startMoment = moment_1.default.utc(start);
            if (!start) {
                startMoment.add(-(limit ? limit : CANDLES_LIMIT) * timeframeMinutes, "m");
            }
            const ticks = endMoment.diff(startMoment, "m") / timeframeMinutes;
            const iterations = ticks / CANDLES_LIMIT;
            // цикл по этим итерациям
            const candles = [];
            for (let index = 0; index < iterations; index++) { // UNDONE в действительности это не используется
                const response = yield this._requestCandles(currency, asset, timeframe, CANDLES_LIMIT, startMoment.toISOString());
                for (const candle of response.filter(e => moment_1.default.utc(e.time).isSameOrBefore(endMoment))) {
                    candles.push(candle);
                }
                startMoment.add(CANDLES_LIMIT * timeframeMinutes, "m");
            }
            return candles;
        });
    }
}
exports.Hitbtc = Hitbtc;
//# sourceMappingURL=hitbtc.js.map