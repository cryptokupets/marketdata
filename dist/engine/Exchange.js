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
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const hitbtc_1 = require("../exchange/hitbtc");
const exchanges = {
    hitbtc: new hitbtc_1.Hitbtc()
};
class ExchangeEngine {
    static getSymbols(exchange) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield exchanges[exchange].getSymbols();
        });
    }
    static getTimeframes(exchange) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield exchanges[exchange].getTimeframes();
        });
    }
    static getExchangeKeys() {
        return Object.keys(exchanges);
    }
    static getExchange(exchange) {
        return exchanges[exchange];
    }
    static timeframeToMinutes(timeframe) {
        const d = {};
        d[timeframe.slice(0, 1).toLowerCase()] = +timeframe.slice(1);
        return moment_1.default.duration(d).asMinutes(); // FIXME для месяца не сработает
    }
    static getCandles({ exchange, currency, asset, timeframe, start, end }) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeframeMinutes = ExchangeEngine.timeframeToMinutes(timeframe);
            let startMoment = moment_1.default.utc(start);
            const candles = [];
            let responseLength;
            do {
                const response = yield exchanges[exchange].getCandles({
                    currency,
                    asset,
                    timeframe,
                    start: startMoment.toISOString(),
                    end
                });
                responseLength = response.length;
                if (responseLength) {
                    for (const candle of response) {
                        candles.push(candle);
                    }
                    startMoment = moment_1.default
                        .utc(response[responseLength - 1].time)
                        .add(timeframeMinutes, "m");
                }
            } while (responseLength && startMoment.isSameOrBefore(moment_1.default.utc(end)));
            return candles;
        });
    }
}
exports.ExchangeEngine = ExchangeEngine;
//# sourceMappingURL=Exchange.js.map