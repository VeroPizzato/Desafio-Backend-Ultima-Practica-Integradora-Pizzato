const { UsersController } = require('../controllers/users.controller')
const Router = require('./router')
const uploader = require('../utils/uploaderFiles')

const withController = callback => {
    return (req, res) => {                       
        const controller = new UsersController()
        return callback(controller, req, res)
    }
}

class UsersRouter extends Router {
    init() {
               
        this.put('/premium/:uid', withController((controller, req, res) => controller.changeRole(req, res)))

        this.post('/:uid/documents', uploader.array('documents'), withController((controller, req, res) => controller.uploadDocuments(req, res)))
    }
}

module.exports = UsersRouter