const { UsersServices } = require('../services/users.service')
const { User: UserDAO } = require('../dao')

class UsersController {

    constructor() {        
        this.service = new UsersServices(new UserDAO())
    }

    async changeRole(req, res) {
        try {
            const idUser = req.params.uid
            const user = await this.service.changeRole(idUser)
            if (!user) {
                return user === false
                    ? res.sendNotFoundError(`El usuario '${idUser}' no existe`)
                    : res.sendServerError(`No se pudo cambiar el rol del usuario '${idUser}'`)
            }

            res.sendSuccess(`El usuario '${idUser}' cambió su rol'`)
        }
        catch (err) {
            res.sendServerError(err)
        }
    }

    async uploadDocuments(req, res) {       
        const idUser = req.params.uid
        //const {name, type} = req.body        
        const files = req.files
        if (!files || files.length === 0) {
            return res.sendUserError('No se subieron archivos')
            //return res.status(400).send('No se subieron archivos')
        }        
        const user = await this.service.uploadDocuments(idUser, files)
        req.logger.info('Documentación actualizada exitosamente')
        res.sendCreatedSuccess('Documento actualizado de forma correcta')
        //res.status(201).json({ message: 'Documento actualizado de forma correcta' })
    }
    
}


module.exports = { UsersController }