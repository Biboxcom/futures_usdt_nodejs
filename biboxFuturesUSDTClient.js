/*
 * Copyright (C) 2020, Bibox.com. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

const BigNumber = require( 'bignumber.js' );
const got = require( "got" );
const CryptoJS = require( "crypto-js" );
let events = require( "events" );
const emitter = new events.EventEmitter();
const WebSocket = require( 'ws' );
const zlib = require( 'zlib' );
// const { Worker, isMainThread, parentPort } = require( 'worker_threads' );
// const sleep = ( delay ) => new Promise( ( resolve ) => setTimeout( resolve, delay ) );
const defaultConfig = {
    apiKey: "",
    secretKey: "",
    restHost: "https://api.bibox.com",
    wssHost: "wss://npush.bibox360.com/cbu"
};

const MarketUrl = {
    CONTRACT: "/v3.1/cquery/buValue",
    CANDLESTICK: "/v2/mdata/kline",
    ORDER_BOOK: "/v2/mdata/depth",
    SYMBOL_PRECISION: "/v3.1/cquery/buUnit",
    MARK_PRICE: "/v3.1/cquery/buTagPrice",
    FUNDING_RATE: "/v3.1/cquery/buFundRate"
};

const PrivateUrl = {
    TRANSFER: "/v3/cbuassets/transfer",
    PLACE_ORDER: "/v3/cbu/order/open",
    CANCEL_ORDER: "/v3/cbu/order/close",
    QUERY_ORDER: "/v3.1/cquery/base_u/orderById",
    QUERY_OPEN_ORDER: "/v3/cbu/order/list",
    QUERY_ORDER_HISTORY: "/v3.1/cquery/base_u/orderHistory",
    BATCH_CANCEL_ORDER: "/v3/cbu/order/closeBatch",
    CANCEL_ALL_ORDERS: "/v3/cbu/order/closeAll",
    TRANSFER_MARGIN: "/v3/cbu/changeMargin",
    CHANGE_MARGIN_MODE: "/v3/cbu/changeMode",
    ACCOUNT: "/v3/cbu/assets",
    POSITION: "/v3/cbu/position",
    POSITION_CHANGE_HISTORY: "/v3.1/cquery/base_u/dealLog",
    TRADES: "/v3.1/cquery/base_u/orderDetail"
};

const TimeInterval = Object.freeze( {
    ONE_MINUTE: "1min",
    THREE_MINUTES: "3min",
    FIVE_MINUTES: "5min",
    FIFTEEN_MINUTES: "15min",
    HALF_HOURLY: "30min",
    HOURLY: "1hour",
    TWO_HOURLY: "2hour",
    FOUR_HOURLY: "4hour",
    SIX_HOURLY: "6hour",
    TWELVE_HOURLY: "12hour",
    DAILY: "day",
    WEEKLY: "week"
} );

// eslint-disable-next-line no-unused-vars
const OrderType = Object.freeze( {
    MARKET: "MARKET",
    LIMIT: "LIMIT"
} );

const TradeSide = Object.freeze( {
    LONG: "LONG",
    SHORT: "SHORT"
} );

const TradeAction = Object.freeze( {
    ENTRY: "ENTRY",
    EXIT: "EXIT"
} );

const ApiPositionUpdateType = Object.freeze( {
    ENTRY: 1,
    EXIT: 2,
    REDUCE: 3,
    LIQUIDATE: 4,
    ADL: 5,

    fromInteger: ( num ) => {
        switch ( num ) {
            case 1:
                return "ENTRY";
            case 2:
                return "EXIT";
            case 3:
                return "REDUCE";
            case 4:
                return "LIQUIDATE";
            case 5:
                return "ADL";
        }
    }
} );

const MarginMode = Object.freeze( {
    CROSS: "CROSS",
    ISOLATED: "ISOLATED"
} );

const OrderStatus = Object.freeze( {
    CREATED: "CREATED",
    PARTIAL_FILLED: "PARTIAL_FILLED",
    FILLED: "FILLED",
    PARTIAL_CANCELED: "PARTIAL_CANCELED",
    CANCELED: "CANCELED",
    REJECTED: "REJECTED"
} );

const ApiOrderStatus = Object.freeze( {
    CREATED: 1,
    PARTIAL_FILLED: 2,
    FILLED: 3,
    PARTIAL_CANCELED: 4,
    CANCELED: 5,
    REJECTED: 100,

    fromInteger: ( num ) => {
        switch ( num ) {
            case 1:
                return "CREATED";
            case 2:
                return "PARTIAL_FILLED";
            case 3:
                return "FILLED";
            case 4:
                return "PARTIAL_CANCELED";
            case 5:
                return "CANCELED";
            case 100:
                return "REJECTED";
        }
    }
} );

const ApiMarginMode = Object.freeze( {
    CROSS: 1,
    ISOLATED: 2,
    fromInteger: ( num ) => {
        switch ( num ) {
            case 1:
                return "CROSS";
            case 2:
                return "ISOLATED";
        }
    }
} );

// eslint-disable-next-line no-unused-vars
const ApiOrderType = Object.freeze( {
    MARKET: 1,
    LIMIT: 2
} );

const ApiOrderSide = Object.freeze( {
    LONG_ENTRY: 1,
    SHORT_ENTRY: 2,
    LONG_EXIT: 3,
    SHORT_EXIT: 4,

    loopUpOrderSide: function ( tradeSide, tradeAction ) {
        return ApiOrderSide[tradeSide + "_" + tradeAction];
    }
} );

const ApiTradeAction = Object.freeze( {
    ENTRY: 1,
    EXIT: 2,

    fromOrderSide: ( side ) => {
        switch ( side ) {
            case 1:
                return "ENTRY";
            case 2:
                return "ENTRY";
            case 3:
                return "EXIT";
            case 4:
                return "EXIT";
        }
    }
} );

const ApiTradeSide = Object.freeze( {
    LONG: 1,
    SHORT: 2,

    fromInteger: ( num ) => {
        switch ( num ) {
            case 1:
                return "LONG";
            case 2:
                return "SHORT";
        }
    },

    fromOrderSide: ( side ) => {
        switch ( side ) {
            case 1:
                return "LONG";
            case 2:
                return "SHOTR";
            case 3:
                return "LONG";
            case 4:
                return "SHOTR";
        }
    }
} );

class BiboxFuturesClientBase {

    constructor( apiKey, secretKey ) {
        this._apiKey = apiKey || defaultConfig.apiKey;
        this._secretKey = secretKey || defaultConfig.secretKey;
        this._restHost = defaultConfig.restHost;
        this._wssHost = defaultConfig.wssHost;

        this._subscriptions = {};
        this._wss = null;
        this._pingTimeout = null;
        this._wssOpened = false;
    }

    setRestHost = ( restHost ) => {
        this._restHost = restHost;
    }

    setWssHost = ( wssHost ) => {
        this._wssHost = wssHost;
    }

    _onWebSocketOpen = () => {
        this._wssOpened = true;
        emitter.on( "sub_channel", ( channel ) => {
            if ( channel && this._subscriptions[channel] ) {
                this._wss.send( this._subscriptions[channel] );
                return;
            }
            for ( const sub of Object.values( this._subscriptions ) ) {
                this._wss.send( sub.toString() );
            }
        } );

        emitter.on( "unsub_channel", ( channel ) => {
            if ( channel && this._subscriptions[channel] ) {
                this._wss.send( JSON.stringify( {
                    "unsub": this._subscriptions.getChannel(),
                } ) );
                delete this._subscriptions[channel];
            }
        } );

        emitter.on( "unsub_private_channel", ( channel ) => {
            this._wss.send( JSON.stringify( {
                "unsub": this._subscriptions.getChannel(),
            } ) );
            for ( let key of Object.keys( this._subscriptions ) ) {
                if ( key.indexOf( channel ) !== -1 ) {
                    delete this._subscriptions[key];
                }
            }
        } );
    }

    _subscribe = ( sub ) => {
        let channel = sub.getChannel();
        if ( !this._subscriptions.hasOwnProperty( channel ) ) {
            this._subscriptions[channel] = sub;
        }
        if ( this._wssOpened ) {
            emitter.emit( "sub_channel", channel );
        }
        this._initWss();
    }

    _unsubscribe = ( channel ) => {
        if ( this._wssOpened ) {
            emitter.emit( "unsub_channel", channel );
        }
    }
    _unsubscribeAllPrivateSubscriptions = () => {
        if ( this._wssOpened ) {
            emitter.emit( "unsub_private_channel", PrivateSubscription.CHANNEL_PREFIX );
        }
    }

    _heartbeat = () => {
        if ( this._pingTimeout ) {
            clearTimeout( this._pingTimeout );
        }

        this._pingTimeout = setTimeout( () => {
            this._wss.terminate();
            this._wss = null;
            this._initWss();
        }, 60000 );
    };

    _loopPing = () => {
        if ( this._keepLive ) {
            clearTimeout( this._keepLive );
        }

        this._keepLive = setTimeout( () => {
            this._wss.ping( new Date().getTime() );
            this._loopPing();
        }, 10000 );
    };

    _delayReconnect = ( ms = 3000 ) => {
        const timer = setTimeout( () => {
            this._reconnect();
            clearTimeout( timer );
        }, ms );
    };

    _reconnect = () => {
        if ( this._wss ) {
            let __wss = this._wss;
            __wss.removeAllListeners();
            __wss.on( "error", () => {} );
            if ( __wss.readyState !== __wss.CONNECTING ) {
                __wss.terminate();
            }
            clearTimeout( this._pingTimeout );
            clearTimeout( this._keepLive );
            this._wss = null;
            this._initWss();
        }
    };

    _initWss = () => {
        if ( !this._wss ) {
            this._wss = new WebSocket( this._wssHost );
            this._wss.on( "open", () => {
                this._onWebSocketOpen();
                emitter.emit( "sub_channel" );
                this._loopPing();
            } );

            this._wss.on( "close", () => {
                console.log( "close", e );
                this._delayReconnect();
            } );

            this._wss.on( "error", ( err ) => {
                console.log( "error", err );
                this._delayReconnect();
            } );

            this._wss.on( "ping", () => {
                this._heartbeat();
            } );

            this._wss.on( "message", ( message ) => {
                message = this._decodeBytes( message );
                if ( this._isObj( message ) ) {
                    let data = JSON.parse( message );
                    let channel = data.topic;
                    if ( !channel ) {
                        return;
                    }
                    if ( PrivateSubscription.CHANNEL_PREFIX === channel ) {
                        for ( let psub of Object.values( this._subscriptions ) ) {
                            let pdata = data.d[psub.getDataName()];
                            if ( pdata ) {
                                psub.onMessage( pdata );
                                return;
                            }
                        }
                        return;
                    }

                    let sub = this._subscriptions[channel];
                    if ( sub ) {
                        sub.onMessage( data.d );
                    }

                }
            } );
        }
    };

    _decodeBytes = ( array ) => {
        let zipFlag = array[0];
        let offset = 1;
        let length = array.length - offset;
        if ( !zipFlag ) {
            return array.toString( 'utf-8', offset, length );
        }else if ( zipFlag === 1 ) {
            return this._ungZip( array, offset );
        }else {
            let unknow = array.toString( 'utf-8', 0, length );
            if ( unknow.includes( "error" ) ) {
                console.log( unknow );
            }
        }
        return '';
    }

    _ungZip = ( array, offset ) => {
        array = array.slice( offset );
        return zlib.gunzipSync( array ).toString();
    }

    _getProxy = async ( path, param ) => {
        let res = await this._sendGet( path, param );
        this._checkState( res );
        return res;
    };

    _postProxy = async ( path, param ) => {
        let res = await this._sendPost( path, param );
        this._checkState( res );
        return res;
    };

    _convertSymbol = ( symbol ) => {
        if ( symbol.startsWith( "4" ) || symbol.startsWith( "5" ) ) return symbol;
        if ( symbol.endsWith( "USD" ) ) return "5" + symbol;
        if ( symbol.endsWith( "USDT" ) ) return "4" + symbol;
        return symbol;
    };

    _checkState = ( res ) => {
        if ( res.hasOwnProperty( "state" ) && res.state !== 0 )
            throw `Error (state:${ res.state }, message:${ res.msg })`;
    };

    _sendGet = async ( path, param ) => {
        try {
            return await got( this._url( path ), {
                searchParams: new URLSearchParams( param )
            } ).json();
        } catch ( error ) {
            console.log( error );
            throw error;
        }
    };

    _sendPost = async ( path, param ) => {
        try {
            let timestamp = Date.now();
            let strParam = JSON.stringify( param );
            let strToSign = '' + timestamp + strParam;
            let sign = this._buildSign( strToSign );

            return await got.post( this._url( path ), {
                json: param,
                headers: {
                    "bibox-api-key": this._apiKey,
                    "bibox-api-sign": sign,
                    "bibox-timestamp": timestamp
                }
            } ).json();
        } catch ( error ) {
            console.log( error );
            throw error;
        }
    };

    _url = ( path ) => {
        return this._restHost + path;
    };

    _buildSign = ( strToSign ) => {
        return CryptoJS.HmacMD5( strToSign, this._secretKey ).toString();
    };

    _buildSubSign = () => {
        let signStr = `{"apikey":"${ this._apiKey }","sub":"${ PrivateSubscription.CHANNEL_PREFIX }"}`;
        return CryptoJS.HmacMD5( signStr, this._secretKey ).toString();
    };

    _isObj = ( str ) => str.startsWith( "{" );

}

class BiboxFuturesUSDTClient extends BiboxFuturesClientBase {

    constructor( apiKey, secretKey ) {
        super( apiKey, secretKey );
    }

    /**
     * 获取kline
     * @param  symbol 合约名称
     * @param  interval 时间周期
     * @param  limit 条目限制
     */
    getCandlestick = async ( symbol, interval, limit ) => {
        let res = await this._getProxy( MarketUrl.CANDLESTICK, {
            "pair": this._convertSymbol( symbol ),
            "period": interval,
            "size": limit || 100
        } );
        return JsonUtil.candlestickWrapper( res.result );
    };

    /**
     * 获取深度
     * @param  symbol 合约名称
     * @param  limit 条目限制
     */
    getOrderBook = async ( symbol, limit ) => {
        let res = await this._getProxy( MarketUrl.ORDER_BOOK, {
            "pair": this._convertSymbol( symbol ),
            "size": Number( limit ) || 200
        } );
        return JsonUtil.orderBookWrapper( res.result );
    };

    /**
     * 获取合约信息
     */
    getContracts = async () => {
        let [ contract, fundingRate, symbolPrecision ] = await Promise.all( [
            this._getProxy( MarketUrl.CONTRACT, {} ),
            this._getProxy( MarketUrl.FUNDING_RATE, {} ),
            this._getProxy( MarketUrl.SYMBOL_PRECISION, {} )
        ] );
        return JsonUtil.contractsWrapper( contract.result, fundingRate.result, symbolPrecision.result );
    }

    /**
     * 获取合约信息
     * @param  symbol 合约名称
     */
    getContract = async ( symbol ) => {
        let [ contract, fundingRate, symbolPrecision ] = await Promise.all( [
            this._getProxy( MarketUrl.CONTRACT, {} ),
            this._getProxy( MarketUrl.FUNDING_RATE, {} ),
            this._getProxy( MarketUrl.SYMBOL_PRECISION, {} )
        ] );
        let arr = JsonUtil.contractsWrapper( contract.result, fundingRate.result, symbolPrecision.result );
        for ( let item of arr ) {
            if ( item.symbol === this._convertSymbol( symbol ) ) return item;
        }
    }

    /**
     * 获取合约信息 指数 标记价格 资金费率等
     */
    getContractInfos = async () => {
        let [ fundingRate, markPrice ] = await Promise.all( [
            this._getProxy( MarketUrl.FUNDING_RATE, {} ),
            this._getProxy( MarketUrl.MARK_PRICE, {} )
        ] );
        return JsonUtil.contractInfosWrapper( fundingRate.result, markPrice.result );
    }

    /**
     * 获取合约信息 指数 标记价格 资金费率等
     * @param  symbol 合约名称
     */
    getContractInfo = async ( symbol ) => {
        let [ fundingRate, markPrice ] = await Promise.all( [
            this._getProxy( MarketUrl.FUNDING_RATE, {} ),
            this._getProxy( MarketUrl.MARK_PRICE, {} )
        ] );
        let arr = JsonUtil.contractInfosWrapper( fundingRate.result, markPrice.result );
        for ( let item of arr ) {
            if ( item.symbol === this._convertSymbol( symbol ) ) return item;
        }
    }

    /**
     * 资金转进
     * @param  asset 账户名称
     * @param  amount 金额
     */
    transferIn = async ( asset, amount ) => {
        await this._postProxy( PrivateUrl.TRANSFER, {
            "amount": String( amount ),
            "symbol": asset,
            "type": 0
        } );
    }

    /**
     * 资金转出
     * @param  asset 账户名称
     * @param  amount 金额
     */
    transferOut = async ( asset, amount ) => {
        await this._postProxy( PrivateUrl.TRANSFER, {
            "amount": String( amount ),
            "symbol": asset,
            "type": 1
        } );
    }

    /**
     * 提交委限价托单
     * @param symbol 合约名称
     * @param quantity 下单数量
     * @param tradeSide  1多 2空
     * @param tradeAction 1开仓 2平仓
     * @param clientOrderId 用户自定义id
     */
    placeMarketOrder = async ( { symbol, quantity, tradeSide, tradeAction } = {}, clientOrderId ) => {
        let res = await this._postProxy( PrivateUrl.PLACE_ORDER, {
            "pair": this._convertSymbol( symbol ),
            "order_side": ApiOrderSide.loopUpOrderSide( tradeSide, tradeAction ),
            "order_type": 1,
            "amount": quantity.toString(),
            "order_from": 6,
            "client_oid": clientOrderId ? clientOrderId.toString() : undefined,
        } );
        return res.order_id;
    }
    /**
     * 提交委限价托单
     * @param symbol 合约名称
     * @param quantity 下单数量
     * @param price 下单价格
     * @param tradeSide  1多 2空
     * @param tradeAction 1开仓 2平仓
     * @param clientOrderId 用户自定义id
     */
    placeLimitOrder = async ( { symbol, quantity, price, tradeSide, tradeAction } = {}, clientOrderId ) => {
        let res = await this._postProxy( PrivateUrl.PLACE_ORDER, {
            "pair": this._convertSymbol( symbol ),
            "order_side": ApiOrderSide.loopUpOrderSide( tradeSide, tradeAction ),
            "order_type": 2,
            "price": price ? price.toString() : 0,
            "amount": quantity.toString(),
            "order_from": 6,
            "client_oid": clientOrderId ? clientOrderId.toString() : undefined,
        } );
        return res.order_id;
    }

    /**
     * 撤销委托单
     * @param orderId 订单id
     */
    cancelOrder = async ( orderId ) => {
        await this._postProxy( PrivateUrl.CANCEL_ORDER, {
            "order_id": orderId.toString(),
        } );
    }

    /**
     * 撤销委托单
     * @param  orderIds 订单id数组
     */
    cancelOrders = async ( orderIds ) => {
        let ids = orderIds.map( item => item.toString() );
        await this._postProxy( PrivateUrl.BATCH_CANCEL_ORDER, {
            "order_ids": ids,
        } );
    }

    /**
     * 撤销委托单
     * @param  symbol 合约名称
     */
    cancelAllOrders = async ( symbol ) => {
        await this._postProxy( PrivateUrl.CANCEL_ALL_ORDERS, {
            "pair": this._convertSymbol( symbol ),
        } );
    }

    /**
     * 划转保证金
     * @param symbol 合约名称
     * @param tradeSide 仓位方向
     * @param amount 保证金方法
     */
    transferMargin = async ( symbol, tradeSide, amount ) => {
        await this._postProxy( PrivateUrl.TRANSFER_MARGIN, {
            "pair": this._convertSymbol( symbol ),
            "margin": String( amount ),
            "side": ApiTradeSide[tradeSide]
        } );
    }

    /**
     * 变更保证金模式
     * @param symbol 合约名称
     * @param marginMode 仓位模式
     */
    changeMarginMode = async ( symbol, marginMode ) => {
        let param = {
            "pair": this._convertSymbol( symbol ),
            "mode": ApiMarginMode[marginMode]
        };
        let positions = await this.getPositions( symbol );
        for ( let p of positions ) {
            if ( p.marginMode === marginMode ) {
                return;
            }
            if ( p.side === TradeSide.LONG ) {
                param["leverage_long"] = p.leverage;
            }
            if ( p.side === TradeSide.SHORT ) {
                param["leverage_short"] = p.leverage;
            }
        }
        await this._postProxy( PrivateUrl.CHANGE_MARGIN_MODE, param );
    }

    /**
     * 变更杠杆
     * @param symbol 合约名称
     * @param tradeSide 仓位方向
     * @param leverage 杠杆
     */
    changeLeverage = async ( symbol, tradeSide, leverage ) => {
        let param = {
            "pair": this._convertSymbol( symbol )
        };
        let otherTradeSide = tradeSide === TradeSide.SHORT ? TradeSide.LONG : TradeSide.SHORT;
        let positions = await this.getPositions( symbol, otherTradeSide );
        let p = positions[0];
        param["mode"] = ApiMarginMode[p.marginMode];
        if ( otherTradeSide === TradeSide.SHORT ) {
            param["leverage_long"] = Number( leverage );
            param["leverage_short"] = p.leverage;
        } else {
            param["leverage_long"] = p.leverage;
            param["leverage_short"] = Number( leverage );
        }
        await this._postProxy( PrivateUrl.CHANGE_MARGIN_MODE, param );
    }

    /**
     * 查询账户资产
     */
    getAccounts = async () => {
        let res = await this._postProxy( PrivateUrl.ACCOUNT, {} );
        return JsonUtil.accountsWrapper( res.result );
    }

    /**
     * 查询账户资产
     * @param  asset BTC/ETH/...
     */
    getAccount = async ( asset ) => {
        let res = await this._postProxy( PrivateUrl.ACCOUNT, {
            "coin": asset
        } );
        return JsonUtil.accountsWrapper( res.result )[0];
    }

    /**
     * 查询仓位
     * @param symbol
     * @param tradeSide
     */
    getPositions = async ( symbol, tradeSide ) => {
        let res = await this._postProxy( PrivateUrl.POSITION, {
            "pair": symbol ? this._convertSymbol( symbol ) : undefined,
            "side": tradeSide ? ApiTradeSide[tradeSide] : undefined
        } );
        return JsonUtil.positionsWrapper( res.result );
    }

    /**
     * 获取仓位变化记录
     * @param symbol 合约名称
     * @param page   页数
     * @param size   每夜数量
     */
    getPositionUpdates = async ( symbol, page, size ) => {
        let res = await this._postProxy( PrivateUrl.POSITION_CHANGE_HISTORY, {
            "pair": this._convertSymbol( symbol ),
            "page": Number( page ) || 1,
            "size": Number( size ) || 10,
        } );
        return JsonUtil.positionUpdatesWrapper( res.result );
    }

    /**
     * 获取交易
     * @param orderId
     * @param page
     * @param size
     */
    getFills = async ( orderId, page, size ) => {
        let res = await this._postProxy( PrivateUrl.TRADES, {
            "orderId": String( orderId ),
            "page": Number( page ) || 1,
            "size": Number( size ) || 10,
        } );
        return JsonUtil.fillsWrapper( res.result, orderId );
    }

    /**
     * 获取委托单
     * @param id 委托id或者用户自定义id
     */
    getOrder = async ( id ) => {
        let res = await this._postProxy( PrivateUrl.QUERY_ORDER, {
            "orderIds": [ String( id ) ],
            "clientOids": [ String( id ) ],
        } );
        return JsonUtil.ordersWrapper( res.result )[0];
    };

    /**
     * 获取委托单
     * @param orderIds 委托id数组
     */
    getOrders = async ( orderIds ) => {
        let ids = orderIds.map( item => item.toString() );
        let res = await this._postProxy( PrivateUrl.QUERY_ORDER, {
            "orderIds": ids,
            "clientOids": [],
        } );
        return JsonUtil.ordersWrapper( res.result );
    };

    /**
     * 获取委托单
     * @param clientOids 用户自定义id数组
     */
    getOrdersByClientOids = async ( clientOids ) => {
        let ids = clientOids.map( item => item.toString() );
        let res = await this._postProxy( PrivateUrl.QUERY_ORDER, {
            "orderIds": [],
            "clientOids": [ ids ],
        } );
        return JsonUtil.ordersWrapper( res.result );
    };

    /**
     * 获取当前委托单
     * @param symbol 合约名称
     * @param page 页码
     * @param size 每页条目
     * @param tradeSide 多空方向
     * @param tradeAction 开仓平仓
     */
    getOpenOrders = async ( symbol, page, size, tradeSide, tradeAction ) => {
        let res = await this._postProxy( PrivateUrl.QUERY_OPEN_ORDER, {
            "page": Number( page ) || 1,
            "size": Number( size ) || 10,
            "pair": symbol ? this._convertSymbol( symbol ) : undefined,
            "order_side": ApiOrderSide.loopUpOrderSide( tradeSide, tradeAction ),
        } );
        return JsonUtil.openOrdersWrapper( res.result );
    }

    /**
     * 获取历史委托单
     * @param symbol 合约名称
     * @param page 页码
     * @param size 每页条目
     * @param tradeSide 多空方向
     * @param tradeAction 开仓平仓
     * @param orderStatus 委托状态
     */
    getClosedOrders = async ( symbol, page, size, tradeSide, tradeAction, orderStatus ) => {
        let res = await this._postProxy( PrivateUrl.QUERY_ORDER_HISTORY, {
            "page": Number( page ) || 1,
            "size": Number( size ) || 10,
            "pair": symbol ? this._convertSymbol( symbol ) : undefined,
            "side": ApiOrderSide.loopUpOrderSide( tradeSide, tradeAction ),
            "status": ApiOrderStatus[orderStatus] ? [ ApiOrderStatus[orderStatus] ] : undefined
        } );
        return JsonUtil.closedOrdersWrapper( res.result );
    }

    /**
     * 订阅kline
     * @param {string} symbol 合约名称
     * @param {string} interval 时间周期
     * @param listener
     */
    subscribeCandlestick = ( symbol, interval, listener ) => {
        this._subscribe( new CandlestickSubscription( this._convertSymbol( symbol ), interval, listener ) );
    };

    /**
     * 取消订阅kline
     * @param {string} symbol 合约名称
     * @param {string} interval 时间周期
     */
    unsubscribeCandlestick = ( symbol, interval ) => {
        this._unsubscribe( CandlestickSubscription.buildChannelName( this._convertSymbol( symbol ), interval ) );
    };

    /**
     * 订阅标记价格
     * @param {string} symbol 合约名称
     * @param listener
     */
    subscribeMarketPrice = ( symbol, listener ) => {
        this._subscribe( new MarketPriceSubscription( this._convertSymbol( symbol ), listener ) );
    };

    /**
     * 取消订阅标记价格
     * @param {string} symbol 合约名称
     */
    unsubscribeMarketPrice = ( symbol ) => {
        this._unsubscribe( MarketPriceSubscription.buildChannelName( this._convertSymbol( symbol ) ) );
    };

    /**
     * 订阅深度
     * @param {string} symbol 合约名称
     * @param listener
     */
    subscribeOrderBook = ( symbol, listener ) => {
        this._subscribe( new OrderBookSubscription( this._convertSymbol( symbol ), listener ) );
    };

    /**
     * 取消订阅深度
     * @param {string} symbol 合约名称
     */
    unsubscribeOrderBook = ( symbol ) => {
        this._unsubscribe( OrderBookSubscription.buildChannelName( this._convertSymbol( symbol ) ) );
    };

    /**
     * 订阅市场成交记录
     * @param {string} symbol 合约名称
     * @param listener
     */
    subscribeTrade = ( symbol, listener ) => {
        this._subscribe( new TradeSubscription( this._convertSymbol( symbol ), listener ) );
    };

    /**
     * 取消订阅深度
     * @param {string} symbol 合约名称
     */
    unsubscribeTrade = ( symbol ) => {
        this._unsubscribe( TradeSubscription.buildChannelName( this._convertSymbol( symbol ) ) );
    };

    /**
     * 订阅指定合约的Ticker数据
     * @param {string} symbol 合约名称
     * @param listener
     */
    subscribeTicker = ( symbol, listener ) => {
        this._subscribe( new TickerSubscription( this._convertSymbol( symbol ), listener ) );
    };

    /**
     * 取消订阅指定合约的Ticker数据
     * @param {string} symbol 合约名称
     */
    unsubscribeTicker = ( symbol ) => {
        this._unsubscribe( TickerSubscription.buildChannelName( this._convertSymbol( symbol ) ) );
    };

    /**
     * 订阅资产账户变化信息
     */
    subscribeAccount = ( listener ) => {
        this._subscribe( new AccountSubscription( this, listener ) );
    };

    /**
     * 订阅持仓变化消息
     */
    subscribePosition = ( listener ) => {
        this._subscribe( new PositionSubscription( this, listener ) );
    };

    /**
     * 订阅与委托相关的信息
     */
    subscribeOrder = ( listener ) => {
        this._subscribe( new OrderSubscription( this, listener ) );
    };

    /**
     * 订阅用户数据解析成交明细
     */
    subscribeFill = ( listener ) => {
        this._subscribe( new FillSubscription( this, listener ) );
    };

    /**
     * 订阅持仓被动变化信息 目前只支持爆仓类型
     */
    subscribePositionUpdate = ( listener ) => {
        this._subscribe( new PositionUpdateSubscription( this, listener ) );
    };

    /**
     * 取消全部对用户数据的订阅
     */
    unsubscribePrivateChannel = () => {
        this._unsubscribeAllPrivateSubscriptions();
    };

}

