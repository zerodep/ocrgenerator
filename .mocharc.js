'use strict';

process.env.NODE_ENV = 'test';

module.exports = {
  reporter: 'spec',
  recursive: true,
  require: ['@babel/register'],
  timeout: 1000,
};
