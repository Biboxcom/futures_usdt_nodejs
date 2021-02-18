const { BiboxFuturesUSDTClient } = require( "../../biboxFuturesUSDTClient" );
const client = new BiboxFuturesUSDTClient();

subscribeOrderBook = () => {
    client.subscribeOrderBook( "BTC_USDT", ( data ) => {
        console.log( "BTC ask1", data.asks[0] );
        console.log( "BTC bid1", data.bids[0] );
    } );

    client.subscribeOrderBook( "ETH_USDT", ( data ) => {
        console.log( "ETH ask1", data.asks[0] );
        console.log( "ETH bid1", data.bids[0] );
    } );

    client.subscribeOrderBook( "LINK_USDT", ( data ) => {
        console.log( "LINK ask1", data.asks[0] );
        console.log( "LINK bid1", data.bids[0] );
    } );

    client.subscribeOrderBook( "EOS_USDT", ( data ) => {
        console.log( "EOS ask1", data.asks[0] );
        console.log( "EOS bid1", data.bids[0] );
    } );
};
subscribeOrderBook();