class Subscription {

    constructor( listener ) {
        this._listener = listener;
        this._notified = false;
    }

    _decode = ( data ) => {
        console.log( data );
        throw "Not implemented";
    };

    _onData = ( data ) => {
        console.log( data );
        throw "Not implemented";
    };

    _getData = () => {
        throw "Not implemented";
    };

    onMessage = ( msg ) => {
        let obj = this._decode( msg );
        this._onData( obj );
        this._notifyUpdate();
    };

    _notifyUpdate = () => {
        if ( this._notified ) return;
        this._notified = true;
        setImmediate( () => {
            this._listener( this._getData() );
            this._notified = false;
        } );
    };

}

class CandlestickSubscription extends Subscription {

    constructor( symbol, interval, listener ) {
        super( listener );
        this._symbol = symbol;
        this._interval = interval;
        this._data = [];
    }

    _decode = ( obj ) => {
        return JsonUtil.candlestickEventWrapper( obj );
    };

    _onData = ( data ) => {
        this._data.push( ...data );
    };

    _getData = () => {
        let data = JSON.parse( JSON.stringify( this._data ) );
        this._data = [];
        return data;
    };

    static buildChannelName = ( symbol, interval ) => {
        return `${ symbol }_kline_${ interval }`;
    };

    getChannel = () => {
        return CandlestickSubscription.buildChannelName( this._symbol, this._interval );
    };

