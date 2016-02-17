///<reference path="./Account.ts"/>
///<reference path="./kii-cloud.sdk.d.ts"/>

class Application {
    router : any;
    page : Page;
    header : any;
    drawer : any;
    snack : any;

    clearSnack : any;
    currentAccount : Account;

    start() {
        // Kii initialization
        Kii.initializeWithSite("1461e491", "b4b10b319ce3cf6a8cd32ca957c2c2ae", KiiSite.JP);
        this.header = new Ractive({
            el : '#header',
            template : '#headerTemplate',
            data : {
                title : 'Kii consortium',
                navDrawerEnabled : true,
                showBackButton : false,
            },
        });
        this.header.on({
            back : () => {
                window.history.back();
            }
        });
        this.initDrawer();
        this.initSnack();
    }

    private initDrawer() {
        this.drawer = new Ractive({
            el : '#menu',
            template : '#drawerTemplate',
            data : {
                menuItems : [
                    "fkm",
                    "カンファレンス",
                    "企業",
                    "メンバー",
                ],
                companyList : [
                    "Mokelab Inc",
                ],
                navDrawerEnabled : false
            }
        });
        this.drawer.on({
            menuClicked : (e : any, index : number) => {
                this.closeDrawer();
                this.showPage(index);
            },
            companyClicked : (e : any, company : Company) => {
                this.closeDrawer();
                this.navigate('/companies/' + company.id + '/edit');
            },
            logout : () => {
                this.closeDrawer();
                this.logout();
            }
        });
    }

    private closeDrawer() {
        (<any>document.querySelector('#menu-checkbox')).checked = false;
    }

    private showPage(index : number) {
        switch (index) {
        case 0: // Edit profile
            this.navigate('/account/edit');
            break;
        case 1: // Conference
            this.navigate('/conferences');
            break;
        case 2: // Companies
            this.navigate('/companies');
            break;
        case 3: // Members
            this.navigate('/members');
            break;
        case 4: // Edit company
            this.navigate('/company/edit');
            break;
        }
    }    
   
    navigate(path : string) {
        this.router.navigate(path, {trigger: true});
    }

    logout() {
        localStorage.setItem('token', '');
        KiiUser.logOut();
        this.currentAccount = null;
        this.navigate('/');
    }

    private initSnack() {
        this.snack = new Ractive({
            el : '#snack',
            template : '#snackTemplate',
            data : {
                msgList : [],
            }
        });
    }

    addSnack(msg : string) {
        this.snack.push('msgList', msg);
        if (this.clearSnack != null) {
            return;
        }
        this.clearSnack = () => {
            this.snack.splice('msgList', 0, 1);
            if (this.snack.get('msgList').length == 0) {
                this.clearSnack = null;
            } else {
                setTimeout(this.clearSnack, 3000);
            }
        };
        setTimeout(this.clearSnack, 3000);
    }

    setDrawerEnabled(value : boolean) {
        this.header.set('navDrawerEnabled', value);
        if (value) {
            this.header.set('showBackButton', false);
        }
    }

    showBackButton() {
        this.header.set('showBackButton', true);
        this.header.set('navDrawerEnabled', false);
    }

    setTitle(value : string) {
        if (value == null ) { value = 'Kii consortium'; }
        this.header.set('title', value);
    }

    setCurrentAccount(account : Account, companyList : Array<Company>) {
        this.currentAccount = account;
        this.drawer.set('account', account);
        var itemList = this.drawer.get('menuItems');
        itemList[0] = account.name;
        this.drawer.set('menuItems', itemList);
        this.drawer.set('companyList', companyList);
    }
}