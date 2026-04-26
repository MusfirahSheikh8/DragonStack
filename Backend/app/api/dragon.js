const { Router } = require('express');
const AccountDragonTable = require('../accountDragon/table');
const DragonTable = require('../dragon/table');
const AccountTable = require('../account/table')
const Breeder = require('../dragon/breeder')
const { authenticatedAccount } = require('./helper');
const { getPublicDragons, getDragonWithTraits } = require('../dragon/helper')

const router = new Router();

router.get('/new', async (req, res, next) => {
  try {
    const engine = req.app.locals.engine;

    const { account, authenticated } =
      await authenticatedAccount({ sessionString: req.cookies.sessionString });

    if (!authenticated) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    let dragon;

    try {
      dragon = engine.generation.newDragon({ accountId: account.id });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
        generation: {
          expiration: engine.generation.expiration,
          generationId: engine.generation.generationId || null
        }
      });
    }

    const { dragonId } = await DragonTable.storeDragon(dragon);

    dragon.dragonId = dragonId;

    await AccountDragonTable.storeAccountDragon({
      accountId: account.id,
      dragonId
    });

    return res.json({ dragon });

  } catch (error) {
    console.error('Database Error:', error);
    return res.status(500).json({
      error: 'Failed to store dragon in database.'
    });
  }
});

router.put('/update', (req, res, next) => {
  const { dragonId, nickname, isPublic, saleValue, sireValue } = req.body;

  DragonTable.updateDragon({ dragonId, nickname, isPublic, saleValue, sireValue })
    .then(() => res.json({ message: 'Successfully Updated Dragon' }))
    .catch(error => next(error))
});

router.get('/public-dragons', (req, res, next) => {
  getPublicDragons()
    .then(({ dragons }) => res.json({ dragons }))
    .catch(error => next(error))
});

router.post('/buy', (req, res, next) => {
  const { dragonId, saleValue } = req.body;
  let buyerId;

  DragonTable.getDragon({ dragonId })
    .then(dragon => {
      if (dragon.saleValue !== saleValue) {
        throw new Error('Sale value is not correct');
      }
      if (!dragon.isPublic) {
        throw new Error('Dragon must be public')
      }
      return authenticatedAccount({ sessionString: req.cookies.sessionString })
    })
    .then(({ account, authenticated }) => {
      if (!authenticated) {
        throw new Error('Unauthenticated')
      }
      if (saleValue > account.balance) {
        throw new Error('Sale value exceeds balance')
      }
      buyerId = account.id;

      return AccountDragonTable.getDragonAccount({ dragonId });
    })
    .then(({ accountId }) => {
      if (accountId === buyerId) {
        throw new Error('Cannot buy your own dragon!')
      }

      const sellerId = accountId;

      return Promise.all([
        AccountTable.updateBalance({
          accountId: buyerId, value: -saleValue
        }),
        AccountTable.updateBalance({
          accountId: sellerId, value: saleValue
        }),
        AccountDragonTable.updateDragonAccount({
          dragonId, accountId: buyerId
        }),
        DragonTable.updateDragon({
          dragonId, isPublic: false
        })
      ])
    })
    .then(() => res.json({ message: 'success!' }))
    .catch(error => next(error));
})

router.post('/mate', (req, res, next) => {
  const { matronDragonId, patronDragonId } = req.body;
  console.log("MAT:", matronDragonId);
  console.log("PAT:", patronDragonId);
  if (matronDragonId === patronDragonId) {
    return next(new Error('Cannot breed with the same dragon!'));
  }

  let matronDragon, patronDragon, patronSireValue;
  let matronAccountId, patronAccountId;

  getDragonWithTraits({ dragonId: patronDragonId })
    .then(dragon => {
      if (!dragon) throw new Error('Patron dragon not found');
      if (!dragon.isPublic) throw new Error('Dragon must be public');

      patronDragon = dragon;
      patronSireValue = dragon.sireValue;

      return getDragonWithTraits({ dragonId: matronDragonId });
    })
    .then(dragon => {
      if (!dragon) throw new Error('Matron dragon not found');
      matronDragon = dragon;

      return authenticatedAccount({ sessionString: req.cookies.sessionString });
    })
    .then(({ account, authenticated }) => {
      if (!authenticated) throw new Error('Unauthenticated');
      if (patronSireValue > account.balance)
        throw new Error('Sire value exceeds balance');

      matronAccountId = account.id;

      return AccountDragonTable.getDragonAccount({ dragonId: patronDragonId });
    })
    .then(({ accountId }) => {
      patronAccountId = accountId;

      if (matronAccountId === patronAccountId)
        throw new Error('Cannot breed your own dragons!');

      const dragon = Breeder.breedDragon({
        matron: matronDragon,
        patron: patronDragon
      });

      return DragonTable.storeDragon(dragon);
    })
    .then(({ dragonId }) => {
      return Promise.all([
        AccountTable.updateBalance({
          accountId: matronAccountId,
          value: -patronSireValue
        }),
        AccountTable.updateBalance({
          accountId: patronAccountId,
          value: patronSireValue
        }),
        AccountDragonTable.storeAccountDragon({
          dragonId,
          accountId: matronAccountId
        })
      ]);
    })
    .then(() => res.json({ message: 'success!' }))
    .catch(error => next(error));
});

module.exports = router;
