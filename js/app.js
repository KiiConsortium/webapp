var Account = (function () {
    function Account() {
    }
    return Account;
})();
///<reference path="./Account.ts"/>
var Company = (function () {
    function Company() {
    }
    return Company;
})();
///<reference path="./Account.ts"/>
///<reference path="./Company.ts"/>
///<reference path="./AccountDAO.ts"/>
var TopPage = (function () {
    function TopPage(app, accountDAO) {
        this.app = app;
        this.accountDAO = accountDAO;
    }
    TopPage.prototype.loginRequired = function () {
        return false;
    };
    TopPage.prototype.onCreate = function () {
        var _this = this;
        var token = localStorage.getItem('token');
        if (token == null || token.length == 0) {
            this.onCreateView();
            return;
        }
        // login with token
        this.accountDAO.loginWithStoredToken(function (e, account, companyList) {
            if (e != null) {
                _this.onCreateView();
                return;
            }
            _this.app.setCurrentAccount(account, companyList);
            _this.app.navigate('/conferences');
        });
    };
    TopPage.prototype.onCreateView = function () {
        var _this = this;
        this.ractive = new Ractive({
            el: '#container',
            template: '#TopTemplate'
        });
        this.ractive.on({
            'login': function () {
                _this.login();
            }
        });
        this.app.setDrawerEnabled(false);
    };
    TopPage.prototype.login = function () {
        var _this = this;
        var email = this.ractive.get('email');
        var password = this.ractive.get('password');
        this.accountDAO.login(email, password, function (e, account, companyList) {
            if (e != null) {
                _this.app.addSnack(e);
                return;
            }
            _this.app.setCurrentAccount(account, companyList);
            _this.app.navigate('/conferences');
        });
    };
    return TopPage;
})();
var Conference = (function () {
    function Conference() {
    }
    return Conference;
})();
///<reference path="./Conference.ts"/>
/// <reference path="./ConferenceDAO.ts"/>
var ConferenceListPage = (function () {
    function ConferenceListPage(app, conferenceDAO) {
        this.app = app;
        this.conferenceDAO = conferenceDAO;
    }
    ConferenceListPage.prototype.loginRequired = function () {
        return true;
    };
    ConferenceListPage.prototype.onCreate = function () {
        var _this = this;
        this.conferenceDAO.getAll(function (e, list) {
            if (e != null) {
                window.history.back();
                return;
            }
            _this.list = list;
            _this.onCreateView();
        });
    };
    ConferenceListPage.prototype.onCreateView = function () {
        this.ractive = new Ractive({
            el: '#container',
            template: '#ConferenceListTemplate',
            data: {
                list: this.list
            }
        });
        this.app.setDrawerEnabled(true);
        this.app.setTitle('カンファレンス');
    };
    return ConferenceListPage;
})();
///<reference path="./Company.ts"/>
///<reference path="./CompanyDAO.ts"/>
var CompanyListPage = (function () {
    function CompanyListPage(app, companyDAO) {
        this.app = app;
        this.companyDAO = companyDAO;
    }
    CompanyListPage.prototype.loginRequired = function () {
        return true;
    };
    CompanyListPage.prototype.onCreate = function () {
        var _this = this;
        this.app.setDrawerEnabled(true);
        this.app.setTitle('企業');
        this.companyDAO.getAll(function (e, list) {
            if (e != null) {
                return;
            }
            _this.list = list;
            _this.onCreateView();
        });
    };
    CompanyListPage.prototype.onCreateView = function () {
        var _this = this;
        this.ractive = new Ractive({
            el: '#container',
            template: '#CompanyListTemplate',
            data: {
                list: this.list,
                toShort: function (s) {
                    if (s.length < 20) {
                        return s;
                    }
                    else {
                        return s.substr(0, 20) + '...';
                    }
                }
            }
        });
        this.ractive.on({
            companyClicked: function (e, company) {
                _this.showDetail(company);
            }
        });
    };
    CompanyListPage.prototype.showDetail = function (company) {
        app.navigate('/companies/' + company.id);
    };
    return CompanyListPage;
})();
///<reference path="./AccountDAO.ts"/>
///<reference path="./CompanyDAO.ts"/>
var CompanyDetailPage = (function () {
    function CompanyDetailPage(app, accountDAO, companyDAO, id) {
        this.app = app;
        this.accountDAO = accountDAO;
        this.companyDAO = companyDAO;
        this.id = id;
    }
    CompanyDetailPage.prototype.loginRequired = function () {
        return true;
    };
    CompanyDetailPage.prototype.onCreate = function () {
        var _this = this;
        this.companyDAO.getById(this.id, function (e, company) {
            if (e != null) {
                window.history.back();
                return;
            }
            _this.company = company;
            _this.getMembers();
        });
    };
    CompanyDetailPage.prototype.getMembers = function () {
        var _this = this;
        if (this.company.members != null) {
            this.onCreateView();
            return;
        }
        this.companyDAO.getMembers(this.company, this.accountDAO, function (e, company) {
            if (e != null) {
                window.history.back();
                return;
            }
            _this.company = company;
            _this.onCreateView();
        });
    };
    CompanyDetailPage.prototype.onCreateView = function () {
        var _this = this;
        this.ractive = new Ractive({
            el: '#container',
            template: '#CompanyDetailTemplate',
            data: {
                company: this.company,
                memberList: this.company.members,
                toShort: function (s) {
                    if (s.length < 20) {
                        return s;
                    }
                    else {
                        return s.substr(0, 20) + '...';
                    }
                }
            }
        });
        this.ractive.on({
            memberClicked: function (e, member) {
                _this.showDetail(member);
            }
        });
        this.app.setDrawerEnabled(false);
        this.app.showBackButton();
    };
    CompanyDetailPage.prototype.showDetail = function (member) {
        app.navigate('/members/' + member.id);
    };
    return CompanyDetailPage;
})();
///<reference path="./AccountDAO.ts"/>
var MemberListPage = (function () {
    function MemberListPage(app, accountDAO) {
        this.app = app;
        this.accountDAO = accountDAO;
    }
    MemberListPage.prototype.loginRequired = function () {
        return true;
    };
    MemberListPage.prototype.onCreate = function () {
        var _this = this;
        this.accountDAO.getAll(function (e, list) {
            if (e != null) {
                window.history.back();
                return;
            }
            _this.list = list;
            _this.onCreateView();
        });
    };
    MemberListPage.prototype.onCreateView = function () {
        var _this = this;
        this.ractive = new Ractive({
            el: '#container',
            template: '#MemberListTemplate',
            data: {
                list: this.list,
                toShort: function (s) {
                    if (s.length < 20) {
                        return s;
                    }
                    else {
                        return s.substr(0, 20) + '...';
                    }
                }
            }
        });
        this.ractive.on({
            memberClicked: function (e, member) {
                _this.showDetail(member);
            }
        });
        this.app.setDrawerEnabled(true);
        this.app.setTitle('メンバー');
    };
    MemberListPage.prototype.showDetail = function (member) {
        app.navigate('/members/' + member.id);
    };
    return MemberListPage;
})();
///<reference path="./AccountDAO.ts"/>
var MemberDetailPage = (function () {
    function MemberDetailPage(app, accountDAO, id) {
        this.app = app;
        this.accountDAO = accountDAO;
        this.id = id;
    }
    MemberDetailPage.prototype.loginRequired = function () {
        return true;
    };
    MemberDetailPage.prototype.onCreate = function () {
        var _this = this;
        this.accountDAO.getById(this.id, function (e, account) {
            if (e != null) {
                window.history.back();
                return;
            }
            _this.account = account;
            _this.onCreateView();
        });
    };
    MemberDetailPage.prototype.onCreateView = function () {
        this.ractive = new Ractive({
            el: '#container',
            template: '#MemberDetailTemplate',
            data: {
                member: this.account
            }
        });
        this.app.setDrawerEnabled(false);
        this.app.showBackButton();
    };
    return MemberDetailPage;
})();
var EditAccountPage = (function () {
    function EditAccountPage(app, accountDAO) {
        this.app = app;
        this.accountDAO = accountDAO;
    }
    EditAccountPage.prototype.loginRequired = function () {
        return true;
    };
    EditAccountPage.prototype.onCreate = function () {
        var _this = this;
        var account = this.app.currentAccount;
        this.ractive = new Ractive({
            el: '#container',
            template: '#EditAccountTemplate',
            data: {
                name: account.name,
                organization: account.organization,
                thumbnailUrl: account.thumbnailUrl,
                description: account.description
            }
        });
        this.ractive.on({
            updateBasic: function () {
                _this.updateBasic();
            },
            updateEmail: function () {
                _this.updateEmail();
            },
            changePassword: function () {
                _this.changePassword();
            }
        });
        this.app.setDrawerEnabled(false);
        this.app.showBackButton();
    };
    EditAccountPage.prototype.updateBasic = function () {
        var _this = this;
        var r = this.ractive;
        var name = r.get('name');
        var organization = r.get('organization');
        var thumbnail = r.get('thumbnailUrl');
        var desc = r.get('description');
        this.accountDAO.update(this.app.currentAccount, name, organization, thumbnail, desc, function (e, account) {
            if (e != null) {
                _this.app.addSnack(e);
                return;
            }
            _this.app.currentAccount = account;
            _this.app.addSnack('Done!');
        });
    };
    EditAccountPage.prototype.updateEmail = function () {
        var _this = this;
        var r = this.ractive;
        var email = r.get('newEmail');
        this.accountDAO.changeEmail(email, function (e) {
            if (e != null) {
                _this.app.addSnack(e);
                return;
            }
            r.set('newEmail', '');
            _this.app.currentAccount.email = email;
            _this.app.addSnack('Done!');
        });
    };
    EditAccountPage.prototype.changePassword = function () {
        var _this = this;
        var r = this.ractive;
        var oldPass = r.get('oldPass');
        var newPass = r.get('newPass');
        this.accountDAO.changePassword(oldPass, newPass, function (e) {
            if (e != null) {
                _this.app.addSnack(e);
                return;
            }
            r.set('oldPass', '');
            r.set('newPass', '');
            _this.app.addSnack('Done!');
            _this.app.logout();
        });
    };
    return EditAccountPage;
})();
///<reference path="./CompanyDAO.ts"/>
var EditCompanyPage = (function () {
    function EditCompanyPage(app, id, companyDAO) {
        this.app = app;
        this.id = id;
        this.companyDAO = companyDAO;
    }
    EditCompanyPage.prototype.loginRequired = function () {
        return true;
    };
    EditCompanyPage.prototype.onCreate = function () {
        var _this = this;
        this.companyDAO.getById(this.id, function (e, company) {
            if (e != null) {
                window.history.back();
                return;
            }
            _this.company = company;
            _this.onCreateView();
        });
    };
    EditCompanyPage.prototype.onCreateView = function () {
        var _this = this;
        this.ractive = new Ractive({
            el: '#container',
            template: '#EditCompanyTemplate',
            data: {
                name: this.company.name,
                url: this.company.url,
                thumbnailUrl: this.company.thumbnailUrl,
                description: this.company.description
            }
        });
        this.ractive.on({
            updateInfo: function () {
                _this.update();
            },
            addMember: function () {
                _this.addMember();
            }
        });
        this.app.setDrawerEnabled(false);
        this.app.showBackButton();
    };
    EditCompanyPage.prototype.update = function () {
        var _this = this;
        var r = this.ractive;
        var name = r.get('name');
        var url = r.get('url');
        var thumbnail = r.get('thumbnailUrl');
        var desc = r.get('description');
        this.companyDAO.update(this.company, name, url, thumbnail, desc, function (e, company) {
            if (e != null) {
                _this.app.addSnack(e);
                return;
            }
            _this.app.addSnack('Done!');
        });
    };
    EditCompanyPage.prototype.addMember = function () {
        var _this = this;
        var r = this.ractive;
        var name = r.get('newName');
        var email = r.get('newEmail');
        var password = r.get('newPassword');
        this.companyDAO.addMember(this.company, name, email, password, function (e, company) {
            if (e != null) {
                _this.app.addSnack(e);
                return;
            }
            r.set('newName', '');
            r.set('newEmail', '');
            r.set('newPassword', '');
            _this.app.addSnack('Done!');
        });
    };
    return EditCompanyPage;
})();
///<reference path="./AccountDAO.ts"/>
///<reference path="./CompanyDAO.ts"/>
///<reference path="./kii-cloud.sdk.d.ts"/>
var AccountDAOImpl = (function () {
    function AccountDAOImpl(companyDAO) {
        this.companyDAO = companyDAO;
    }
    AccountDAOImpl.prototype.login = function (email, password, callback) {
        var _this = this;
        KiiUser.authenticate(email, password, {
            success: function (user) {
                _this.getData(user.getUUID(), callback);
            },
            failure: function (user, error) {
                callback(error, null, null);
            }
        });
    };
    AccountDAOImpl.prototype.loginWithStoredToken = function (callback) {
        var _this = this;
        var token = localStorage.getItem('token');
        if (token == null || token.length == 0) {
            callback('stored token not found', null, null);
            return;
        }
        KiiUser.authenticateWithToken(token, {
            success: function (user) {
                _this.getData(user.getUUID(), callback);
            },
            failure: function (user, error) {
                callback(error, null, null);
            }
        });
    };
    AccountDAOImpl.prototype.getData = function (id, callback) {
        var _this = this;
        var bucket = Kii.bucketWithName('account');
        var query = new KiiQuery();
        var resultList = [];
        var queryCallback = {
            success: function (q, result, next) {
                if (_this.cache == null) {
                    _this.cache = {};
                }
                for (var i = 0; i < result.length; ++i) {
                    var obj = result[i];
                    _this.cache[obj.getUUID()] = _this.toAccount(obj);
                }
                _this.getCompany(id, callback);
            },
            failure: function (b, error) {
                callback(error, null, null);
            }
        };
        bucket.executeQuery(query, queryCallback);
    };
    AccountDAOImpl.prototype.getCompany = function (id, callback) {
        var _this = this;
        this.companyDAO.getAll(function (e, list) {
            if (e != null) {
                callback(e, null, null);
                return;
            }
            _this.getJoinedCompany(id, callback);
        });
    };
    AccountDAOImpl.prototype.getJoinedCompany = function (id, callback) {
        var _this = this;
        var user = KiiUser.getCurrentUser();
        user.memberOfGroups({
            success: function (u, list) {
                var companyList = [];
                for (var i = 0; i < list.length; ++i) {
                    var group = list[i];
                    companyList.push(_this.companyDAO.getCacheById(group.getUUID()));
                }
                // save access token
                localStorage.setItem('token', KiiUser.getCurrentUser().getAccessToken());
                callback(null, _this.cache[id], companyList);
            },
            failure: function (u, error) {
                callback(error, null, null);
            }
        });
    };
    AccountDAOImpl.prototype.getAll = function (callback) {
        var _this = this;
        if (this.cache != null) {
            callback(null, this.toArray());
            return;
        }
        var bucket = Kii.bucketWithName('account');
        var query = new KiiQuery();
        var resultList = [];
        var queryCallback = {
            success: function (q, result, next) {
                for (var i = 0; i < result.length; ++i) {
                    var obj = result[i];
                    resultList.push(_this.toAccount(obj));
                }
                callback(null, resultList);
            },
            failure: function (b, error) {
                callback(error, null);
            }
        };
        bucket.executeQuery(query, queryCallback);
    };
    AccountDAOImpl.prototype.getById = function (id, callback) {
        var account = this.cache[id];
        if (account.email != null) {
            callback(null, account);
            return;
        }
        var uri = 'kiicloud://users/' + id;
        var user = KiiUser.userWithID(id);
        user.refresh({
            success: function (u) {
                account.email = u.getEmailAddress();
                callback(null, account);
            },
            failure: function (u, error) {
                callback(error, null);
            }
        });
    };
    AccountDAOImpl.prototype.getByIdList = function (idList, callback) {
        var _this = this;
        var bucket = Kii.bucketWithName('account');
        var query = KiiQuery.queryWithClause(KiiClause.inClause('_id', idList));
        var resultList = [];
        var queryCallback = {
            success: function (q, result, next) {
                for (var i = 0; i < result.length; ++i) {
                    var obj = result[i];
                    resultList.push(_this.toAccount(obj));
                }
                callback(null, resultList);
            },
            failure: function (b, error) {
                callback(error, null);
            }
        };
        bucket.executeQuery(query, queryCallback);
    };
    AccountDAOImpl.prototype.update = function (account, name, organization, thumbnail, description, callback) {
        var uri = 'kiicloud://buckets/account/objects/' + account.id;
        var obj = KiiObject.objectWithURI(uri);
        obj.set('name', name);
        obj.set('organization', organization);
        obj.set('thumbnail_url', thumbnail);
        obj.set('desc', description);
        obj.save({
            success: function (o) {
                account.name = name;
                account.organization = organization;
                account.thumbnailUrl = thumbnail;
                account.description = description;
                callback(null, account);
            },
            failure: function (o, error) {
                callback(error, account);
            }
        }, true);
    };
    AccountDAOImpl.prototype.changeEmail = function (email, callback) {
        var user = KiiUser.getCurrentUser();
        user.changeEmail(email, {
            success: function (u) {
                callback(null);
            },
            failure: function (u, error) {
                callback(error);
            }
        });
    };
    AccountDAOImpl.prototype.changePassword = function (oldPass, newPass, callback) {
        var user = KiiUser.getCurrentUser();
        user.updatePassword(oldPass, newPass, {
            success: function (u) {
                callback(null);
            },
            failure: function (u, error) {
                callback(error);
            }
        });
    };
    AccountDAOImpl.prototype.toAccount = function (obj) {
        var a = new Account();
        a.id = obj.getUUID();
        a.name = obj.get('name');
        a.organization = obj.get('organization');
        a.thumbnailUrl = obj.get('thumbnail_url');
        a.description = obj.get('desc');
        return a;
    };
    AccountDAOImpl.prototype.toArray = function () {
        var list = [];
        for (var key in this.cache) {
            list.push(this.cache[key]);
        }
        return list;
    };
    return AccountDAOImpl;
})();
///<reference path="./CompanyDAO.ts"/>
///<reference path="./kii-cloud.sdk.d.ts"/>
var CompanyDAOImpl = (function () {
    function CompanyDAOImpl() {
    }
    CompanyDAOImpl.prototype.getAll = function (callback) {
        var _this = this;
        if (this.cache != null) {
            callback(null, this.toArray());
            return;
        }
        var bucket = Kii.bucketWithName('company');
        var query = new KiiQuery();
        var resultList = [];
        var queryCallback = {
            success: function (q, result, next) {
                if (_this.cache == null) {
                    _this.cache = {};
                }
                for (var i = 0; i < result.length; ++i) {
                    var obj = result[i];
                    _this.cache[obj.getUUID()] = _this.toCompany(obj);
                }
                callback(null, _this.toArray());
            },
            failure: function (b, error) {
                callback(error, null);
            }
        };
        bucket.executeQuery(query, queryCallback);
    };
    CompanyDAOImpl.prototype.getCacheById = function (id) {
        if (this.cache == null) {
            return null;
        }
        return this.cache[id];
    };
    CompanyDAOImpl.prototype.getById = function (id, callback) {
        var _this = this;
        if (this.cache != null) {
            var c = this.cache[id];
            if (c != null) {
                callback(null, c);
            }
        }
        var uri = 'kiicloud://buckets/company/objects/' + id;
        var obj = KiiObject.objectWithURI(uri);
        obj.refresh({
            success: function (o) {
                var company = _this.toCompany(o);
                _this.addToCache(company);
                callback(null, company);
            },
            failure: function (o, error) {
                callback(error, null);
            }
        });
    };
    CompanyDAOImpl.prototype.getMembers = function (company, accountDAO, callback) {
        var _this = this;
        var group = KiiGroup.groupWithID(company.id);
        group.getMemberList({
            success: function (g, list) {
                _this.refreshMembers(company, accountDAO, list, callback);
            },
            failure: function (g, error) {
                callback(error, null);
            }
        });
    };
    CompanyDAOImpl.prototype.refreshMembers = function (company, accountDAO, list, callback) {
        var idList = [];
        for (var i = 0; i < list.length; ++i) {
            idList.push(list[i].getUUID());
        }
        if (idList.length == 0) {
            company.members = [];
            callback(null, company);
            return;
        }
        accountDAO.getByIdList(idList, function (e, accountList) {
            if (e != null) {
                callback(e, null);
                return;
            }
            company.members = accountList;
            callback(null, company);
        });
    };
    CompanyDAOImpl.prototype.update = function (company, name, url, thumbnail, description, callback) {
        var uri = 'kiicloud://buckets/company/objects/' + company.id;
        var obj = KiiObject.objectWithURI(uri);
        obj.set('name', name);
        obj.set('url', url);
        obj.set('thumbnail_url', thumbnail);
        obj.set('desc', description);
        obj.save({
            success: function (o) {
                company.name = name;
                company.url = url;
                company.thumbnailUrl = thumbnail;
                company.description = description;
                callback(null, company);
            },
            failure: function (o, error) {
                callback(error, company);
            }
        }, true);
    };
    CompanyDAOImpl.prototype.addMember = function (company, name, email, password, callback) {
        var entry = Kii.serverCodeEntry("createMember");
        var params = {
            groupId: company.id,
            name: name,
            email: email,
            password: password
        };
        entry.execute(params, {
            success: function (entry, args, result) {
                var vals = result.getReturnedValue();
                if (vals["returnedValue"].code == 0) {
                    // clear member cache
                    company.members = null;
                    // add this user to cache
                    var a = vals["returnedValue"].account;
                    var account = new Account();
                    account.id = a.id;
                    account.name = a.name;
                    account.organization = a.organization;
                    account.thumbnailUrl = a.thumbnail_url;
                    account.description = a.desc;
                    models.account.cache[account.id] = account;
                    callback(null, company);
                }
                else {
                    callback('failed', null);
                }
            },
            failure: function (entry, args, result, error) {
                callback(error, null);
            }
        });
    };
    CompanyDAOImpl.prototype.toCompany = function (obj) {
        var c = new Company();
        c.id = obj.getUUID();
        c.name = obj.get('name');
        c.url = obj.get('url');
        c.thumbnailUrl = obj.get('thumbnail_url');
        c.description = obj.get('desc');
        return c;
    };
    CompanyDAOImpl.prototype.toArray = function () {
        var list = [];
        for (var key in this.cache) {
            list.push(this.cache[key]);
        }
        return list;
    };
    CompanyDAOImpl.prototype.addToCache = function (c) {
        if (this.cache == null) {
            this.cache = {};
        }
        this.cache[c.id] = c;
    };
    return CompanyDAOImpl;
})();
///<reference path="./ConferenceDAO.ts"/>
var ConferenceDAOImpl = (function () {
    function ConferenceDAOImpl() {
    }
    ConferenceDAOImpl.prototype.getAll = function (callback) {
        var _this = this;
        if (this.cache != null) {
            callback(null, this.toArray());
            return;
        }
        var bucket = Kii.bucketWithName('conference');
        var query = new KiiQuery();
        var resultList = [];
        var queryCallback = {
            success: function (q, result, next) {
                if (_this.cache == null) {
                    _this.cache = {};
                }
                for (var i = 0; i < result.length; ++i) {
                    var c = _this.toConference(result[i]);
                    _this.cache[c.id] = c;
                }
                callback(null, _this.toArray());
            },
            failure: function (b, error) {
                callback(error, null);
            }
        };
        bucket.executeQuery(query, queryCallback);
    };
    ConferenceDAOImpl.prototype.toConference = function (obj) {
        var c = new Conference();
        c.id = obj.getUUID();
        c.title = obj.get('title');
        c.date = obj.get('date');
        var d = new Date(c.date);
        c.dateLabel = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' +
            d.getDate();
        c.place = obj.get('place');
        c.description = obj.get('desc');
        return c;
    };
    ConferenceDAOImpl.prototype.toArray = function () {
        var list = [];
        for (var key in this.cache) {
            list.push(this.cache[key]);
        }
        return list;
    };
    return ConferenceDAOImpl;
})();
///<reference path="./Account.ts"/>
///<reference path="./kii-cloud.sdk.d.ts"/>
var Application = (function () {
    function Application() {
    }
    Application.prototype.start = function () {
        // Kii initialization
        Kii.initializeWithSite("1461e491", "b4b10b319ce3cf6a8cd32ca957c2c2ae", KiiSite.JP);
        this.header = new Ractive({
            el: '#header',
            template: '#headerTemplate',
            data: {
                title: 'Kii consortium',
                navDrawerEnabled: true,
                showBackButton: false
            }
        });
        this.header.on({
            back: function () {
                window.history.back();
            }
        });
        this.initDrawer();
        this.initSnack();
    };
    Application.prototype.initDrawer = function () {
        var _this = this;
        this.drawer = new Ractive({
            el: '#menu',
            template: '#drawerTemplate',
            data: {
                menuItems: [
                    "fkm",
                    "カンファレンス",
                    "企業",
                    "メンバー",
                ],
                companyList: [
                    "Mokelab Inc",
                ],
                navDrawerEnabled: false
            }
        });
        this.drawer.on({
            menuClicked: function (e, index) {
                _this.closeDrawer();
                _this.showPage(index);
            },
            companyClicked: function (e, company) {
                _this.closeDrawer();
                _this.navigate('/companies/' + company.id + '/edit');
            },
            logout: function () {
                _this.closeDrawer();
                _this.logout();
            }
        });
    };
    Application.prototype.closeDrawer = function () {
        document.querySelector('#menu-checkbox').checked = false;
    };
    Application.prototype.showPage = function (index) {
        switch (index) {
            case 0:
                this.navigate('/account/edit');
                break;
            case 1:
                this.navigate('/conferences');
                break;
            case 2:
                this.navigate('/companies');
                break;
            case 3:
                this.navigate('/members');
                break;
            case 4:
                this.navigate('/company/edit');
                break;
        }
    };
    Application.prototype.navigate = function (path) {
        this.router.navigate(path, { trigger: true });
    };
    Application.prototype.logout = function () {
        localStorage.setItem('token', '');
        KiiUser.logOut();
        this.currentAccount = null;
        this.navigate('/');
    };
    Application.prototype.initSnack = function () {
        this.snack = new Ractive({
            el: '#snack',
            template: '#snackTemplate',
            data: {
                msgList: []
            }
        });
    };
    Application.prototype.addSnack = function (msg) {
        var _this = this;
        this.snack.push('msgList', msg);
        if (this.clearSnack != null) {
            return;
        }
        this.clearSnack = function () {
            _this.snack.splice('msgList', 0, 1);
            if (_this.snack.get('msgList').length == 0) {
                _this.clearSnack = null;
            }
            else {
                setTimeout(_this.clearSnack, 3000);
            }
        };
        setTimeout(this.clearSnack, 3000);
    };
    Application.prototype.setDrawerEnabled = function (value) {
        this.header.set('navDrawerEnabled', value);
        if (value) {
            this.header.set('showBackButton', false);
        }
    };
    Application.prototype.showBackButton = function () {
        this.header.set('showBackButton', true);
        this.header.set('navDrawerEnabled', false);
    };
    Application.prototype.setTitle = function (value) {
        if (value == null) {
            value = 'Kii consortium';
        }
        this.header.set('title', value);
    };
    Application.prototype.setCurrentAccount = function (account, companyList) {
        this.currentAccount = account;
        this.drawer.set('account', account);
        var itemList = this.drawer.get('menuItems');
        itemList[0] = account.name;
        this.drawer.set('menuItems', itemList);
        this.drawer.set('companyList', companyList);
    };
    return Application;
})();
/// <reference path="./ractive.d.ts"/>
/// <reference path="./Page.ts"/>
/// <reference path="./TopPage.ts"/>
/// <reference path="./ConferenceListPage.ts"/>
/// <reference path="./CompanyListPage.ts"/>
/// <reference path="./CompanyDetailPage.ts"/>
/// <reference path="./MemberListPage.ts"/>
/// <reference path="./MemberDetailPage.ts"/>
/// <reference path="./EditAccountPage.ts"/>
/// <reference path="./EditCompanyPage.ts"/>
/// <reference path="./AccountDAOImpl.ts"/>
/// <reference path="./CompanyDAOImpl.ts"/>
/// <reference path="./ConferenceDAOImpl.ts"/>
/// <reference path="./Application.ts"/>
var app = new Application();
var models = {};
var AppRouter = Backbone.Router.extend({
    routes: {
        "": "top",
        "conferences": "conferences",
        "companies": "companies",
        "companies(/:id)": "companyDetail",
        "companies(/:id)/edit": "editCompany",
        "members": "members",
        "members(/:id)": "memberDetail",
        "account/edit": "editAccount"
    },
    top: function () {
        this.setPage(new TopPage(app, models.account));
    },
    conferences: function () {
        this.setPage(new ConferenceListPage(app, models.conference));
    },
    companies: function () {
        this.setPage(new CompanyListPage(app, models.company));
    },
    companyDetail: function (id) {
        this.setPage(new CompanyDetailPage(app, models.account, models.company, id));
    },
    members: function () {
        this.setPage(new MemberListPage(app, models.account));
    },
    memberDetail: function (id) {
        this.setPage(new MemberDetailPage(app, models.account, id));
    },
    editAccount: function () {
        this.setPage(new EditAccountPage(app, models.account));
    },
    editCompany: function (id) {
        this.setPage(new EditCompanyPage(app, id, models.company));
    },
    setPage: function (page) {
        app.page = page;
        if (!page.loginRequired()) {
            page.onCreate();
            return;
        }
        if (app.currentAccount != null) {
            page.onCreate();
            return;
        }
        // login with token
        models.account.loginWithStoredToken(function (e, account, companyList) {
            if (e != null) {
                app.navigate('/');
                return;
            }
            app.setCurrentAccount(account, companyList);
            page.onCreate();
        });
    }
});
$(function () {
    models.company = new CompanyDAOImpl();
    models.account = new AccountDAOImpl(models.company);
    models.conference = new ConferenceDAOImpl();
    app.start();
    app.router = new AppRouter();
    Backbone.history.start();
});
