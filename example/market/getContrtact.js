const { BiboxFuturesUSDTClient } = require( "../../biboxFuturesUSDTClient" );
const client = new BiboxFuturesUSDTClient();

getContracts = async () => {
    try {
        let contracts = await client.getContracts();
        console.log( contracts );

        let contract  = await client.getContract( "BTC_USDT" );
        console.log( contract );
        //     {
        //         symbol: '4BTC_USDT',
        //         unit: '1.0000000000',                 // 面值
        //         riskLimitBase: '50000.0000000000',    // 基础风险限额
        //         riskLimitStep: '300000.0000000000',   // 风险限额步长
        //         activeOrderLimit: 100,                // 最大委托数量
        //         positionSizeLimit: 1000000,           // 最大张数
        //         leverageLimit: '150.0000000000',      // 最大杠杆
        //         defaultMakerFeeRate: '0.0002000000',  // 默认的maker手续费率
        //         defaultTakerFeeRate: '0.0005500000',  // 默认的taker手续费率
        //         priceIncrement: 0.1,                  // 最小委托价格
        //         fundingRate: '0.0005330000'           // 资金费率
        //     }

    } catch ( e ) {
        console.log( e );
    }
};
getContracts();
