
<h1 align="center">Welcome to Bibox Futures USDT Client 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-v1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> Bibox平台U本位合约Nodejs版本SDK

### 🏠 [Homepage](https://futures.bibox.me/zh/futures)

## Dependency

```sh
需要 node v14+
```

## Usage

```sh
// 新建客户端对象 公开的api可以不传apiKey与secretKey
const { BiboxFuturesUSDTClient  } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "Your apiKey";
const secretKey = "Your secretKey";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

// 公开的api 获取kline
let res = await client.getCandlestick( "BTC_USD", TimeInterval.DAILY, 10 );
console.log( res );

// 用户的api 转入或转出合约账户
await client.transferIn( "ETH", 0.0001 );
await client.transferOut( "ETH", 0.0001 );

// 用户的api 下单
let orderId2 = await client.placeLimitOrder( {
    symbol: "ETH_USDT",
    quantity: 1,
    price: 490,
    tradeSide: TradeSide.LONG,
    tradeAction: TradeAction.ENTRY
} );
console.log( orderId2 );

// 公开的订阅 订阅kline
client.subscribeCandlestick( "BTC_USDT", TimeInterval.ONE_MINUTE, ( data ) => {
    console.log( "BTC_USDT", data );
} );

// 用户的订阅 用户资产数据
client.subscribeAccount(  ( data ) => {
    console.log( data );
} );

// 更多的可以参考测试用例
```

## Author

👤 **Biboxcom**

* Website: https://github.com/Biboxcom
* Github: [@Biboxcom](https://github.com/Biboxcom)

## Show your support

Give a ⭐️ if this project helped you!


