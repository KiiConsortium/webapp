/// <reference path="./ConferenceDAO.ts"/>

class ConferenceListPage implements Page {
    app : Application;
    conferenceDAO : ConferenceDAO;
    ractive : Ractive;

    list : Array<Conference>;
    
    constructor(app : Application, conferenceDAO : ConferenceDAO) {
        this.app = app;
        this.conferenceDAO = conferenceDAO;
    }

    loginRequired() : boolean {
        return true;
    }
    
    onCreate() {
        this.conferenceDAO.getAll((e : any, list : Array<Conference>) => {
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
            template : '#ConferenceListTemplate',
            data : {
                list : this.list,
            }
        });
        this.app.setDrawerEnabled(true);
        this.app.setTitle('カンファレンス');
    }
}