    toString() {
        return JSON.stringify( {
            sub: this.getChannel(),
        } );
    }

}

class MarketPriceSubscription extends Subscription {

    constructor( symbol, listener ) {
        super( listener );
        this._symbol = symbol;
        this._data = [];
    }

    _decode = ( obj ) => {
        return JsonUtil.marketPriceEventWrapper( obj );
    };

    _onData = ( data ) => {
        this._data.push( ...data );
    };

    _getData = () => {
        let data = JSON.parse( JSON.stringify( this._data ) );
        this._data = [];
        return data;
    };

    static buildChannelName = ( symbol ) => {
        return `${ symbol }TAGPRICE_kline_1min`;
    };

    getChannel = () => {
        return MarketPriceSubscription.buildChannelName( this._symbol );
    };

    toString() {
        return JSON.stringify( {
            sub: this.getChannel(),
        } );
    }

}

class OrderBookSubscription extends Subscription {

    constructor( symbol, listener ) {
        super( listener );
        this._symbol = symbol;
        this._data = {};
        this._asks = {};
        this._bids = {};
    }

    _decode = ( obj ) => {
        if ( !obj.hasOwnProperty( "add" ) ) {
            this._data = JsonUtil.orderBookEventWrapper( obj );
            this._asks = this._data.asks.reduce( ( res, item ) => {
                res[item.price] = item;
                return res;
            }, {} );
            this._bids = this._data.bids.reduce( ( res, item ) => {
                res[item.price] = item;
                return res;
            }, {} );
        } else {
            if ( obj.add.asks ) {
                obj.add.asks.forEach( item => {
                    this._asks[item.price] = { price: item[1], amount: item[0] };
                } );
            }
            if ( obj.add.bids ) {
                obj.add.bids.forEach( item => {
                    this._bids[item.price] = { price: item[1], amount: item[0] };
                } );
            }
            if ( obj.del.asks ) {
                obj.del.asks.forEach( item => {
                    delete this._asks[item[1]];
                } );
            }
            if ( obj.del.bids ) {
                obj.del.bids.forEach( item => {
                    delete this._bids[item[1]];
                } );
            }
            this._data.updateTime = obj.ut;

            this._data.asks = Object.values( this._asks ).sort( ( f, b ) => f.price - b.price );
            this._data.bids = Object.values( this._bids ).sort( ( f, b ) => b.price - f.price );
        }

        return this._data;
    };

