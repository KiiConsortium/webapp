///<reference path="./CompanyDAO.ts"/>

class EditCompanyPage implements Page {
    app : Application;
    id : string;
    companyDAO : CompanyDAO;
    ractive : Ractive;

    company : Company;
    
    constructor(app : Application, id : string, companyDAO : CompanyDAO) {
        this.app = app;
        this.id = id;
        this.companyDAO = companyDAO;
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
            this.onCreateView();
        });
    }

    private onCreateView() {
        this.ractive = new Ractive({
            el : '#container',
            template : '#EditCompanyTemplate',
            data : {
                name : this.company.name,
                url : this.company.url,
                thumbnailUrl : this.company.thumbnailUrl,
                description : this.company.description,
            }
        });
        this.ractive.on({
            updateInfo : () => {
                this.update();
            },
            addMember : () => {
                this.addMember();
            }
        });
        this.app.setDrawerEnabled(false);
        this.app.showBackButton();
    }

    private update() {
        var r = this.ractive;
        var name = r.get('name');
        var url = r.get('url');
        var thumbnail = r.get('thumbnailUrl');
        var desc = r.get('description');
        this.companyDAO.update(this.company, name, url, thumbnail, desc, (e : any, company : Company) => {
            if (e != null) {
                this.app.addSnack(e);
                return;
            }
            this.app.addSnack('Done!');
        });
    }

    private addMember() {
        var r = this.ractive;
        var name = r.get('newName');
        var email = r.get('newEmail');
        var password = r.get('newPassword');
        this.companyDAO.addMember(this.company, name, email, password, (e : any, company : Company) => {
            if (e != null) {
                this.app.addSnack(e);
                return;
            }
            r.set('newName', '');
            r.set('newEmail', '');
            r.set('newPassword', '');
            this.app.addSnack('Done!');
        });
    }
}