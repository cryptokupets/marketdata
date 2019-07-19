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
const Exchange_1 = require("../engine/Exchange");
const BASE_URL = "https://api.hitbtc.com/api/2/";
class Hitbtc {
    getSymbols() {
        return __awaiter(this, void 0, void 0, function* () {
            const options = {
                baseUrl: BASE_URL,
                url: "public/symbol"
            };
            return JSON.parse(yield request.get(options)).map(e => {
                return {
                    currency: e.quoteCurrency,
                    asset: e.baseCurrency
                };
            });
        });
    }
    getTimeframes() {
        return __awaiter(this, void 0, void 0, function* () {
            return ["M1", "M3", "M5", "M15", "M30", "H1", "H4", "D1", "D7"];
        });
    }
    getCandles({ currency, asset, timeframe, start, end }) {
        return __awaiter(this, void 0, void 0, function* () {
            const CANDLES_LIMIT = 1000;
            const limit = Math.min(Math.floor(moment_1.default.utc(end).diff(moment_1.default.utc(start), "m") /
                Exchange_1.ExchangeEngine.timeframeToMinutes(timeframe)) + 1, CANDLES_LIMIT);
            const options = {
                baseUrl: BASE_URL,
                url: `public/candles/${asset.toUpperCase()}${currency.toUpperCase()}`,
                qs: {
                    period: timeframe.toUpperCase(),
                    from: moment_1.default.utc(start).toISOString(),
                    limit
                }
            };
            return limit
                ? JSON.parse(yield request.get(options)).map(e => {
                    return {
                        time: e.timestamp,
                        open: +e.open,
                        high: +e.max,
                        low: +e.min,
                        close: +e.close,
                        volume: +e.volume
                    };
                })
                : [];
        });
    }
}
exports.Hitbtc = Hitbtc;
//# sourceMappingURL=hitbtc.js.map