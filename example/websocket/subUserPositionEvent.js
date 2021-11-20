const { BiboxFuturesUSDTClient  } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "your apiKey";
const secretKey = "your secretKey";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

subscribePosition = () => {
    client.subscribePosition(  ( data ) => {
        console.log( data );
        // []
    } );
};
subscribePosition();
