const { BiboxFuturesUSDTClient } = require( "../../biboxFuturesUSDTClient" );
const client = new BiboxFuturesUSDTClient();

getContractInfos = async () => {
    try {
        let contractInfos = await client.getContractInfos();
        console.log( contractInfos );

        let contractInfo = await client.getContractInfo( "BTC_USDT" );
        console.log( contractInfo );
        //     {
        //         symbol: '4BTC_USDT',
        //         indexPrice: '18329.1557395900', //指数价格
        //         markPrice: '18331.5980995923',  // 标记价格
        //         time: 1607581378000,
        //         fundingRate: '0.0005330000'     // 资金费率
        //     }

    } catch ( e ) {
        console.log( e );
    }
};
getContractInfos();