    _onData = () => {
        // do nothing
    };

    _getData = () => {
        return JSON.parse( JSON.stringify( this._data ) );
    };

    static buildChannelName = ( symbol ) => {
        return `${ symbol }_depth`;
    };

    getChannel = () => {
        return OrderBookSubscription.buildChannelName( this._symbol );
    };

    toString() {
        return JSON.stringify( {
            sub: this.getChannel(),
        } );
    }

}

class TradeSubscription extends Subscription {

    constructor( symbol, listener ) {
        super( listener );
        this._symbol = symbol;
        this._data = [];
    }

    _decode = ( obj ) => {
        if ( obj.constructor === Array ) {
            return JsonUtil.tradeEventWrapper( obj );
        }else {
            if ( obj.d && obj.d[0] ) {
                return JsonUtil.tradeEventWrapper( obj.d[0], obj.pair );
            }
        }
        return [];
    };

    _onData = ( data ) => {
        this._data.push( ...data );
    };

    _getData = () => {
        let data = JSON.parse( JSON.stringify( this._data ) );
        this._data = [];
        return data;
    };

    static buildChannelName = ( symbol ) => {
        return `${ symbol }_deals`;
    };

    getChannel = () => {
        return TradeSubscription.buildChannelName( this._symbol );
    };

    toString() {
        return JSON.stringify( {
            sub: this.getChannel(),
        } );
    }

}

