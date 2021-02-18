const { BiboxFuturesUSDTClient, MarginMode, TradeSide } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "2038c3a2d4c1d0a38394c8e7472578557d054111";
const secretKey = "4dafc3c1d18a6f9dff293cf59e732f7617637111";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

changeMarginMode = async () => {
    try {
        await client.changeMarginMode( "ETH_USDT", MarginMode.ISOLATED );

        await client.changeLeverage( "ETH_USDT", TradeSide.LONG, 12 );

    } catch ( e ) {
        console.log( e );
    }
};
changeMarginMode();
