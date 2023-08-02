'use strict';

const bcrypt = require("bcryptjs");

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

options.tableName = 'Users';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert(options, [
      {
        email: 'alice@user.io',
        firstName: 'Alice',
        lastName: 'Lee',
        username: 'AliceLee123',
        hashedPassword: bcrypt.hashSync('password1')
      },
      {
        email: 'bob@user.io',
        firstName: 'Bob',
        lastName: 'Smith',
        username: 'BobSmith877',
        hashedPassword: bcrypt.hashSync('password2')
      },
      {
        email: 'chad@user.io',
        firstName: 'Chad',
        lastName: 'William',
        username: 'ChadWilliam254',
        hashedPassword: bcrypt.hashSync('password3')
      },
      {
        email: 'timmey@user.io',
        firstName: 'Timmey',
        lastName: 'Black',
        username: 'TB1970',
        hashedPassword: bcrypt.hashSync('password4')
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options, {
      username: { [Op.in]: ['AliceLee123', 'BobSmith877', 'ChadWilliam254', 'TB1970'] }
    }, {});
  }
};
