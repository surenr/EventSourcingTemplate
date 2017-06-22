describe('Test User Group and Users Related Services', () => {
    const awsHandler = require('../handler');
    const addNewGroupAction = require('../libs/actions/addNewGroup');
    const newGroupData = {
        groupName: 'Manager',
        entityId: '38483948394839',
        allowedServices: ['Transaction:*','Documents:*','Buyer:*','Seller:*'],
        
    }

    it('Miro service handler is accessible', () => {
        expect(awsHandler.userGroupCommandHandler).toBeDefined();
    });

    it('Action Exists to create a new user group', () => {
        expect(addNewGroupAction).toBeTruthy();
        expect(addNewGroupAction.perform).toEqual(jasmine.any(Function));
    });

    it('Make sure addNewGroupAction perform method get the correct parameters', () => {
        spyOn(addNewGroupAction,'perform').andCallFake(()=>{
            expect(arguments[0]).toEqual(newGroupData);
        });
        awsHandler.userGroupCommandHandler();
        expect(addNewGroupAction.perform).toHaveBeenCalled();
    });
});
