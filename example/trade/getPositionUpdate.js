const { BiboxFuturesUSDTClient } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "2038c3a2d4c1d0a38394c8e7472578557d054111";
const secretKey = "4dafc3c1d18a6f9dff293cf59e732f7617637111";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

getPositionUpdates = async () => {
    try {
        let psUpdates = await client.getPositionUpdates( "ETH_USDT", 1, 10 );
        console.log( psUpdates );
        // {
        //     count: 11,
        //     page: 1,
        //     items: [
        //     {
        //         id: '1125899906868660258',
        //         symbol: '4ETH_USDT',
        //         side: 'LONG',
        //         marginMode: 'CROSS',
        //         type: 'LIQUIDATE',            // 变化类型
        //         change: '-104.0000000000',    // 持仓变化量
        //         currentQty: '0.0000000000',   // 持仓数量
        //         price: '581.8873125516',
        //         entryPrice: '592.8824813839', // 开仓均价
        //         profit: '-0.0035798986',      // 收益
        //         fee: {
        //              value:"0",
        //              inBix:"0",                 // bix抵扣
        //              inCoupon:"0"               // 优惠卷抵扣
        //         }
        //         time: 1607084140000,
        //         userId: 11966257
        //     },...
        // }
    }catch ( e ) {
        console.log( e );
    }
};
getPositionUpdates();
