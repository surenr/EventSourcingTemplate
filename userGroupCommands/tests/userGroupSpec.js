describe('Test User Group and Users Related Services', () => {
    const awsHandler = require('../handler');
    const AddNewGroupAction = require('../libs/actions/addNewGroup');
    let worker = new AddNewGroupAction();

    const sinon = require('sinon');

    const newGroupData = {
        groupName: 'Manager',
        entityId: '38483948394839',
        allowedServices: ['Transaction:*', 'Documents:*', 'Buyer:*', 'Seller:*'],

    };

    const lambdaHandlerEvent = JSON.stringify({
        payload: newGroupData
    });

    it('Miro service handler is accessible', () => {
        expect(awsHandler.userGroupCommandHandler).toBeDefined();
    });
    describe('Add New User Group Action Tests', function () {
        it('Action Exists to create a new user group', () => {
            expect(worker).toBeTruthy();
            expect(worker.perform).toEqual(jasmine.any(Function));
        });

        it('Make sure the AddNewGroupAction emit reject event if the command code is not a match', (done) => {
            worker.on('reject', (commandCode) => {
                expect(commandCode).toEqual('cmdAddNewUser');
                done();
            });
             let paramContext = {
                payload: newGroupData,
               
            }
            worker.perform('cmdAddNewUser', paramContext);
        });

        it('AddNewGroupAction emit done event when the operation is completed with the results', (done) => {

            worker.on('done', (returnObject) => {
                expect(returnObject).toBeTruthy();
                done();
            })
            let paramContext = {
                payload: newGroupData,
               
            }
            worker.perform('cmdAddNewGroup', paramContext);
        });

        it('AddNewGroupAction emit error event when an exception is thrown by any operation within the action', (done) => {
            worker.on('error', (error) => {
                expect(error).toEqual(jasmine.any(Error));
                done();
            })
            worker.perform('cmdAddNewGroup', null);
        });

        it('UserGroup Model is accessible ', () => {
            const mongoose = require('mongoose');
            const UserGroupModel = require('../libs/domain/user-group');
            let userGroupModel = new UserGroupModel();
            expect(userGroupModel).toEqual(jasmine.any(mongoose.Model));
        });

        it('AddNewGroupAction will add a new group with the correct data', (done)=>{
            let dbService = require('mongoose');
            let userGroupModel = require('../libs/domain/user-group');
            let paramContext = {
                payload: newGroupData,
                dbService: dbService,
                userGroupModel: userGroupModel
            }
             worker.on('done', (returnObject) => {
                expect(returnObject).toBeTruthy();
                done();
            })
            worker.perform('cmdAddNewGroup', paramContext);
        })

    });


});
