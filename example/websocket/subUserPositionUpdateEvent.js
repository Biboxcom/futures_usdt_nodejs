const { BiboxFuturesUSDTClient  } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "your apiKey";
const secretKey = "your secretKey";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

subscribePositionUpdate = () => {
    client.subscribePositionUpdate(  ( data ) => {
        console.log( data );
        // []
    } );
};
subscribePositionUpdate();
