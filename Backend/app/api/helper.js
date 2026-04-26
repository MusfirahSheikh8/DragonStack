const Session = require('../account/session');
const AccountTable = require('../account/table');
const { hash } = require('../account/helper');

const setSession = ({ username, res }) => {
    return new Promise((resolve, reject) => {
        const session = new Session({ username });
        const sessionString = session.toString();

        AccountTable.updateSessionId({
            sessionId: session.id,
            usernameHash: hash(username)
        })
            .then(() => {
                res.cookie('sessionString', sessionString, {
                    expires: new Date(Date.now() + 3600000),
                    httpOnly: true,
                    secure: false
                });
                resolve({ message: 'session created' });
            })
            .catch(error => reject(error))
    });
};

const authenticatedAccount = ({ sessionString }) => {
    return new Promise((resolve, reject) => {
        if (!sessionString || !Session.verify(sessionString)) {
            const error = new Error('Invalid session');

            error.statusCode = 400;

            return reject(error);
        } else {
            const { username, id } = Session.parse(sessionString);

            AccountTable.getAccount({ usernameHash: hash(username) })
                .then(({ account }) => {
                    const authenticated = account.sessionId === id;

                    resolve({ account, authenticated, username });
                })
                .catch(error => reject(error))
        }
    })
};

module.exports = { setSession, authenticatedAccount }