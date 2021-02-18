const { BiboxFuturesUSDTClient } = require( "../../biboxFuturesUSDTClient" );
const client = new BiboxFuturesUSDTClient();

getOrderBook = async () => {
    try {
        let res = await client.getOrderBook( "BTC_USDT", 200 );
        console.log( res );
        // {
        //     symbol: '4BTC_USDT',
        //     updateTime: 1607581724243,
        //     asks: [
        //     { price: '18298.5', amount: '5050' },
        //     { price: '18298.6', amount: '805' },
        //     ...
        //     ],
        //     bids: [
        //     ....
        //     ]
        // }

    } catch ( e ) {
        console.log( e );
    }
};
getOrderBook();
