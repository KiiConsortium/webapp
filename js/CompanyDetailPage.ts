///<reference path="./AccountDAO.ts"/>
///<reference path="./CompanyDAO.ts"/>

class CompanyDetailPage implements Page {
    app : Application;
    accountDAO : AccountDAO;
    companyDAO : CompanyDAO;
    id : string;
    ractive : Ractive;

    company : Company;
    
    constructor(app : Application, accountDAO : AccountDAO, companyDAO : CompanyDAO, id : string) {
        this.app = app;
        this.accountDAO = accountDAO;
        this.companyDAO = companyDAO;
        this.id = id;
    }

    loginRequired() : boolean {
        return true;
    }
    
    onCreate() {
        this.companyDAO.getById(this.id, (e : any, company : Company) => {
            if (e != null) {
                window.history.back();
                return;
            }
            this.company = company;
            this.getMembers();
        });
    }

    private getMembers() {
        if (this.company.members != null) {
            this.onCreateView();
            return;
        }
        this.companyDAO.getMembers(this.company, this.accountDAO, (e : any, company : Company) => {
            if (e != null) {
                window.history.back();
                return;
            }
            this.company = company;
            this.onCreateView();
        });
    }

    private onCreateView() {
        this.ractive = new Ractive({
            el : '#container',
            template : '#CompanyDetailTemplate',
            data : {
                company : this.company,
                memberList : this.company.members,
            }
        });
        this.ractive.on({
            memberClicked : (e : any, member : any) => {
                this.showDetail(member);
            }
        });
        this.app.setDrawerEnabled(false);
        this.app.showBackButton();
    }

    private showDetail(member : any) {
        app.navigate('/members/' + member.id);
    }
}