describe('Test User Group and Users Related Services', () => {
    const awsHandler = require('../handler');
    const AddNewUserAction = require('../libs/actions/addNewUser');
    const AddNewGroupAction = require('../libs/actions/addNewGroup');

    const uuidv4 = require('uuid/v4');
    const util = require('util');
    let addNewUserWorker;
    let addNewGroupWorker;
    beforeEach(function (done) {
        addNewUserWorker = new AddNewUserAction();
        addNewGroupWorker = new AddNewGroupAction();
        done();
    });

    afterAll(function (done) {
        let dbService = require('mongoose');
        let userSchema = require('../libs/domain/users');
        let userGroupSchema = require('../libs/domain/user-group');
        dbService.connect('mongodb://localhost:27017/tradeItEvent');
        const db = dbService.connection;
        let promiseArray = [];
        db.on('error', () => {
            throw new Error('Connection Error');
        });
        db.once('open', () => {
            console.log('Trying to remove User  collection')
            const UserModel = dbService.model('Users', userSchema);
            const UserGroupModel = dbService.model('UserGroups', userGroupSchema);
            promiseArray.push(new Promise((resolve, reject) => {
                UserModel.collection.drop(() => {
                    db.close((error) => {
                        if (error) reject(error);
                        resolve();
                    })
                });
            }));

            promiseArray.push(new Promise((resolve, reject) => {
                UserGroupModel.collection.drop(() => {
                    db.close((error) => {
                        if (error) reject(error);
                        resolve();
                    })
                });
            }));

            Promise.all(promiseArray).then(() => done());


        });
    });

    afterEach(function (done) {
        addNewWorker = null;
        done();
    });

    const sinon = require('sinon');

    let newUserData = {
        userId: uuidv4(),
        groupId: uuidv4(),
        email: 'surenr@99x.lk',
        entityId: uuidv4(),
        firstName: 'Suren',
        lastName: 'Rodrigo',
        password: 'intel@123',
    };

    let newGroupData = {
        groupId: uuidv4(),
        groupName: 'Manager',
        entityId: uuidv4(),
        allowedActions: ['Transaction:*', 'Documents:*', 'Buyer:*', 'Seller:*'],

    };

    let insertedGroupData;


    describe('Add New User to Existing Group', function () {

        it('Add a new group so that we can add users', (done) => {
            let dbService = require('mongoose');
            let userGroupSchema = require('../libs/domain/user-group');
            dbService.connect('mongodb://localhost:27017/tradeItEvent');
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
                        insertedGroupData = returnObject;
                        done();
                    })
                })
                addNewGroupWorker.perform('cmdAddNewGroup', paramContext);
            });
        });

        it('Add a new user to the group', (done) => {
            let dbService = require('mongoose');
            let userGroupSchema = require('../libs/domain/user-group');
            let userSchema = require('../libs/domain/users');
            newUserData.groupId = insertedGroupData.groupId;
            newUserData.entityId = insertedGroupData.entityId;
            dbService.connect('mongodb://localhost:27017/tradeItEvent');
            const db = dbService.connection;
            db.on('error', () => {
                throw new Error('Connection Error');
            });
            db.once('open', () => {
                let paramContext = {
                    payload: newUserData,
                    dbService: dbService,
                    userGroupSchema: userGroupSchema,
                    userSchema: userSchema,
                }

                addNewUserWorker.on('done', (returnObject) => {
                    db.close((error) => {
                        if (error) throw error;
                        expect(returnObject.groupId).toEqual(insertedGroupData.groupId);
                        expect(returnObject.email).toEqual('surenr@99x.lk');
                        done();
                    })
                });

                addNewUserWorker.on('error', (addNewUserError) => {
                    db.close((error) => {
                        if (error) throw error;
                        fail(addNewUserError);
                        done();
                    })
                })
                addNewUserWorker.perform('cmdAddNewUser', paramContext);
            });
        });
    });

    describe('Ensure user adding validation is in place', function () {
        it('Attempting to add a user for none existing group will throw and error', function (done) {
            let dbService = require('mongoose');
            let userGroupSchema = require('../libs/domain/user-group');
            let userSchema = require('../libs/domain/users');
            dbService.connect('mongodb://localhost:27017/tradeItEvent');
            const db = dbService.connection;
            db.on('error', () => {
                throw new Error('Connection Error');
            });
            db.once('open', () => {
                let paramContext = {
                    payload: newUserData,
                    dbService: dbService,
                    userGroupSchema: userGroupSchema,
                    userSchema: userSchema,
                }

                addNewUserWorker.on('done', (returnObject) => {
                    db.close((error) => {
                        if (error) throw error;
                        fail('Test Successful when it should fail');
                        done();
                    })
                });

                addNewUserWorker.on('error', (errorAddUser) => {
                    db.close((error) => {
                        if (error) throw error;
                        expect(errorAddUser).toEqual(jasmine.any(Error));
                        done();
                    })
                })
                addNewUserWorker.perform('cmdAddNewUser', paramContext);
            });
        });

        it('Attempting to add a user with invalid email will throw an error', function (done) {
            let dbService = require('mongoose');
            let userGroupSchema = require('../libs/domain/user-group');
            let userSchema = require('../libs/domain/users');
            dbService.connect('mongodb://localhost:27017/tradeItEvent');
            const db = dbService.connection;
            db.on('error', () => {
                throw new Error('Connection Error');
            });
            newUserData.email = 'skdsllsldks';
            db.once('open', () => {
                let paramContext = {
                    payload: newUserData,
                    dbService: dbService,
                    userGroupSchema: userGroupSchema,
                    userSchema: userSchema,
                }

                addNewUserWorker.on('done', (returnObject) => {
                    db.close((error) => {
                        if (error) throw error;
                        fail('Test Successful when it should fail');
                        done();
                    })
                });

                addNewUserWorker.on('error', (errorAddUser) => {
                    db.close((error) => {
                        if (error) throw error;
                        expect(errorAddUser.errors['email'].message).toEqual('InvalidEmail');
                        done();
                    })
                })
                addNewUserWorker.perform('cmdAddNewUser', paramContext);
            });
        });

        it('Attempting to add a user with empty email will throw an error', function (done) {
            let dbService = require('mongoose');
            let userGroupSchema = require('../libs/domain/user-group');
            let userSchema = require('../libs/domain/users');
            dbService.connect('mongodb://localhost:27017/tradeItEvent');
            const db = dbService.connection;
            db.on('error', () => {
                throw new Error('Connection Error');
            });
            newUserData.email = '';
            db.once('open', () => {
                let paramContext = {
                    payload: newUserData,
                    dbService: dbService,
                    userGroupSchema: userGroupSchema,
                    userSchema: userSchema,
                }

                addNewUserWorker.on('done', (returnObject) => {
                    db.close((error) => {
                        if (error) throw error;
                        fail('Test Successful when it should fail');
                        done();
                    })
                });

                addNewUserWorker.on('error', (errorAddUser) => {
                    db.close((error) => {
                        if (error) throw error;
                        expect(errorAddUser.errors['email'].message).toEqual('NoEmail');
                        done();
                    })
                })
                addNewUserWorker.perform('cmdAddNewUser', paramContext);
            });
        })
    });




});
