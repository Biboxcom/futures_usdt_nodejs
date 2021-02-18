const { BiboxFuturesUSDTClient } = require( "../../biboxFuturesUSDTClient" );
const client = new BiboxFuturesUSDTClient();

subscribeMarketPrice = () => {
    client.subscribeMarketPrice( "BTC_USDT", ( data ) => {
        console.log(  data );
        // [
        //     {
        //         time: 1607582940000,
        //         open: '18352.28124909',
        //         high: '18354.83518741',
        //         low: '18350.212711',
        //         close: '18354.83518741'
        //     },
        //     {
        //         time: 1607583000000,
        //         open: '18354.54366092',
        //         high: '18367.0465191',
        //         low: '18354.54366092',
        //         close: '18366.34863568'
        //     }
        // ]
    } );

};
subscribeMarketPrice();
