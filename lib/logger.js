'use strict';

var winston = require('winston');

var consoleLogger = new winston.transports.Console({
    level: 'info',
    timestamp: function() {
      return new Date().toISOString();
    },
    colorize: true
  });

var logger = new winston.Logger({
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  transports: [ consoleLogger ]
});

module.exports = logger;
