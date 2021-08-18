const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './data/chinook.db',
  },
});

const authenticate = async (req, res, next) => {
  // ToDo - Verifier le token avec .verify()
  // Plusieurs ROLES ? => le mettre dans le sign {role: admin}
  // if decoded.token.role !=== admin => 404

  // Récuperer le token depuis les HEADERS
  const token = req.get('X-JWT');

  if (!token) return res.status(401).send();

  // Y a-t-il un user avec ce token ?
  const result = await knex('users').where({token})

  if (result.length > 0) {
    // utilisateur trouvé
    next(); // au suivant, ne pas bloquer le flux
  } else {
    res.statut(401).send();
  }
}

module.exports = { authenticate }