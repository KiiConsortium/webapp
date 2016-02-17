///<reference path="./AccountDAO.ts"/>
///<reference path="./CompanyDAO.ts"/>
///<reference path="./kii-cloud.sdk.d.ts"/>

declare var models;

class AccountDAOImpl implements AccountDAO {
    companyDAO : CompanyDAO;
    cache : any;

    constructor(companyDAO : CompanyDAO) {
        this.companyDAO = companyDAO;
    }

    login(email : string, password : string, callback : (e : any, account : Account, companyList : Array<Company>) => void) {
        KiiUser.authenticate(email, password, {
            success : (user : KiiUser) => {
                this.getData(user.getUUID(), callback);
            },
            failure : (user : KiiUser, error : string) => {
                callback(error, null, null);
            }
        });
    }

    loginWithStoredToken(callback : (e : any, account : Account, companyList : Array<Company>) => void) {
        var token = localStorage.getItem('token');
        if (token == null || token.length == 0) {
            callback('stored token not found', null, null);
            return;
        }
        KiiUser.authenticateWithToken(token, {
            success : (user : KiiUser) => {
                this.getData(user.getUUID(), callback);
            },
            failure : (user : KiiUser, error : string) => {
                callback(error, null, null);
            }
        });
    }

    private getData(id : string, callback : (e : any, account : Account, companyList : Array<Company>) => void) {
        var bucket = Kii.bucketWithName('account');
        var query = new KiiQuery();
        var resultList : Array<Account> = [];
        var queryCallback = {
            success : (q : KiiQuery, result : Array<KiiObject>, next : KiiQuery) => {
                if (this.cache == null) { this.cache = {}; }
                for (var i = 0 ; i < result.length ; ++i) {
                    var obj = result[i];
                    this.cache[obj.getUUID()] = this.toAccount(obj);
                }
                this.getCompany(id, callback);
            },
            failure : (b : KiiBucket, error : string) => {
                callback(error, null, null);
            }
        };
        bucket.executeQuery(query, queryCallback);
    }

    private getCompany(id : string, callback : (e : any, account : Account, companyList : Array<Company>) => void) {
        this.companyDAO.getAll((e : any, list : any) => {
            if (e != null) {
                callback(e, null, null);
                return;
            }
            this.getJoinedCompany(id, callback);
        });
    }

    private getJoinedCompany(id : string, callback : (e : any, account : Account, companyList : Array<Company>) => void) {
        var user = KiiUser.getCurrentUser();
        user.memberOfGroups({
            success : (u : KiiUser, list : Array<KiiGroup>) => {
                var companyList : Array<Company> = [];
                for (var i = 0 ; i < list.length ; ++i) {
                    var group = list[i];
                    companyList.push(this.companyDAO.getCacheById(group.getUUID()));
                }
                // save access token
                localStorage.setItem('token', KiiUser.getCurrentUser().getAccessToken());
                callback(null, this.cache[id], companyList);
            },
            failure : (u : KiiUser, error : string) => {
                callback(error, null, null);
            }
        });
    }

    getAll(callback : (e : any, list : Array<Account>) => void) {
        if (this.cache != null) {
            callback(null, this.toArray());
            return;
        }
        var bucket = Kii.bucketWithName('account');
        var query = new KiiQuery();
        var resultList : Array<Account> = [];
        var queryCallback = {
            success : (q : KiiQuery, result : Array<KiiObject>, next : KiiQuery) => {
                for (var i = 0 ; i < result.length ; ++i) {
                    var obj = result[i]
                    resultList.push(this.toAccount(obj));
                }
                callback(null, resultList);
            },
            failure : (b : KiiBucket, error : string) => {
                callback(error, null);
            }
        };
        bucket.executeQuery(query, queryCallback);
    }

    getById(id : string, callback : (e : any, account : Account) => void) {
        var account = this.cache[id];
        if (account.email != null) {
            callback(null, account);
            return;
        }
        var uri = 'kiicloud://users/' + id;
        var user = KiiUser.userWithID(id);
        user.refresh({
            success : (u : KiiUser) => {
                account.email = u.getEmailAddress();
                callback(null, account);
            },
            failure : (u : KiiUser, error : string) => {
                callback(error, null);
            }
        });
    }

    getByIdList(idList : Array<string>, callback : (e : any, list : Array<Account>) => void) {
        var bucket = Kii.bucketWithName('account');
        var query = KiiQuery.queryWithClause(KiiClause.inClause('_id', <any[]>idList));
        var resultList : Array<Account> = [];

        var queryCallback = {
            success : (q : KiiQuery, result : Array<KiiObject>, next : KiiQuery) => {
                for (var i = 0 ; i < result.length ; ++i) {
                    var obj = result[i]
                    resultList.push(this.toAccount(obj));
                }
                callback(null, resultList);
            },
            failure : (b : KiiBucket, error : string) => {
                callback(error, null);
            }
        };
        bucket.executeQuery(query, queryCallback);        
    }

    update(account : Account, name : string, organization : string, thumbnail : string,
           description : string, callback : (e : any, account : Account) => void) {
        var uri = 'kiicloud://buckets/account/objects/' + account.id;
        var obj = KiiObject.objectWithURI(uri);
        obj.set('name', name);
        obj.set('organization', organization);
        obj.set('thumbnail_url', thumbnail);
        obj.set('desc', description);
        obj.save({
            success : (o : KiiObject) => {
                account.name = name;
                account.organization = organization;
                account.thumbnailUrl = thumbnail;
                account.description = description;
                callback(null, account);
            },
            failure : (o : KiiObject, error : string) => {
                callback(error, account);
            }
        }, true);
    }

    changeEmail(email : string, callback : (e : any) => void) {
        var user = KiiUser.getCurrentUser();
        user.changeEmail(email, {
            success : (u : KiiUser) => {
                callback(null);
            },
            failure : (u : KiiUser, error : string) => {
                callback(error);
            }
        });
    }

    changePassword(oldPass : string, newPass : string, callback : (e : any) => void) {
        var user = KiiUser.getCurrentUser();
        user.updatePassword(oldPass, newPass, {
            success : (u : KiiUser) => {
                callback(null);
            },
            failure : (u : KiiUser, error : string) => {
                callback(error);
            }
        });
    }

    private toAccount(obj : KiiObject) : Account {
        var a = new Account();
        a.id = obj.getUUID();
        a.name = <string>obj.get('name');
        a.organization = <string>obj.get('organization');
        a.thumbnailUrl = <string>obj.get('thumbnail_url');
        a.description = <string>obj.get('desc');
        return a;
    }

    private toArray() : Array<Account> {
        var list : Array<Account> = [];
        for (var key in this.cache) {
            list.push(this.cache[key]);
        }
        return list;
    }
}