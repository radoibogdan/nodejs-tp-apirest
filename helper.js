const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: './data/chinook.db',
  },
});

const generateUserTable = async () => {
  await knex.schema.dropTableIfExists('users');
  // Cette instruction ajoute la tables USERS a notre base de données
  await knex.schema.createTable('users', table => {
    table.increments();
    table.string('email');
    table.string('password');
    table.string('token');
  })
}

generateUserTable();