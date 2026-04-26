const { Router } = require('express');
const AccountTable = require('../account/table');
const AccountDragonTable = require('../accountDragon/table')
const { hash } = require('../account/helper');
const { setSession, authenticatedAccount } = require('./helper');
const Session = require('../account/session');
const router = new Router();
const { getDragonWithTraits } = require("../dragon/helper")

console.log('🔥 SIGNUP HIT', Date.now());

router.post('/signup', (req, res, next) => {
    const { username, password } = req.body;
    console.log('SIGNUP BODY:', req.body);
    console.log('SIGNUP USERNAME:', username);
    const usernameHash = hash(username);
    const passwordHash = hash(password);


    AccountTable.getAccount({ usernameHash })
        .then(({ account }) => {
            if (!account) {
                return AccountTable.storeAccount({ username, usernameHash, passwordHash })
            } else {
                const error = new Error('Account already exists');
                error.status = 409;

                throw error;
            }
        })
        .then(() => {
            return setSession({ username, res })
        })
        .then(({ message }) => {
            res.json({ message });
        })
        .catch(error => next(error));
});

router.post('/login', (req, res, next) => {
    const { username, password } = req.body;

    const usernameHash = hash(username);
    const passwordHash = hash(password);

    AccountTable.getAccount({ usernameHash })
        .then(({ account }) => {
            if (!account) {
                const error = new Error('User not found');
                error.status = 404;
                throw error;
            }

            if (account.passwordHash !== passwordHash) {
                const error = new Error('Invalid password');
                error.status = 401;
                throw error;
            }

            return setSession({ username, res });
        })
        .then(({ message }) => res.json({ message }))
        .catch(error => next(error));
});


router.get('/logout', (req, res) => {
    res.clearCookie('sessionString', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
    });

    res.json({ message: 'Logged out successfully' });
});

router.get('/authenticated', (req, res, next) => {
    const raw = req.cookies.sessionString;
    if (!raw) return res.json({ authenticated: false });

    const sessionString = decodeURIComponent(raw);

    authenticatedAccount({ sessionString })
        .then(({ authenticated }) => res.json({ authenticated }))
        .catch(() => res.json({ authenticated: false }));
});


router.get('/dragons', (req, res, next) => {
    const raw = req.cookies.sessionString;

    if (!raw) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const sessionString = decodeURIComponent(raw);

    authenticatedAccount({ sessionString })
        .then(({ account }) => {
            return AccountDragonTable.getAccountDragons({
                accountId: account.id
            });
        })

        .then(({ accountDragons }) => {
            return Promise.all(
                accountDragons.map(accountDragon => {
                    return getDragonWithTraits({
                        dragonId: accountDragon.dragonId
                    });
                })
            );
        })
        .then(dragons => {
            res.json({ dragons });
        })
        .catch(error => next(error));
});

router.get('/info', ( req, res, next ) => {
    authenticatedAccount({ sessionString: req.cookies.sessionString })
        .then(({ account }) => {
            res.json({ info: { balance: account.balance, username: account.username } });
        })
        .catch(error => next( error ))
})

module.exports = router;