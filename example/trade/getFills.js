const { BiboxFuturesUSDTClient  } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "2038c3a2d4c1d0a38394c8e7472578557d054111";
const secretKey = "4dafc3c1d18a6f9dff293cf59e732f7617637111";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

getFills = async () => {
    try {
        let fills = await client.getFills( "35184377957292" );
        console.log( fills );
        // {
        //     count: 1,
        //     page: 1,
        //     items: [
        //     {
        //         id: '1125899906853443005',
        //         orderId: '35184377957292',
        //         symbol: '4ETH_USDT',
        //         tradeAction: 'ENTRY',          // 开仓或平仓
        //         tradeSide: 'LONG',             // 成交方向
        //         price: '472.6900000000',       // 成交价格
        //         orderPrice: '479.2200000000',  // 挂单价格
        //         quantity: '10.0000000000',     // 成交数量
        //         isMaker: false,
        //         time: 1605784674000,
        //         fee: {
        //              value:"0",
        //              inBix:"0",                 // bix抵扣
        //              inCoupon:"0"               // 优惠卷抵扣
        //         }
        //     }
        // ]
        // }

    }catch ( e ) {
        console.log( e );
    }
};
getFills();
