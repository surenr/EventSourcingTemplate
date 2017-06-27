let dbService = require('mongoose');
const uuidv4 = require('uuid/v4');
const sysConfig = require('../commonServices/configService');
let entityDenormalizedSchema = require('../libs/domain/entity-denorm.js');
let EntityDenormalizer = require('../libs/events/entityDenormalizer');
let EntityDenormModel = dbService.model('EntityDenorm', entityDenormalizedSchema);
let entityId = uuidv4();
let registeredDate = new Date();
const entityDenormalizerCommandCode = `cmdAddNewEntity${sysConfig.SYSTEM.DENORMALIZER_POSTFIX}`;
let entityDenorm = new EntityDenormModel({
    entityId,
    type: 'Company',
    name: 'ABC Company',
    registered_date: registeredDate,
    registration_number: '2983948',
    country: 'Sri Lanka'
});

let entityDenormalizer;
let lastWrittenEntity = null;

beforeEach(function (done) {
    entityDenormalizer = new EntityDenormalizer(sysConfig.ACTION_TYPES.QUERY_TEST);
    done();
});

afterAll(function (done) {
    let dbService = require('mongoose');
    let entityDenormalizedSchema = require('../libs/domain/entity-denorm.js');
    dbService.connect(sysConfig.DB.CONNECTION_STRING_TESTS_QUERY);
    const db = dbService.connection;
    db.on('error', () => {
        throw new Error('Connection Error');
    });
    db.once('open', () => {
        console.log('Trying to remove User group collection')
        let EntityDenormModel = dbService.model('EntityDenorm', entityDenormalizedSchema);
        EntityDenormModel.collection.drop(() => {
            db.close((error) => {
                if (error) throw error;
                done();
            })
        })
    });
});

afterEach(function (done) {
    entityDenormalizer = null;
    done();
});



describe('Test the denormalizer workers to ensure they write the data to the query db', function () {
    describe('Test denormalizer functionality for Entity', function () {
        it('Can Instantiate De-normalized Entity Model', function () {
            expect(entityDenormalizedSchema).toEqual(jasmine.any(dbService.Schema));
        });
        it('Entity Denormzlized Schema contains the minimal required properties', function () {

            expect(entityDenorm.entityId).toEqual(entityId);
            expect(entityDenorm.type).toEqual('Company');
            expect(entityDenorm.name).toEqual('ABC Company');
            expect(entityDenorm.registered_date).toEqual(registeredDate);
            expect(entityDenorm.registration_number).toEqual('2983948');
            expect(entityDenorm.country).toEqual('Sri Lanka');
        });

        it('Can Instantiate Entity Denormalizer', function () {
            expect(entityDenormalizer).not.toBeNull();
        });

        it('With the wrong payload, Denormalizer will validate and throw erros and will not create new record', function (done) {
            
            let paramContext = {
                payload: {
                    entityId: uuidv4(),
                    type: 'ErrorType',
                    name: 'ABC Company',
                    registered_date: registeredDate,
                    registration_number: '2983948',
                    country: 'Sri Lanka'
                },
                dbService: dbService,
                entityDenormSchema: entityDenormalizedSchema
            };

            entityDenormalizer.on('done', (returnObject) => {
                fail('Test Passing when it should fail.')
                done();
            })
            entityDenormalizer.on('error', (error) => {
                console.log(error);
                expect(error.errors.type['message']).toEqual('InvalidType');
                done();
            });

            entityDenormalizer.perform(entityDenormalizerCommandCode, paramContext);
        });


        it('With the correct paramContext, Denormalizer will create a new record in the database', function (done) {
            let paramContext = {
                payload: entityDenorm,
                dbService: dbService,
                entityDenormSchema: entityDenormalizedSchema
            };
            entityDenormalizer.on('done', (returnObject) => {

                expect(returnObject).toBeTruthy();
                expect(returnObject.type).toEqual(entityDenorm.type);
                expect(returnObject.name).toEqual(entityDenorm.name);
                lastWrittenEntity = returnObject;
                done();
            })
            entityDenormalizer.on('error', (error) => {
                fail(error);
                console.error('Failed when it should pass');
                done();
            });

            entityDenormalizer.perform(entityDenormalizerCommandCode, paramContext);
        });

        it('With the correct paramContext, Denormalizer will update the record in the database', function (done) {
            lastWrittenEntity.name = 'XYZ Company';
            lastWrittenEntity.registration_number = '123456789';
            let paramContext = {
                payload: lastWrittenEntity,
                dbService: dbService,
                entityDenormSchema: entityDenormalizedSchema
            };

            entityDenormalizer.on('done', (returnObject) => {

                expect(returnObject).toBeTruthy();
                expect(returnObject.type).toEqual(entityDenorm.type);
                expect(returnObject.name).toEqual('XYZ Company');
                expect(returnObject.registration_number).toEqual('123456789');
                lastWrittenEntity = returnObject;
                done();
            })
            entityDenormalizer.on('error', (error) => {
                fail(error);
                console.error('Failed when it should pass');
                done();
            });

            entityDenormalizer.perform(entityDenormalizerCommandCode, paramContext);
        });

        it('With the wrong payload, Denormalizer will validate and throw erros and will not update an existing record', function (done) {
            lastWrittenEntity.name = 'XYZ Company';
            lastWrittenEntity.registration_number = '';
            let paramContext = {
                payload: lastWrittenEntity,
                dbService: dbService,
                entityDenormSchema: entityDenormalizedSchema
            };

            entityDenormalizer.on('done', (returnObject) => {
                fail('Test Passing when it should fail.')
                done();
            })
            entityDenormalizer.on('error', (error) => {
                console.log(error);
                expect(error.errors.registration_number['message']).toEqual('NoRegistrationNumber');
                done();
            });

            entityDenormalizer.perform(entityDenormalizerCommandCode, paramContext);
        });

    });
});