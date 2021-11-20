const { BiboxFuturesUSDTClient  } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "your apiKey";
const secretKey = "your secretKey";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

subscribeOrder = () => {
    client.subscribeOrder(  ( data ) => {
        console.log( data );
        // []
    } );
};
subscribeOrder();
