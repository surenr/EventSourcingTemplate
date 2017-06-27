let dbService = require('mongoose');
const uuidv4 = require('uuid/v4');
let userGroupDenormalizerSchema = require('../libs/domain/user-group-denorm.js');
let UserGroupDenormalizer = require('../libs/events/userGroupDenormalizer.js');
let UserGroupDenormModel = dbService.model('UserGroupDenorm', userGroupDenormalizerSchema);
let groupId = uuidv4();
let entityId = uuidv4();
let userGroupDenorm = new UserGroupDenormModel({
    groupId,
    groupName: 'Test Group',
    entityId,
    entityName: 'ABC Company',
    allowedActions: ['Transaction:*', 'Documents:*', 'Buyer:*', 'Seller:*'],
});

describe('Test the denormalizer1 workers to ensure they write the data to the query db', function () {
    describe('Test denormalizer functionality for User groups', function () {
        it('Can Instantiate De-normalized User Group Model', function () {
            expect(userGroupDenormalizerSchema).toEqual(jasmine.any(dbService.Schema));
        });
        it('UserGroup Denormzlized Schema contains the minimal required properties', function () {

            expect(userGroupDenorm.groupId).toEqual(groupId);
            expect(userGroupDenorm.groupName).toEqual('Test Group');
            expect(userGroupDenorm.entityId).toEqual(entityId);
            expect(userGroupDenorm.entityName).toEqual('ABC Company');
        });
        it('Can Instantiate User Group Denormalizer', function () {
            expect(UserGroupDenormalizer).not.toBeNull();
        });

        it('Can successfully update the query db when the correct param context is given', function(){
            // let paramContext = {
            //     payload: entityPayload,
            //     dbService: dbService,
            //     entitySchema: entitySchema
            // }
            pending('Need to write the entity denormalizer first');
        })
    });
});