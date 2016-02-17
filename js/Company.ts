///<reference path="./Account.ts"/>

class Company {
    id : string;
    name : string;
    url : string;
    thumbnailUrl : string;
    description : string;

    members : Array<Account>;
}