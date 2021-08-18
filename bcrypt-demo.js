const bcrypt = require('bcrypt');

const clearText = '1234';

// bcrypt.hash(clearText, 10, (err, hash) => {
//   console.log(hash);
// })

const hash1 = '$2b$10$CBpkZ/4Cfcq5LcX5kz6ewuOusMxz0b/JbP7V09MQ4gDkKOTFpSc62'
const hash2 = '$2b$10$I9ZppAqC8SmVYfoXSOkLiu4wlIVlXcxOtfdbdUqpiwMCaER8/3q5u'

bcrypt.compare(clearText, hash1, (err, result) => {
  console.log(result);
})