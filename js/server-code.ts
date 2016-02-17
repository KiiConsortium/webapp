///<reference path="./kii-cloud.sdk.d.ts"/>
declare var Promise;

function createMember(params : any, context : any, done : any) {
    var targetGroup : KiiGroup;
    var company : KiiObject;
    var createdUser : KiiUser;
    var createdAccount : KiiObject;
    var phase = 'login';
    KiiUser.authenticateWithToken(context.getAccessToken()).then((u : KiiUser) => {
        phase = 'get groupList';
        return u.memberOfGroups();
    }).then((args : any) => {
        phase = 'check group';
        var list : Array<KiiGroup> = args[1];
        for (var i = 0 ; i < list.length ; ++i) {
            if (params.groupId == list[i].getUUID()) {
                targetGroup = list[i];
            }
        }
        if (targetGroup == null) {
            return Promise.reject('This user is not in this group');
        }
        phase = 'get group';
        var uri = 'kiicloud://buckets/company/objects/' + params.groupId;
        var obj = KiiObject.objectWithURI(uri);
        return obj.refresh();
    }).then((o : KiiObject) => {
        company = o;
        phase = 'register';
        var user = KiiUser.userWithEmailAddress(params.email, params.password);
        return user.register();
    }).then((u : KiiUser) => {
        createdUser = u;
        phase = 'create account object';
        // create account object
        var uri = 'kiicloud://buckets/account/objects/' + u.getUUID();
        var obj = KiiObject.objectWithURI(uri);
        obj.set('name', params.name);
        obj.set('organization', company.get('name'));
        obj.set('thumbnail_url', '');
        obj.set('desc', '');
        return obj.saveAllFields(null, true);
    }).then((o : KiiObject) => {
        createdAccount = o;
        phase = 'add member';
        // login as Admin
        var admin = context.getAppAdminContext();
        var group = admin.groupWithID(params.groupId);
        group.addUser(createdUser);
        return group.save();
    }).then((g : KiiGroup) => {
        done({
            code : 0,
            msg : 'account created',
            account : {
                id : createdAccount.getUUID(),
                name : createdAccount.get('name'),
                organization : createdAccount.get('organization'),
                thumbnail_url : createdAccount.get('thumbnail_url'),
                desc : createdAccount.get('desc'),
            }
        });
    }).catch((error : string) => {
        done({code:-1000,msg:error,phase:phase});
    });
}