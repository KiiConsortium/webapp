///<reference path="./CompanyDAO.ts"/>

class CompanyListPage implements Page {
    app : Application;
    ractive : Ractive;
    companyDAO : CompanyDAO;

    list : Array<Company>;
    
    constructor(app : Application, companyDAO : CompanyDAO) {
        this.app = app;
        this.companyDAO = companyDAO;
    }

    loginRequired() : boolean {
        return true;
    }
    
    onCreate() {
        this.app.setDrawerEnabled(true);
        this.app.setTitle('企業');
        this.companyDAO.getAll((e : any, list : Array<Company>) => {
            if (e != null) {
                return;
            }
            this.list = list;
            this.onCreateView();
        });
    }
    
    private onCreateView() {
        this.ractive = new Ractive({
            el : '#container',
            template : '#CompanyListTemplate',
            data : {
                list : this.list,
            }
        });
        this.ractive.on({
            companyClicked : (e : any, company : Company) => {
                this.showDetail(company);
            }            
        });
    }

    private showDetail(company : Company) {
        app.navigate('/companies/' + company.id);
    }
}