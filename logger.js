/**
 * Created by jordi on 13/03/15.
 */
var winston = require( 'winston' ),
    fs = require( 'fs' ),
    logDir = 'log',
    env = process.env.NODE_ENV || 'development',
    logger;

winston.setLevels( winston.config.npm.levels );
winston.addColors( winston.config.npm.colors );

if ( !fs.existsSync( logDir ) ) {
// Crear si no E
    fs.mkdirSync( logDir );
}
logger = new( winston.Logger )( {
    transports: [
        new winston.transports.Console( {
            level: 'warn',
            colorize: true
        } ),
        new winston.transports.File( {
            level: env === 'development' ? 'debug' : 'info',
            filename: logDir + '/logs.log',
            maxsize: 1024 * 1024 * 10 //10MB màx
        } )
    ],
    exceptionHandlers: [
        new winston.transports.File( {
            filename: 'log/exceptions.log'
        } )
    ]
} );

module.exports = logger;