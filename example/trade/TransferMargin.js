const { BiboxFuturesUSDTClient, TradeSide } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "2038c3a2d4c1d0a38394c8e7472578557d054111";
const secretKey = "4dafc3c1d18a6f9dff293cf59e732f7617637111";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

transferMargin = async () => {
    try {
        await client.transferMargin( "ETH_USDT", TradeSide.LONG, 1 );

    }catch ( e ) {
        console.log( e );
    }
};
transferMargin();
