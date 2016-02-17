///<reference path="./CompanyDAO.ts"/>
///<reference path="./kii-cloud.sdk.d.ts"/>

class CompanyDAOImpl implements CompanyDAO {
    cache : any;

    getAll(callback : (e : any, list : Array<Company>) => void) {
        if (this.cache != null) {
            callback(null, this.toArray());
            return;
        }
        var bucket = Kii.bucketWithName('company');
        var query = new KiiQuery();
        var resultList : Array<Company> = [];

        var queryCallback = {
            success : (q : KiiQuery, result : Array<KiiObject>, next : KiiQuery) => {
                if (this.cache == null) { this.cache = {}; }
                for (var i = 0 ; i < result.length ; ++i) {
                    var obj = result[i]
                    this.cache[obj.getUUID()] = this.toCompany(obj);
                }
                callback(null, this.toArray());
            },
            failure : (b : KiiBucket, error : string) => {
                callback(error, null);
            }
        };
        bucket.executeQuery(query, queryCallback);
    }

    getCacheById(id : string) : Company {
        if (this.cache == null) { return null; }
        return this.cache[id];
    }

    getById(id : string, callback : (e : any, company : Company) => void) {
        if (this.cache != null) {
            var c = this.cache[id];
            if (c != null) {
                callback(null, c);
            }
        }
        var uri = 'kiicloud://buckets/company/objects/' + id;
        var obj = KiiObject.objectWithURI(uri);
        obj.refresh({
            success : (o : KiiObject) => {
                var company = this.toCompany(o);
                this.addToCache(company);
                callback(null, company);
            },
            failure : (o : KiiObject, error : string) => {
                callback(error, null);
            }
        });        
    }

    getMembers(company : Company, accountDAO : AccountDAO, callback : (e : any, company : Company) => void) {
        var group = KiiGroup.groupWithID(company.id);
        group.getMemberList({
            success : (g : KiiGroup, list : Array<KiiUser>) => {
                this.refreshMembers(company, accountDAO, list, callback);
            },
            failure : (g : KiiGroup, error : string) => {
                callback(error, null);
            }
        });
    }

    private refreshMembers(company : Company, accountDAO : AccountDAO, list : Array<KiiUser>, callback : (e : any, company : Company) => void) {
        var idList : Array<string> = [];
        for (var i = 0 ; i < list.length ; ++i) {
            idList.push(list[i].getUUID());
        }
        if (idList.length == 0) {
            company.members = [];
            callback(null, company);
            return;
        }
        accountDAO.getByIdList(idList, (e : any, accountList : Array<Account>) => {
            if (e != null) {
                callback(e, null);
                return;
            }
            company.members = accountList;
            callback(null, company);
        });
    }

    update(company : Company, name : string, url : string, thumbnail : string,
           description : string, callback : (e : any, company : Company) => void) {
        var uri = 'kiicloud://buckets/company/objects/' + company.id;
        var obj = KiiObject.objectWithURI(uri);
        obj.set('name', name);
        obj.set('url', url);
        obj.set('thumbnail_url', thumbnail);
        obj.set('desc', description);
        obj.save({
            success : (o : KiiObject) => {
                company.name = name;
                company.url = url;
                company.thumbnailUrl = thumbnail;
                company.description = description;
                callback(null, company);
            },
            failure : (o : KiiObject, error : string) => {
                callback(error, company);
            }
        }, true);
    }

    addMember(company : Company, name : string, email : string, password : string, callback : (e : any, company : Company) => void) {
        var entry = Kii.serverCodeEntry("createMember");
        var params = {
            groupId : company.id,
            name : name,
            email : email,
            password : password,
        };
        entry.execute(params, {
            success : (entry : KiiServerCodeEntry, args : any, result : KiiServerCodeExecResult) => {
                var vals = result.getReturnedValue();
                if (vals["returnedValue"].code == 0) {                    
                    // clear member cache
                    company.members = null;
                    // add this user to cache
                    var a = vals["returnedValue"].account;
                    var account = new Account();
                    account.id = a.id
                    account.name = a.name;
                    account.organization = a.organization;
                    account.thumbnailUrl = a.thumbnail_url;
                    account.description = a.desc;
                    models.account.cache[account.id] = account;
                    callback(null, company);
                } else {
                    callback('failed', null);
                }
            },
            failure : (entry : KiiServerCodeEntry, args : any, result : KiiServerCodeExecResult, error : string) => {
                callback(error, null);
            }
        });
    }

    private toCompany(obj : KiiObject) : Company {
        var c = new Company();
        c.id = obj.getUUID();
        c.name = <string>obj.get('name');
        c.url = <string>obj.get('url');
        c.thumbnailUrl = <string>obj.get('thumbnail_url');
        c.description = <string>obj.get('desc');
        return c;
    }

    private toArray() : Array<Company> {
        var list : Array<Company> = [];
        for (var key in this.cache) {
            list.push(this.cache[key]);
        }
        return list;
    }

    private addToCache(c : Company) {
        if (this.cache == null) { this.cache = {}; }
        this.cache[c.id] = c;
    }
}