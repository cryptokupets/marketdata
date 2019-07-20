"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
const lodash_1 = __importDefault(require("lodash"));
const odata_v4_server_1 = require("odata-v4-server");
const Exchange_1 = require("../../engine/Exchange");
const Asset_1 = require("../models/Asset");
const Currency_1 = require("../models/Currency");
let CurrencyController = class CurrencyController extends odata_v4_server_1.ODataController {
    getById(key, exchangeKey) {
        return new Currency_1.CurrencyModel({
            key,
            exchangeKey
        });
    }
    getAssets(result) {
        return __awaiter(this, void 0, void 0, function* () {
            const { key, exchangeKey } = result;
            const mSymbols = lodash_1.default.filter(yield Exchange_1.ExchangeEngine.getSymbols(exchangeKey), e => e.currency === key);
            return mSymbols.map(e => new Asset_1.AssetModel(e.asset));
        });
    }
};
__decorate([
    odata_v4_server_1.odata.GET,
    __param(0, odata_v4_server_1.odata.key),
    __param(1, odata_v4_server_1.odata.key)
], CurrencyController.prototype, "getById", null);
__decorate([
    odata_v4_server_1.odata.GET("Assets"),
    __param(0, odata_v4_server_1.odata.result)
], CurrencyController.prototype, "getAssets", null);
CurrencyController = __decorate([
    odata_v4_server_1.odata.type(Currency_1.CurrencyModel),
    odata_v4_server_1.Edm.EntitySet("Currency")
], CurrencyController);
exports.CurrencyController = CurrencyController;
//# sourceMappingURL=Currency.js.map