class TickerSubscription extends Subscription {

    constructor( symbol, listener ) {
        super( listener );
        this._symbol = symbol;
        this._data = {};
    }

    _decode = ( obj ) => {
        return JsonUtil.tickerEventWrapper( obj );
    };

    _onData = ( data ) => {
        this._data = data;
    };

    _getData = () => {
        return this._data;
    };

    static buildChannelName = ( symbol ) => {
        return `${ symbol }_ticker`;
    };

    getChannel = () => {
        return TickerSubscription.buildChannelName( this._symbol );
    };

    toString() {
        return JSON.stringify( {
            sub: this.getChannel(),
        } );
    }

}

class PrivateSubscription extends Subscription {

    static CHANNEL_PREFIX = "ALL_ALL_login"

    constructor( client, listener ) {
        super( listener );
        this._client = client;
    }

    getDataName = () => {
    };

    getChannel = () => {
        return PrivateSubscription.CHANNEL_PREFIX + this.getDataName();
    };

    toString() {
        return JSON.stringify( {
            "apikey": this._client._apiKey,
            "channel": PrivateSubscription.CHANNEL_PREFIX,
            "sign": this._client._buildSubSign()
        } );
    }

}

class AccountSubscription extends PrivateSubscription {

    constructor( client, listener ) {
        super( client, listener );
        this._data = {};
    }

