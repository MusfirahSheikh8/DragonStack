const { v4: uuidv4 } = require('uuid');
const { hash } = require('./helper');
const SEPARATOR = '|';

class Session {
    constructor({ username }) {
        this.username = username;
        this.id = uuidv4();
    }

    toString() {
        const { username, id } = this;

        return Session.sessionString({ username, id});
    }

    static parse(sessionString) {
        const sessionData = sessionString.split(SEPARATOR);

        return {
            username: sessionData[0],
            id: sessionData[1],
            hash: sessionData[2],
        }
    }

    static verify (sessionString) {
        const { username, id, hash: sessionHash } = Session.parse(sessionString);

        const accountData = Session.AccountData({ username, id });
        return hash(accountData) === sessionHash;
    }

    static AccountData ({ username, id }) {
        return `${ username }${ SEPARATOR }${ id }`;
    }

    static sessionString ({ username, id }) {
        const accountData = Session.AccountData({ username, id });
        return `${ accountData }${ SEPARATOR }${hash(accountData)}`;
    }
}

module.exports = Session;
