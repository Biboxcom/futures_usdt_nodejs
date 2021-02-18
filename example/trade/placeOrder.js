const { BiboxFuturesUSDTClient, TradeSide, TradeAction  } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "2038c3a2d4c1d0a38394c8e7472578557d054111";
const secretKey = "4dafc3c1d18a6f9dff293cf59e732f7617637111";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

placeOrder = async () => {
    try {

        let orderId = await client.placeLimitOrder( {
            symbol: "ETH_USDT",
            quantity: 1,
            price: 490,
            tradeSide: TradeSide.LONG,
            tradeAction: TradeAction.ENTRY
        } );
        console.log( orderId );

    }catch ( e ) {
        console.log( e );
    }
};
placeOrder();
