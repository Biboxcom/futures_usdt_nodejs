const { BiboxFuturesUSDTClient } = require( "../../biboxFuturesUSDTClient" );
const client = new BiboxFuturesUSDTClient();

subscribeOrderBook = () => {
    client.subscribeOrderBook( "BTC_USDT", ( data ) => {
        console.log( "BTC ask1", data.asks[0] );
        console.log( "BTC bid1", data.bids[0] );
    } );

};
subscribeOrderBook();
