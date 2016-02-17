///<reference path="./AccountDAO.ts"/>

class MemberListPage implements Page {
    app : Application;
    ractive : Ractive;
    accountDAO : AccountDAO;

    list : Array<Account>;
    
    constructor(app : Application, accountDAO : AccountDAO) {
        this.app = app;
        this.accountDAO = accountDAO;
    }

    loginRequired() : boolean {
        return true;
    }
    
    onCreate() {
        this.accountDAO.getAll((e : any, list : Array<Account>) => {
            if (e != null) {
                window.history.back();
                return;
            }
            this.list = list;
            this.onCreateView();
        });
    }
    
    private onCreateView() {
        this.ractive = new Ractive({
            el : '#container',
            template : '#MemberListTemplate',
            data : {
                list : this.list,
                toShort : (s : string) => {
                    if (s.length < 20) {
                        return s;
                    } else {
                        return s.substr(0, 20) + '...';
                    }
                },
            }
        });
        this.ractive.on({
            memberClicked : (e : any, member : any) => {
                this.showDetail(member);
            }
        });
        this.app.setDrawerEnabled(true);
        this.app.setTitle('メンバー');
    }

    private showDetail(member : any) {
        app.navigate('/members/' + member.id);
    }
}