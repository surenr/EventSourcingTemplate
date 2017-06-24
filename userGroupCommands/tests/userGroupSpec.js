describe('Test User Group and Users Related Services', () => {
    const awsHandler = require('../handler');
    const AddNewGroupAction = require('../libs/actions/addNewGroup');
    const UpdateUserGroup = require('../libs/actions/updateNewGroup');
    const uuidv4 = require('uuid/v4');
    const util = require('util');
    const CONNECTION_STRING = 'mongodb://usrtradeitdb:tradeituserPa$$wd@SG-TradeIT-10478.servers.mongodirector.com:27017/tradeit';
    let addNewGroupWorker;
    let updateUserGroupWorker;
    beforeEach(function (done) {
        addNewGroupWorker = new AddNewGroupAction();
        updateUserGroupWorker = new UpdateUserGroup()
        done();
    });

    afterAll(function (done) {
        let dbService = require('mongoose');
        let userGroupSchema = require('../libs/domain/user-group');
        dbService.connect(CONNECTION_STRING);
        const db = dbService.connection;
        db.on('error', () => {
            throw new Error('Connection Error');
        });
        db.once('open', () => {
            console.log('Trying to remove User group collection')
            const UserGroupModel = dbService.model('UserGroups', userGroupSchema);
            UserGroupModel.collection.drop(() => {
                db.close((error) => {
                    if (error) throw error;
                    done();
                })
            })
        });
    });

    afterEach(function (done) {
        addNewGroupWorker = null;
        updateUserGroupWorker = null;
        done();
    });

    const sinon = require('sinon');

    let newGroupData = {
        groupId: uuidv4(),
        groupName: 'Manager',
        entityId: uuidv4(),
        allowedActions: ['Transaction:*', 'Documents:*', 'Buyer:*', 'Seller:*'],

    };

    const lambdaHandlerEvent = JSON.stringify({
        payload: newGroupData
    });

    it('Miro service handler is accessible', () => {
        expect(awsHandler.userGroupCommandHandler).toBeDefined();
    });
    describe('Add New User Group Action Tests', function () {
        it('Action Exists to create a new user group', () => {
            expect(addNewGroupWorker).toBeTruthy();
            expect(addNewGroupWorker.perform).toEqual(jasmine.any(Function));
        });

        it('Make sure the AddNewGroupAction emit reject event if the command code is not a match', (done) => {
            addNewGroupWorker.on('reject', (commandCode) => {
                expect(commandCode).toEqual('cmdAddNewUser');
                done();
            });
            let paramContext = {
                payload: newGroupData,

            }
            addNewGroupWorker.perform('cmdAddNewUser', paramContext);
        });


        it('AddNewGroupAction emit error event when an exception is thrown by any operation within the action', (done) => {
            addNewGroupWorker.on('error', (error) => {
                expect(error).toEqual(jasmine.any(Error));
                done();
            })
            addNewGroupWorker.perform('cmdAddNewGroup', null);
        });

        it('UserGroup Model is accessible ', () => {
            const mongoose = require('mongoose');
            const userGroupModel = require('../libs/domain/user-group');
            expect(userGroupModel).toEqual(jasmine.any(mongoose.Schema));
        });


        it('AddNewGroupAction will validate data', (done) => {
            let dbService = require('mongoose');
            let userGroupSchema = require('../libs/domain/user-group');

            dbService.connect(CONNECTION_STRING);
            const db = dbService.connection;
            db.on('error', () => {
                throw new Error('Connection Error');
            });
            db.once('open', () => {
                let paramContext = {
                    payload: {
                        groupId: '',
                        groupName: 'Manager',
                        entityId: uuidv4(),
                        allowedActions: ['Transaction:*', 'Documents:*', 'Buyer:*', 'Seller:*'],

                    },
                    dbService: dbService,
                    userGroupSchema: userGroupSchema
                }

                addNewGroupWorker.on('error', (returnObject) => {

                    db.close((error) => {
                        if (error) throw error;
                        expect(returnObject.errors['groupId'].message).toEqual('NoGroupId');
                        done();
                    })
                })

                addNewGroupWorker.perform('cmdAddNewGroup', paramContext);
            })


        });

        it('AddNewGroupAction will add a new group with the correct data', (done) => {
            let dbService = require('mongoose');
            let userGroupSchema = require('../libs/domain/user-group');

            dbService.connect(CONNECTION_STRING);
            const db = dbService.connection;
            db.on('error', () => {
                throw new Error('Connection Error');
            });
            db.once('open', () => {
                let paramContext = {
                    payload: newGroupData,
                    dbService: dbService,
                    userGroupSchema: userGroupSchema
                }

                addNewGroupWorker.on('done', (returnObject) => {

                    db.close((error) => {
                        if (error) throw error;
                        expect(returnObject).toBeTruthy();
                        done();
                    })
                })
                addNewGroupWorker.perform('cmdAddNewGroup', paramContext);
            })


        });

        describe('Test Adding Existing Records will be rejected', function () {
            it('Adding the First Test Success', (done) => {
                let dbService = require('mongoose');
                let userGroupSchema = require('../libs/domain/user-group');
                dbService.connect(CONNECTION_STRING);
                const db = dbService.connection;
                db.on('error', () => {
                    throw new Error('Connection Error');
                });
                db.once('open', () => {
                    let paramContext = {
                        payload: {
                            groupId: uuidv4(),
                            groupName: 'Manager',
                            entityId: 12345,
                            allowedActions: ['Transaction:*', 'Documents:*', 'Buyer:*', 'Seller:*'],

                        },
                        dbService: dbService,
                        userGroupSchema: userGroupSchema
                    }
                    addNewGroupWorker.on('done', (returnObj) => {
                        db.close((error) => {
                            if (error) throw error;
                            expect(returnObj.entityId).toEqual("12345");
                            done()
                        })
                    })
                    addNewGroupWorker.perform('cmdAddNewGroup', paramContext);
                });
            });

            it('Adding Existing User groups under the same entity will throw an error', (done) => {
                let dbService = require('mongoose');
                let userGroupSchema = require('../libs/domain/user-group');
                dbService.connect(CONNECTION_STRING);
                const db = dbService.connection;
                db.on('error', () => {
                    throw new Error('Connection Error');
                });
                db.once('open', () => {
                    let paramContext = {
                        payload: {
                            groupId: uuidv4(),
                            groupName: 'Manager',
                            entityId: 12345,
                            allowedActions: ['Transaction:*', 'Documents:*', 'Buyer:*', 'Seller:*'],

                        },
                        dbService: dbService,
                        userGroupSchema: userGroupSchema
                    }
                    addNewGroupWorker.on('error', (performError) => {
                        db.close((error) => {
                            if (error) throw error;
                            expect(true).toEqual(true);
                            done()
                        })
                    })
                    addNewGroupWorker.perform('cmdAddNewGroup', paramContext);
                });
            });

        });

    });

    describe('Test Updating an existing group', function () {
        const newGroup = {
            groupId: uuidv4(),
            groupName: 'Clark',
            entityId: uuidv4(),
            allowedActions: ['Transaction:*', 'Documents:*'],
        };

        const updatePayload = {
            groupName: 'Manager',
            allowedActions: ['Transaction:*', 'Documents:*', 'Buyer:*', 'Seller:*']
        };

        let groupToUpdate = null;
        it('Adding the new group', function (done) {
            let dbService = require('mongoose');
            let userGroupSchema = require('../libs/domain/user-group');
            dbService.connect(CONNECTION_STRING);
            const db = dbService.connection;
            db.on('error', () => {
                throw new Error('Connection Error');
            });

            db.once('open', () => {
                let paramContext = {
                    payload: newGroup,
                    dbService: dbService,
                    userGroupSchema: userGroupSchema
                }

                addNewGroupWorker.on('done', (returnObj) => {
                    db.close((error) => {
                        if (error) throw error;
                        expect(returnObj.groupName).toEqual("Clark");
                        groupToUpdate = returnObj;
                        done()
                    })
                })
                addNewGroupWorker.perform('cmdAddNewGroup', paramContext);
            });
        });

        it('Update the group', function (done) {
            let dbService = require('mongoose');
            let userGroupSchema = require('../libs/domain/user-group');
            dbService.connect(CONNECTION_STRING);
            const db = dbService.connection;
            db.on('error', () => {
                throw new Error('Connection Error');
            });

            db.once('open', () => {
                let paramContext = {
                    id: groupToUpdate._id,
                    payload: updatePayload,
                    dbService: dbService,
                    userGroupSchema: userGroupSchema
                }

                updateUserGroupWorker.on('done', (returnObj) => {
                    db.close((error) => {
                        if (error) throw error;
                        expect(returnObj.groupName).toEqual("Manager");
                        expect(returnObj.allowedActions.length).toEqual(4);
                        done()
                    })
                })
                updateUserGroupWorker.perform('cmdUpdateGroup', paramContext);
            });
        });


    })


});
