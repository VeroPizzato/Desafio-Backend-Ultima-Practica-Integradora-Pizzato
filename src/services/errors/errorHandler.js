const { ErrorCodes } = require("./errorCodes")
/**
 * @type {import("express").ErrorRequestHandler} *
 */

const errorHandler = (error, req, res, next) => {
    console.log(error.cause);
    switch (error.code) {
        case ErrorCodes.INVALID_TYPES_ERROR:          
            req.logger.warning(error.name+ `${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            res.status(400).send({ status: 'error', error: error.name, cause: error.cause })            
            break;
        case ErrorCodes.INVALID_PARAM_ERROR:            
            req.logger.warning(error.name+ `${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            res.status(400).send({ status: 'error', error: error.name, cause: error.cause })           
            break;
        case ErrorCodes.DATABASE_ERROR:
            req.logger.error(error.name+ `${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            res.status(500).send({ status: 'error', error: error.name, cause: error.cause })
            break;
        case ErrorCodes.ROUTING_ERROR:
            req.logger.error(error.name+ `${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            res.status(500).send({ status: 'error', error: error.name, cause: error.cause })
            break;
        case ErrorCodes.NOT_FOUND:
            req.logger.fatal(error.name+ `${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            res.status(404).send({ status: 'error', error: error.name, cause: error.cause })
            break;
        default:
            req.logger.error(error.name+ `${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            res.status(500).send({ status: 'error', error: "Unhandled error" })
            break;
    }

    next(error)
}

module.exports = { errorHandler }