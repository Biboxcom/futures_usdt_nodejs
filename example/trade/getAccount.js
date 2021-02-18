const { BiboxFuturesUSDTClient } = require( "../../biboxFuturesUSDTClient" );
const apiKey = "2038c3a2d4c1d0a38394c8e7472578557d054111";
const secretKey = "4dafc3c1d18a6f9dff293cf59e732f7617637111";
const client = new BiboxFuturesUSDTClient( apiKey, secretKey );

getAccount = async () => {
    try {
        let accounts = await client.getAccounts();
        console.log( accounts );

        let account = await client.getAccount( "ETH" );
        console.log( account );
        // {
        //     asset: 'LTC',
        //     available: '0.198015884', // 可用
        //     cross :{
        //           orderMargin: '0',         // 挂单冻结
        //           positionMargin: '0'       // 仓位保证金
        //     }
        //     isolated :{
        //           orderMargin: '0',         // 挂单冻结
        //           positionMargin: '0'       // 仓位保证金
        //     }
        // }

    }catch ( e ) {
        console.log( e );
    }
};
getAccount();