    _decode = ( obj ) => {
        return JsonUtil.accountWrapper( obj );
    };

    _onData = ( data ) => {
        this._data[data.asset] = data;
    };

    _getData = () => {
        let data = JSON.parse( JSON.stringify( this._data ) );
        this._data = {};
        return data;
    };

    getDataName = () => {
        return "contract_assets";
    };

}

class FillSubscription extends PrivateSubscription {

    constructor( client, listener ) {
        super( client, listener );
        this._data = [];
    }

    _decode = ( obj ) => {
        return JsonUtil.fillEventWrapper( obj );
    };

    _onData = ( data ) => {
        this._data.push( data );
    };

    _getData = () => {
        let data = JSON.parse( JSON.stringify( this._data ) );
        this._data = [];
        return data;
    };

    getDataName = () => {
        return "contract_detail";
    };

}

class OrderSubscription extends PrivateSubscription {

    constructor( client, listener ) {
        super( client, listener );
        this._data = {};
    }

    _decode = ( obj ) => {
        return JsonUtil.orderEventWrapper( obj );
    };

    _onData = ( data ) => {
        this._data[data.orderId] = data;
    };

    _getData = () => {
        let data = JSON.parse( JSON.stringify( this._data ) );
        this._data = {};
        return data;
    };

    getDataName = () => {
        return "contract_pending";
    };

}

