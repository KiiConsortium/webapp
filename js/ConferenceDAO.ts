///<reference path="./Conference.ts"/>

interface ConferenceDAO {
    getAll(callback : (e : any, list : Array<Conference>) => void);
}