const { BiboxFuturesUSDTClient  } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "2038c3a2d4c1d0a38394c8e7472578557d054111";
const secretKey = "4dafc3c1d18a6f9dff293cf59e732f7617637111";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

subscribeAccount = () => {
    client.subscribeAccount(  ( data ) => {
        console.log( data );
        // {
        //  LTC:{
        //     asset: 'LTC',
        //     available: '0.198015884', // 可用
        //     orderMargin: '0',         // 挂单冻结
        //     positionMargin: '0'       // 仓位保证金
        //  },...
        // }
    } );

};
subscribeAccount();


















