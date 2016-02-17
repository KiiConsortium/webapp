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
declare var $;
declare var _;
declare var Backbone;

var app = new Application();

var models : any = {};

var AppRouter = Backbone.Router.extend({
    routes : {
        "" : "top",
        "conferences" : "conferences",
        "companies" : "companies",
        "companies(/:id)" : "companyDetail",
        "companies(/:id)/edit" : "editCompany",
        "members" : "members",
        "members(/:id)" : "memberDetail",
        "account/edit" : "editAccount",
    },
    top : function(){
        this.setPage(new TopPage(app, models.account));
    },
    conferences : function() {
        this.setPage(new ConferenceListPage(app, models.conference));
    },
    companies : function() {
        this.setPage(new CompanyListPage(app, models.company));
    },
    companyDetail : function(id : string) {
        this.setPage(new CompanyDetailPage(app, models.account, models.company, id));
    },
    members : function() {
        this.setPage(new MemberListPage(app, models.account));
    },
    memberDetail : function(id : string) {
        this.setPage(new MemberDetailPage(app, models.account, id));
    },
    editAccount : function() {
        this.setPage(new EditAccountPage(app, models.account));
    },
    editCompany : function(id : string) {
        this.setPage(new EditCompanyPage(app, id, models.company));
    },
    setPage : (page : Page) => {
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
        models.account.loginWithStoredToken((e : any, account : Account, companyList : Array<Company>) => {
            if (e != null) {
                app.navigate('/');
                return;
            }
            app.setCurrentAccount(account, companyList);
            page.onCreate();
        });
    }
});

$(() => {
    models.company = new CompanyDAOImpl();
    models.account = new AccountDAOImpl(models.company);
    models.conference = new ConferenceDAOImpl();
    app.start();
    app.router = new AppRouter();
    Backbone.history.start();
});