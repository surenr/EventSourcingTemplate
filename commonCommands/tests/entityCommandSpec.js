const dbService = require('mongoose');
const uuidv4 = require('uuid/v4');
const sysConfig = require('../commonServices/configService');
const entitySchema = require('../libs/domain/entities.js');

let EntityModel = dbService.model('Entity', entitySchema);
let entityId = uuidv4();
let entityRegDate = new Date();
let entityPayload = {
    entityId: entityId,
    type: 'Company',
    name: 'XYZ Company',
    registered_date: entityRegDate,
    registration_number: '388393293',
    country: 'Sri Lanka'
};
let entity = new EntityModel(entityPayload)
const AddNewEntityWorker = require('../libs/actions/addNewEntity.js');
const UpdateEntityWorker = require('../libs/actions/updateEntity.js');
let updateEntityWorker;
let addNewEntityWorker;
const CONNECTION_STRING = sysConfig.DB.CONNECTION_STRING_TESTS;
let lastChangedEntity;
beforeEach(function (done) {
    addNewEntityWorker = new AddNewEntityWorker(sysConfig.ACTION_TYPES.COMMAND_TEST);
    updateEntityWorker = new UpdateEntityWorker(sysConfig.ACTION_TYPES.COMMAND_TEST);
    done();
});

afterAll(function (done) {
    let dbService = require('mongoose');
    let entitySchema = require('../libs/domain/entities.js');
    dbService.connect(CONNECTION_STRING);
    const db = dbService.connection;
    db.on('error', () => {
        throw new Error('Connection Error');
    });
    db.once('open', () => {
        console.log('Trying to remove User group collection')
        const EntityModel = dbService.model('Entity', entitySchema);
        EntityModel.collection.drop(() => {
            db.close((error) => {
                if (error) throw error;
                done();
            })
        })
    });
});

afterEach(function (done) {
    addNewEntityWorker = null;
    updateEntityWorker = null;
    done();
});

describe('Test all Entity Commands', function () {

    describe('Test Initialization', function () {
        it('Can Instantiate the schema for entity', function () {
            expect(entitySchema).toEqual(jasmine.any(dbService.Schema));
        });
        it('Entity Schema Structure has the minimal required properties', function () {
            expect(entity.entityId).toEqual(entityId);
            expect(entity.type).toEqual('Company');
            expect(entity.name).toEqual('XYZ Company');
            expect(entity.registered_date).toEqual(entityRegDate);
            expect(entity.registration_number).toEqual('388393293');
            expect(entity.country).toEqual('Sri Lanka');
        })

        it('Can Instantiate the AddNewEntityWorker', function () {

            expect(addNewEntityWorker).not.toBeNull();
        })
    });

    describe('Test Entity CRUD Operations', function () {
        it('Having the correct payload will add a new entity', function (done) {
            let paramContext = {
                payload: entityPayload,
                dbService: dbService,
                entitySchema: entitySchema,
                sequence: uuidv4(),
            }
            addNewEntityWorker.on('done', (returnObject) => {
                expect(returnObject).toBeTruthy();
                lastChangedEntity = returnObject;
                done();
            })
            addNewEntityWorker.perform('cmdAddNewEntity', paramContext);
        })

        it('Can edit the entity', function (done) {
            
            let paramContext = {
                id: lastChangedEntity._id,
                payload: {
                    type: 'bank',
                    name: 'Good Will',
                    registered_date: new Date(),
                    registration_number: '323223',
                    country: 'Australia'
                },
                dbService: dbService,
                entitySchema: entitySchema,
                sequence: uuidv4(),
            };
            updateEntityWorker.on('done', (returnObject)=> {
                console.log(returnObject);
                expect(returnObject.type).toEqual('bank');
                expect(returnObject.entityId).toEqual(entityId);
                lastChangedEntity = returnObject;
                done();
            })
            updateEntityWorker.perform('cmdUpdateEntity', paramContext);

        })
    })
});