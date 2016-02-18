///<reference path="./Account.ts"/>
///<reference path="./Company.ts"/>

interface AccountDAO {
    login(email : string, password : string, callback : (e : any, account : Account, companyList : Array<Company>) => void);
    loginWithStoredToken(callback : (e : any, account : Account, companyList : Array<Company>) => void);
    getAll(callback : (e : any, list : Array<Account>) => void);
    getById(id : string, callback : (e : any, account : Account) => void);
    getByIdList(idList : Array<string>, callback : (e : any, list : Array<Account>) => void);
    update(account : Account, name : string, organization : string, thumbnail : string,
           description : string, callback : (e : any, account : Account) => void);
    changeEmail(email : string, callback : (e : any) => void);
    changePassword(oldPass : string, newPass : string, callback : (e : any) => void);
    resetPassword(email : string, callback : (e : any) => void);
}