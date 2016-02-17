///<reference path="./AccountDAO.ts"/>

class MemberDetailPage implements Page {
    app : Application;
    accountDAO : AccountDAO;
    id : string;
    ractive : Ractive;

    account : Account;
    
    constructor(app : Application, accountDAO : AccountDAO, id : string) {
        this.app = app;
        this.accountDAO = accountDAO;
        this.id = id;
    }

    loginRequired() : boolean {
        return true;
    }
    
    onCreate() {
        this.accountDAO.getById(this.id, (e : any, account : Account) => {
            if (e != null) {
                window.history.back();
                return;
            }
            this.account = account;
            this.onCreateView();
        });
    }
    
    private onCreateView() {
        this.ractive = new Ractive({
            el : '#container',
            template : '#MemberDetailTemplate',
            data : {
                member : this.account,
            }
        });
        this.app.setDrawerEnabled(false);
        this.app.showBackButton();
    }
}