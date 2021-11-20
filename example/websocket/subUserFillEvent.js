const { BiboxFuturesUSDTClient  } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "your apiKey";
const secretKey = "your secretKey";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

subscribeFill = () => {
    client.subscribeFill(  ( data ) => {
        console.log( data );
        // []
    } );
};
subscribeFill();
