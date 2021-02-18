const { BiboxFuturesUSDTClient } = require( "../../biboxFuturesUSDTClient" );
const client = new BiboxFuturesUSDTClient();

subscribeTrade = () => {
    client.subscribeTrade( "BTC_USDT", ( data ) => {
        console.log( data[0] );
        // {
        //     symbol: '4BTC_USDT',
        //     side: 'SHORT',
        //     price: '18340.1',
        //     quantity: '7875',
        //     time: 1607583162936
        // }
    } );

};
subscribeTrade();
