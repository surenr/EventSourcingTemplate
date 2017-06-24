describe('All Transaction Service related calls will come here', function(){
    let transactionHandler = require('../handler').transactionCommandHandler;
    it('Can access the main lambda', function(done){
       
        let callback = (error, results) => {
            if(error) throw error;
            expect(results).not.toBeNull();
            done();
        };
        transactionHandler({},{},callback);

    });
    // it('Can call create new transaction action based on the event from the handler', function(done){
       
    //     let callback = (error, results) => {
    //         if(error) throw error;
    //         expect(results).toEqual('AddTransactionDoneIsCalled');
    //         done();
    //     };
    //     transactionHandler({commandCode: 'cmdAddNewTransaction'},{},callback);

    // })
})