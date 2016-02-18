///<reference path="./AccountDAO.ts"/>

class TopPage implements Page {
    app : Application;
    ractive : Ractive;
    accountDAO : AccountDAO;
    
    constructor(app : Application, accountDAO : AccountDAO) {
        this.app = app;
        this.accountDAO = accountDAO;
    }

    loginRequired() : boolean {
        return false;
    }
    
    onCreate() {
        var token = localStorage.getItem('token');
        if (token == null || token.length == 0) {
            this.onCreateView();
            return;
        }
        // login with token
        this.accountDAO.loginWithStoredToken((e : any, account : Account, companyList : Array<Company>) => {
            if (e != null) {
                this.onCreateView();
                return;
            }
            this.app.setCurrentAccount(account, companyList);
            this.app.navigate('/conferences');
        });
    }
    
    private onCreateView() {
        this.ractive = new Ractive({
            el : '#container',
            template : '#TopTemplate',
        });
        this.ractive.on({
            login : () => {
                this.login();
            },
            resetPassword : () => {
                this.resetPassword();
            },
        });
        this.app.setDrawerEnabled(false);
    }

    private login() {
        var email = this.ractive.get('email');
        var password = this.ractive.get('password');
        this.accountDAO.login(email, password, (e : any, account : Account, companyList : Array<Company>) => {
            if (e != null) {
                this.app.addSnack(e);
                return;
            }
            this.app.setCurrentAccount(account, companyList);
            this.app.navigate('/conferences');
        });
    }

    private resetPassword() {
        var r = this.ractive;
        var email = r.get('resetEmail');
        this.accountDAO.resetPassword(email, (e : any) => {
            if (e != null) {
                this.app.addSnack(e);
                return;
            }
            r.set('resetEmail', '');
            this.app.addSnack('Sent reset password email');
        });
    }
}