class PositionSubscription extends PrivateSubscription {

    constructor( client, listener ) {
        super( client, listener );
        this._data = {};
    }

    _decode = ( obj ) => {
        return JsonUtil.positionWrapper( obj );
    };

    _onData = ( data ) => {
        this._data[data.symbol + data.side] = data;
    };

    _getData = () => {
        let data = JSON.parse( JSON.stringify( this._data ) );
        this._data = {};
        return data;
    };

    getDataName = () => {
        return "contract_order";
    };

}

class PositionUpdateSubscription extends PrivateSubscription {

    constructor( client, listener ) {
        super( client, listener );
        this._data = [];
    }

    _decode = ( obj ) => {
        return JsonUtil.PositionUpdateEventWrapper( obj );
    };

    _onData = ( data ) => {
        this._data.push( data );
    };

    _getData = () => {
        let data = JSON.parse( JSON.stringify( this._data ) );
        this._data = [];
        return data;
    };

    getDataName = () => {
        return "contract_deal_log";
    };

}

class JsonUtil {

    static unzip = ( objzip ) => {
        let buf = zlib.unzipSync( Buffer.from( objzip, "base64" ) ).toString();
        return JSON.parse( buf );
    };

    static candlestickEventWrapper = ( obj ) => {
        if ( obj.length > 1 ) {
            let item = obj[1];
            return [ {
                time: item[0],
                open: item[1],
                high: item[2],
                low: item[3],
                close: item[4],
                volume: item[5]
            } ];

        }
        return [];
    };

    static candlestickWrapper = ( obj ) => {
        return obj.map( item => {
            return {
                time: item.time,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                volume: item.vol
            };
        } );
    };

    static orderBookEventWrapper = ( obj ) => {
        let json = {
            symbol: obj.pair,
            updateTime: obj.ut,
            asks: [],
            bids: []
        };
        json.asks = obj.asks.map( item => {
            return {
                price: item[1],
                amount: item[0],
            };
        } );
        json.bids = obj.bids.map( item => {
            return {
                price: item[1],
                amount: item[0],
            };
        } );
        return json;
    };

    static orderBookWrapper = ( obj ) => {
        let json = {
            symbol: obj.pair,
            updateTime: obj.update_time,
            asks: [],
            bids: []
        };
        json.asks = obj.asks.map( item => {
            return {
                price: item.price,
                amount: item.volume,
            };
        } );
        json.bids = obj.bids.map( item => {
            return {
                price: item.price,
                amount: item.volume,
            };
        } );
        return json;
    };

    static marketPriceWrapper = ( obj ) => {
        return obj.map( item => {
            return {
                time: item.time,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
            };
        } );
    };

    static marketPriceEventWrapper = ( obj ) => {
        if ( obj.length > 1 ) {
            let item = obj[1];
            return [ {
                time: item[0],
                open: item[1],
                high: item[2],
                low: item[3],
                close: item[4],
            } ];

        }
        return [];
    }

    static contractsWrapper = ( contract, fundingRate, symbolPrecision ) => {
        let symbolPrecisionMap = symbolPrecision.reduce( ( x, item ) => {
            x[item.pair] = new BigNumber( 0.1 ).pow( item.price_unit ).toNumber();
            return x;
        }, {} );
        return contract.map( item => {
            return {
                symbol: item.pair,
                unit: item.value,
                riskLimitBase: item.risk_level_base,
                riskLimitStep: item.risk_level_dx,
                activeOrderLimit: item.pending_max,
                positionSizeLimit: new BigNumber( item.hold_max ).div( item.value ).toNumber(),
                leverageLimit: item.leverage_max,
                defaultMakerFeeRate: item.maker_fee,
                defaultTakerFeeRate: item.taker_fee,
                priceIncrement: symbolPrecisionMap[item.pair],
                fundingRate: fundingRate[item.pair].fund_rate
            };
        } );
    };

    static contractInfosWrapper = ( fundingRate, markPrice ) => {
        let arr = [];
        for ( const key in markPrice ) {
            arr.push( {
                symbol: key,
                indexPrice: markPrice[key].close,
                markPrice: markPrice[key].priceTag,
                time: new Date( markPrice[key].createdAt ).getTime(),
                fundingRate: fundingRate[key].fund_rate,
            } );
        }
        return arr;
    };

    static accountsWrapper = ( obj ) => {
        return obj.map( item => {
            return JsonUtil.accountWrapper( item );
        } );
    };

    static accountWrapper = ( obj ) => {
        return {
            asset: obj.c,
            available: obj.b,
            isolated:{
                positionMargin: obj.mf,
                orderMargin: obj.ff
            },
            cross:{
                positionMargin: obj.mc,
                orderMargin: obj.fc
            }
        };
    };

    static positionsWrapper = ( obj ) => {
        return obj.map( item => {
            return JsonUtil.positionWrapper( item );
        } );
    };

    static positionWrapper = ( obj ) => {
        return {
            symbol: obj.pi,
            positionMargin: obj.mg,
            marginCallPrice: obj.pa,
            liquidationPrice: obj.pf,
            marginMode: ApiMarginMode.fromInteger( obj.md ),
            side: ApiTradeSide.fromInteger( obj.sd ),
            leverage: obj.l,
            entryPrice: obj.po,
            currentQty: obj.hc,
            closableQty: obj.lc,
            userId: obj.ui
        };
    };

