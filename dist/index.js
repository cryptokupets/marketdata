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
const express_1 = __importDefault(require("express"));
const Exchange_1 = require("./engine/Exchange");
const app = express_1.default();
const port = 8080; // default port to listen
app.use(express_1.default.static(__dirname + "/../webapp"));
app.get("/api/symbols/:exchange", (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { exchange } = req.params;
    res.json(yield Exchange_1.ExchangeEngine.getSymbols(exchange));
}));
app.get("/api/timeframes/:exchange", (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { exchange } = req.params;
    res.json(yield Exchange_1.ExchangeEngine.getTimeframes(exchange));
}));
app.get("/api/candles/:exchange/:currency/:asset/:timeframe", (req, res) => __awaiter(this, void 0, void 0, function* () {
    const { exchange, currency, asset, timeframe } = req.params;
    const { start, end } = req.query;
    res.json(yield Exchange_1.ExchangeEngine.getCandles({
        exchange,
        currency,
        asset,
        timeframe,
        start,
        end
    }));
}));
// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});
//# sourceMappingURL=index.js.map