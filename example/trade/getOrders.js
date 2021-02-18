const { BiboxFuturesUSDTClient, TradeSide, TradeAction  } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "2038c3a2d4c1d0a38394c8e7472578557d054111";
const secretKey = "4dafc3c1d18a6f9dff293cf59e732f7617637111";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

getOrders = async () => {
    try {
        let order = await client.getOrder( "35184377957292" );
        console.log( order );
        // {
        //     clientOrderId: 0,             // 用户自定义id
        //     orderId: 35184377957292,      // 订单id
        //     symbol: '4ETH_USDT',
        //     price: '479.2200000000',      // 价格
        //     quantity: '10.0000000000',    // 挂单数量
        //     orderMargin: '0.0000000000',
        //     avgPrice: '472.6900000000',   // 平均成交价
        //     executedQty: '10.0000000000', // 已成交数量
        //     tradeCount: 1,                // 成交次数
        //     failReason: 0,
        //     fee: {
        //         value: '0.0000116355',      // 手续费数量
        //         inBix: '0.0000000000',      // bix抵扣数量
        //         inCoupon: '0.0000000000'    // 优惠数量
        //     },
        //     action: 'ENTRY',                 // 开仓或平仓
        //     side: 'LONG',                    // 订单方向
        //     orderStatus: 'FILLED',           // 订单状态
        //     makerFee: '0.0002000000',
        //     takerFee: '0.0005500000',
        //     createTime: 1605784674000,
        //     updateTime: 1605784674000,
        //     userId: 11966257
        // }

        let orders = await client.getOrders( [ "35184377957292", "39582455765897" ] );
        console.log( orders );

        let open = await client.getOpenOrders( "BTC_USD", 1, 10, TradeSide.SHORT, TradeAction.ENTRY );
        console.log( open );
        
        let closed = await client.getClosedOrders( "", 1, 10 );
        console.log( closed );

    }catch ( e ) {
        console.log( e );
    }
};
getOrders();
