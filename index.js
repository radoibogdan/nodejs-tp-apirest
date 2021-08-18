const express = require('express');
const app = express();
const port = 3500;
// Client DB (sqlite3) + surcouche knex (constructeur de query)
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './data/chinook.db',
  },
});

// Cryptage (npm i bcrypt)
const bcrypt = require('bcrypt');

// Token JWT (npm i jsonwebtoken)
const jwt = require('jsonwebtoken');

const {authenticate} = require('./middleware/authenticate')

// Middleware : Parser le body(qui est en JSON) des requetes POST => deserialisation en objet JS
app.use(express.json());

// Nommage routes
// app.get('/team/add) WRONG !
// app.post('/team/add) WRONG !
// app.post('/team')  // CORRECT !

// -------------- ARTISTS -------------- //
// GET ALL artists
app.get('/artist', authenticate, (req, res) => {

  // const token = req.get('X-JWT');
  // if (!token) return res.statut(401).send();
  // Async
  knex.select('*').from('artists').then((artists) => {
    res.json(artists);
  })
})

// GET artist by ID
app.get('/artist/:id', authenticate, async (req, res) => {
  // knex
  //   .select('*')
  //   .from('artists')
  //   .where('ArtistId', req.params.id)
  //   .then(artist => res.json(artist))

  try {
    // artist sera une promesse
    const artist = await knex.select('*').from('artists')
      .where('ArtistId', req.params.id)
    res.json(artist);
  } catch(e) {
    res.json(e);
  }
})

// POST - Créer artist
app.post('/artist', async (req, res) => {
  const { Name } = req.body;
  const newArtist = await knex.insert({Name}).into('artists');
  res.send({newArtist});
})

// PATCH - Modifier un artist (1, 2 ou toutes les infos)
app.patch('/artist/:id', async (req, res) => {

  const { id } = req.params;
  const { newName } = req.body;

  const result = await knex('artists')
    .where({ ArtistId: id })
    .update({ Name: newName })

  res.json({result}); // En cas d'update OK => result = 1
})

// DELETE - Supprimer un artist
app.delete('/artist/:id', async (req, res) => {

  const {id} = req.params;
  // where('ArtistId', id})

  const result = await knex('artists')
    .where({ArtistId: id})
    .del()
  
  res.json({result})
})

// -------------- USERS -------------- //

app.get('/users', async (req, res) => {
  const users = await knex('users');
  res.json({ users });
});

// POST - Create user
app.post('/user', async (req, res) => {
  const {email, password} = req.body;
  bcrypt.hash(password, 10, async (err, hash) => {
    const result = await knex('users').insert({email, password: hash})
    res.json({result})
  })
})

// LOGIN - Authentifier un utilisateur
app.post('/login', async (req, res) => {
  
  const {email, password} = req.body;
  
  // Récupérer id+pass crypté depuis la bdd
  const result = await knex('users').where({email}).select('id', 'password');
  
  if (result.length > 0) {
    const userId = result[0].id;
    bcrypt.compare(password, result[0].password, (err, compareResult) => {
      // pass envoyé en POST === pass crypté(bdd)
      if (compareResult) {
        // Générer un web token
        jwt.sign({userId}, 'secret', null, async (err, token) => {
          // Enregistrement en bdd du token
          await knex('users').where({id: userId}).update({token})
          // Répo au client
          res.set('X-JWT', token);
          res.json({login: true});
        })
      } else {
        res.json({login: false});
      }
    })
  } else {
    res.json({login: false});
  }
})

app.post('/logout', async (req, res) => {
  const token = req.get('X-JWT');
  if (!token) return res.status(401).send();
  
  // Y a-t-il un user avec ce token ?
  const user = await knex('users').where({ token });

  if (user.length > 0) {
    const result = await knex('users').where({ id: user[0].id }).update({ token: null });
    if (result.length > 0) {
      res.set('X-JWT', null);
      res.json({logout: true});
    } else {
      res.status(401).send();
    }
  } else {
    res.status(401).send();
  }
});

// -------------- ALBUMS -------------- //
app.get('/album/artist/:id', async (req, res) => {
  try {
    const albums = await knex.select('*').from('albums')
      .where('ArtistId', req.params.id)
    res.json(albums);
  } catch(e) {
    res.json(e);
  }
})

app.listen(port, () => console.log('[+] - Serveur ouvert sur port ' + port ));