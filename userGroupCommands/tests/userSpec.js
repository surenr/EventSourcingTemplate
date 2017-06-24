describe('Test User Group and Users Related Services', () => {
    const awsHandler = require('../handler');
    const AddNewUserAction = require('../libs/actions/addNewUser');
    const AddNewGroupAction = require('../libs/actions/addNewGroup');
    const UpdateUserAction = require('../libs/actions/updateNewUser');
    const UserLoginAction = require('../libs/actions/loginUser');

    const uuidv4 = require('uuid/v4');
    const util = require('util');
    let addNewUserWorker;
    let addNewGroupWorker;
    let updateUserWorker;
    let userLoginWorker;

    beforeEach(function (done) {
        addNewUserWorker = new AddNewUserAction();
        addNewGroupWorker = new AddNewGroupAction();
        updateUserWorker = new UpdateUserAction();
        userLoginWorker = new UserLoginAction();
        done();
    });

    afterAll(function (done) {
        let dbService = require('mongoose');
        let userSchema = require('../libs/domain/users');
        let userGroupSchema = require('../libs/domain/user-group');
        let activeUserSchema = require('../libs/domain/loggedInUser');

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
            const ActiveUserModel = dbService.model('ActiveUsers', activeUserSchema);

            promiseArray.push(new Promise((resolve, reject) => {
                ActiveUserModel.collection.drop(() => {
                    db.close((error) => {
                        if (error) reject(error);
                        resolve();
                    })
                });
            }));

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
        updateUserWorker = null;
        userLoginWorker = null;
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

    let insertedFirstGroup;
    let insertedSecondGroup;


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
                        insertedFirstGroup = returnObject;
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
            newUserData.groupId = insertedFirstGroup.groupId;
            newUserData.entityId = insertedFirstGroup.entityId;
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
                        expect(returnObject.groupId).toEqual(insertedFirstGroup.groupId);
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

    describe('Update User of to Existing Group', function () {
        let insertedUserData;
        let userToUpdate = {
            firstName: 'Kamal',
            lastName: 'Perera',
        };
        it('Add a new group so that we can add users', (done) => {
            let dbService = require('mongoose');
            let userGroupSchema = require('../libs/domain/user-group');
            dbService.connect('mongodb://localhost:27017/tradeItEvent');
            const db = dbService.connection;
            newGroupData.groupId = uuidv4();
            newGroupData.groupName = "Clark";

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
                        insertedSecondGroup = returnObject;
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
            newUserData.groupId = insertedSecondGroup.groupId;
            newUserData.entityId = insertedSecondGroup.entityId;
            newUserData.email = 'kamal@gmail.com';

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
                        expect(returnObject.groupId).toEqual(insertedSecondGroup.groupId);
                        expect(returnObject.email).toEqual('kamal@gmail.com');
                        insertedUserData = returnObject;
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

        it('Update user information for a given user under an existing group', (done) => {
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
                    id: insertedUserData._id,
                    payload: userToUpdate,
                    dbService: dbService,
                    userGroupSchema: userGroupSchema,
                    userSchema: userSchema,
                }

                updateUserWorker.on('done', (returnObject) => {
                    db.close((error) => {
                        if (error) throw error;
                        expect(returnObject.firstName).toEqual('Kamal');
                        expect(returnObject.lastName).toEqual('Perera');
                        insertedUserData = returnObject;
                        done();
                    })
                });

                updateUserWorker.on('error', (updateUserError) => {
                    db.close((error) => {
                        if (error) throw error;
                        fail(updateUserError);
                        done();
                    })
                })
                updateUserWorker.perform('cmdUpdateUser', paramContext);
            });
        });

        it('Update user group under the same company', (done) => {
            let dbService = require('mongoose');
            let userGroupSchema = require('../libs/domain/user-group');
            let userSchema = require('../libs/domain/users');
            userToUpdate.groupId = insertedFirstGroup.groupId;
            userToUpdate.entityId = insertedFirstGroup.entityId;
            dbService.connect('mongodb://localhost:27017/tradeItEvent');
            const db = dbService.connection;
            db.on('error', () => {
                throw new Error('Connection Error');
            });
            db.once('open', () => {
                let paramContext = {
                    id: insertedUserData._id,
                    payload: userToUpdate,
                    dbService: dbService,
                    userGroupSchema: userGroupSchema,
                    userSchema: userSchema,
                }

                updateUserWorker.on('done', (returnObject) => {
                    db.close((error) => {
                        if (error) throw error;
                        expect(returnObject.groupId).toEqual(insertedFirstGroup.groupId);
                        insertedUserData = returnObject;
                        done();
                    })
                });

                updateUserWorker.on('error', (updateUserError) => {
                    db.close((error) => {
                        if (error) throw error;
                        fail(updateUserError);
                        done();
                    })
                })
                updateUserWorker.perform('cmdUpdateUser', paramContext);
            });
        });

        it('People can login to the system', (done) => {
            let dbService = require('mongoose');
            let userGroupSchema = require('../libs/domain/user-group');
            let userSchema = require('../libs/domain/users');
            let activeUserSchema = require('../libs/domain/loggedInUser');


            dbService.connect('mongodb://localhost:27017/tradeItEvent');
            const db = dbService.connection;
            db.on('error', () => {
                throw new Error('Connection Error');
            });
            db.once('open', () => {
                let paramContext = {
                    email: insertedUserData.email,
                    password: 'intel@123',
                    dbService: dbService,
                    userGroupSchema: userGroupSchema,
                    userSchema: userSchema,
                    activeUserSchema: activeUserSchema,
                };
                userLoginWorker.on('done', (activeUserObject) => {
                    db.close((error) => {
                        if (error) throw error;
                        expect(activeUserObject.token).not.toBeNull();
                        expect(activeUserObject.validTill - activeUserObject.generatedOn).toEqual(1800000);
                        done();
                    })
                });

                userLoginWorker.on('error', (activeUserError) => {
                    db.close((error) => {
                        if (error) throw error;
                        fail(activeUserError);
                        done();
                    });
                });
                userLoginWorker.perform('cmdLoginUser', paramContext);
            });
        });
    });





});
