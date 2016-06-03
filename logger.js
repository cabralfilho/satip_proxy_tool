/**
 * Created by jordi on 13/03/15.
 */

var logger = require( 'winston' );
var fs = require('fs');

var LogModule =  function(verbosity) {

    if (!fs.existsSync('log')) {
// Crear si no E
        fs.mkdirSync('log');
    }
    var loggerOptions = {
        colorize: true
    };

    logger.remove(logger.transports.Console);

    if (verbosity.active == 1) {

        loggerOptions.level = 'verbose';
    } else if (verbosity.active == 2) {

        loggerOptions.level = 'debug';
    } else {
    }
    logger.add(logger.transports.Console, loggerOptions);

    if (verbosity.files !== undefined) {
        loggerOptions.filename = 'log/logFile.log'
        logger.add(logger.transports.File, loggerOptions);

        logger.handleExceptions(new logger.transports.File({filename: 'log/exceptions.log'}));
    }

    return logger;

}

exports.newLogger= function (Options) {
    return new LogModule(Options);
};