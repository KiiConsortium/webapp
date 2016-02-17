///<reference path="./Company.ts"/>

interface CompanyDAO {
    getAll(callback : (e : any, list : Array<Company>) => void);
    getCacheById(id : string) : Company;
    getById(id : string, callback : (e : any, company : Company) => void);
    getMembers(company : Company, accountDAO : AccountDAO, callback : (e : any, company : Company) => void);

    update(company : Company, name : string, url : string, thumbnail : string,
           description : string, callback : (e : any, company : Company) => void);
    addMember(company : Company, name : string, email : string, password : string, callback : (e : any, company : Company) => void);
}