    static positionUpdatesWrapper = ( obj ) => {
        return {
            count: obj.count,
            page: obj.page,
            items: obj.items.map( item => {
                return {
                    id: item.id,
                    symbol: item.pair,
                    side: ApiTradeSide.fromInteger( item.side ),
                    marginMode: ApiMarginMode.fromInteger( item.model ),
                    type: ApiPositionUpdateType.fromInteger( item.log_type ),
                    change: item.hold_coin_dx,
                    currentQty: item.hold_coin,
                    price: item.price_log,
                    entryPrice: item.price_open,
                    profit: item.profit,
                    fee: {
                        value: item.fee,
                        inBix: item.fee_bix,
                        inCoupon: item.fee_bix0,
                    },
                    time: new Date( item.createdAt ).getTime(),
                    userId: item.user_id
                };
            } )
        };
    };

    static fillsWrapper = ( obj, orderId ) => {
        return {
            count: obj.count,
            page: obj.page,
            items: obj.items.map( item => {
                return {
                    id: item.id,
                    orderId: String( orderId ),
                    symbol: item.pair,
                    tradeAction: ApiTradeAction.fromOrderSide( item.side ),
                    tradeSide: ApiTradeSide.fromOrderSide( item.side ),
                    price: item.deal_price,
                    orderPrice: item.price,
                    quantity: item.deal_coin,

                    isMaker: !!item.is_maker,
                    time: new Date( item.createdAt ).getTime(),
                    fee: {
                        value: item.fee,
                        inBix: item.fee_bix,
                        inCoupon: item.fee_bix0,
                    },
                };
            } )
        };
    };

    static ordersWrapper = ( obj ) => {
        return obj.map( item => {
            return {
                clientOrderId: item.client_oid,
                orderId: item.id,
                symbol: item.pair,
                price: item.price,
                quantity: item.amount_coin,
                orderMargin: item.freeze,
                avgPrice: item.price_deal,
                executedQty: item.deal_coin,
                tradeCount: item.deal_num,
                failReason: item.reason,
                fee: {
                    value: item.fee,
                    inBix: item.fee_bix,
                    inCoupon: item.fee_bix0,
                },
                action: ApiTradeAction.fromOrderSide( item.side ),
                side: ApiTradeSide.fromOrderSide( item.side ),
                orderStatus: ApiOrderStatus.fromInteger( item.status ),
                makerFee: item.fee_rate_maker,
                takerFee: item.fee_rate_taker,
                createTime: new Date( item.createdAt ).getTime(),
                updateTime: new Date( item.updatedAt ).getTime(),
                userId: item.user_id
            };
        } );
    };

    static openOrdersWrapper = ( obj ) => {
        return {
            count: obj.t,
            page: obj.p,
            items: obj.o.map( item => this.orderEventWrapper( item ) )
        };
    };
    
    static closedOrdersWrapper = ( obj ) => {
        return {
            count: obj.count,
            page: obj.page,
            items: JsonUtil.ordersWrapper( obj.items )
        };
    };

    static tradeEventWrapper = ( item, pair ) => {
        if ( pair ) {
            return [ {
                symbol: pair,
                side: ApiTradeSide.fromInteger( item[2] ),
                price: item[0],
                quantity: item[1],
                time: item[3]
            } ];
        }

        return [ {
            symbol: item[0],
            side: ApiTradeSide.fromInteger( item[3] ),
            price: item[1],
            quantity: item[2],
            time: item[4]
        } ];

    };

    static tradeWrapper = ( obj ) => {
        return obj.map( item => {
            return {
                symbol: item.pair,
                side: ApiTradeSide.fromInteger( item.side ),
                price: item.price,
                quantity: item.amount,
                time: item.time
            };
        } );
    };

    static tickerEventWrapper = ( obj ) => {
        return {
            symbol: obj[0],
            change: obj[11],
            time: obj[12],
            volume: obj[10],
            price: obj[1],
            priceInCNY: obj[3],
            priceInUSD: obj[2],
            high: obj[4],
            low: obj[5],
            bestAskPrice: obj[8],
            bestAskQty: obj[9],
            bestBidPrice: obj[6],
            bestBidQty: obj[7]
        };
    };

    static tickerWrapper = ( obj ) => {
        return {
            symbol: obj.pair,
            change: obj.percent,
            time: obj.timestamp,
            volume: obj.vol,
            price: obj.last,
            priceInCNY: obj.base_last_cny,
            priceInUSD: obj.last_usd,
            high: obj.high,
            low: obj.low,
            bestAskPrice: obj.sell,
            bestAskQty: obj.sell_amount,
            bestBidPrice: obj.buy,
            bestBidQty: obj.buy_amount
        };
    };

    static fillEventWrapper = ( obj ) => {
        return {
            id: obj.id,
            orderId: obj.oi,
            symbol: obj.pi,
            action: ApiTradeAction.fromOrderSide( obj.sd ),
            price: obj.dp,
            orderPrice: obj.p,
            quantity: obj.ep,
            isMaker: !!obj.im,
            time: obj.t,
            fee: {
                value: obj.f,
                inBix: obj.fb,
                inCoupon: obj.fb0,
            },
        };
    };

    static orderEventWrapper = ( obj ) => {
        return {
            orderId: obj.oi,
            clientOrderId: obj.coi,
            symbol: obj.pi,
            orderMargin: obj.fz,
            createTime: obj.t,
            userId: obj.ui,
            failReason: obj.r,
            quantity: obj.q,
            price: obj.p,
            executedQty: obj.eq,
            avgPrice: obj.dp,
            action: ApiTradeAction.fromOrderSide( obj.sd ),
            side: ApiTradeSide.fromOrderSide( obj.sd ),
            status: ApiOrderStatus.fromInteger( obj.s ),
            fee: {
                value: obj.f,
                inBix: obj.fb,
                inCoupon: obj.fb0,
            },
        };
    };

    static PositionUpdateEventWrapper = ( obj ) => {
        return {
            id: obj.id,
            userId: obj.user_id,
            type: ApiPositionUpdateType.fromInteger( obj.type ),
            marginMode: ApiMarginMode.fromInteger( obj.mode ),
            side: ApiTradeSide.fromInteger( obj.order_side ),
            symbol: obj.pair,
            price: obj.price,
            change: obj.hold_dx,
            time: obj.time
        };
    };

}

module.exports = {
    BiboxFuturesUSDTClient, TimeInterval, TradeSide, MarginMode,
    TradeAction, OrderStatus
};
