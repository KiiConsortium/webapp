///<reference path="./ConferenceDAO.ts"/>

class ConferenceDAOImpl implements ConferenceDAO {
    cache : any;

    getAll(callback : (e : any, list : Array<Conference>) => void) {
        if (this.cache != null) {
            callback(null, this.toArray());
            return;
        }
        var bucket = Kii.bucketWithName('conference');
        var query = new KiiQuery();
        var resultList : Array<Account> = [];
        var queryCallback = {
            success : (q : KiiQuery, result : Array<KiiObject>, next : KiiQuery) => {
                if (this.cache == null) { this.cache = {}; }

                for (var i = 0 ; i < result.length ; ++i) {
                    var c = this.toConference(result[i]);
                    this.cache[c.id] = c;
                }
                callback(null, this.toArray());
            },
            failure : (b : KiiBucket, error : string) => {
                callback(error, null);
            }
        };
        bucket.executeQuery(query, queryCallback);        
    }

    private toConference(obj : KiiObject) : Conference {
        var c = new Conference();
        c.id = obj.getUUID();
        c.title = <string>obj.get('title');
        c.date = <number>obj.get('date');
        var d = new Date(c.date);
        c.dateLabel = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + 
            d.getDate();
        c.place = <string>obj.get('place');
        c.description = <string>obj.get('desc');
        return c;
    }

    private toArray() : Array<Conference> {
        var list : Array<Conference> = [];
        for (var key in this.cache) {
            list.push(this.cache[key]);
        }
        return list;
    }
}

