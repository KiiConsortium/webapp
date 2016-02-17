class EditAccountPage implements Page {
    app : Application;
    ractive : Ractive;
    accountDAO : AccountDAO;
    
    constructor(app : Application, accountDAO : AccountDAO) {
        this.app = app;
        this.accountDAO = accountDAO;
    }

    loginRequired() : boolean {
        return true;
    }
    
    onCreate() {
        var account = this.app.currentAccount;
        this.ractive = new Ractive({
            el : '#container',
            template : '#EditAccountTemplate',
            data : {
                name : account.name,
                organization : account.organization,
                thumbnailUrl : account.thumbnailUrl,
                description : account.description,
            }
        });
        this.ractive.on({
            updateBasic : () => {
                this.updateBasic();
            },
            updateEmail : () => {
                this.updateEmail();
            },
            changePassword : () => {
                this.changePassword();
            },
        });
        this.app.setDrawerEnabled(false);
        this.app.showBackButton();
    }

    private updateBasic() {
        var r = this.ractive;
        var name = r.get('name');
        var organization = r.get('organization');
        var thumbnail = r.get('thumbnailUrl');
        var desc = r.get('description');
        this.accountDAO.update(this.app.currentAccount, name, organization, thumbnail, desc, (e : any, account : Account) => {
            if (e != null) {
                this.app.addSnack(e);
                return;
            }
            this.app.currentAccount = account;
            this.app.addSnack('Done!');
        });
    }

    private updateEmail() {
        var r = this.ractive;
        var email = r.get('newEmail');
        this.accountDAO.changeEmail(email, (e : any) => {
            if (e != null) {
                this.app.addSnack(e);
                return;
            }
            r.set('newEmail', '');
            this.app.currentAccount.email = email;
            this.app.addSnack('Done!');
        });
    }

    private changePassword() {
        var r = this.ractive;
        var oldPass = r.get('oldPass');
        var newPass = r.get('newPass');
        this.accountDAO.changePassword(oldPass, newPass, (e : any) => {
            if (e != null) {
                this.app.addSnack(e);
                return;
            }
            r.set('oldPass', '');
            r.set('newPass', '');
            this.app.addSnack('Done!');            
            this.app.logout();
        });
    }
}