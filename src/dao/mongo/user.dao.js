const UserModel = require("./models/user.model")
const { hashPassword, isValidPassword } = require('../../utils/hashing')

class UserDAO {

    findByEmail = async (email) => {
        try {
            const user = await UserModel.findOne(email)
            return user?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    getUserByEmail = async (email) => {
        try {
            const user = await UserModel.findOne({ email })
            return user?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    getUserByCartId = async (idCart) => {
        try {
            const user = await UserModel.findOne({ cart: idCart })
            return user?.toObject() ?? null
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async getUsers() {
        try {
            const users = await UserModel.find()
            return users.map(u => u.toObject())
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async getUserById(id) {
        try {
            const user = await UserModel.findById(id)
            return user?.toObject() ?? false
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async saveUser(user) {
        try {
            const savedUser = await UserModel.create(user)
            return savedUser.toObject()
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async updateUser(email, pass) {
        try {
            const result = await UserModel.updateOne(email, { $set: { password: pass } })
            return result
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async validarPassRepetidos(email, pass) {
        try {
            //const user = await this.findByEmail({ email })
            const user = await UserModel.findOne({ email })
            return hashPassword(pass) == user.password // misma contraseña que la anterior 
            //return isValidPassword(pass, user.password) 
        }
        catch (err) {
            console.error(err)
            return null
        }
    }

    async changeRole(idUser) {
        try {
            const user = await this.getUserById(idUser)
            if (user) {
                const requiredDocuments = ['identificacion', 'comprobanteDomicilio', 'comprobanteCuenta']
                const hasRequiredDocuments = requiredDocuments.every(doc => user.documents.some(d => d.name === doc))
                // Para cada documento en requiredDocuments, se ejecuta una función que verifica si hay al menos un documento en user.documents que tenga un name igual al nombre del documento actual (doc)
                if (user.rol == 'user') {
                    if (!hasRequiredDocuments) {
                        return res.sendUserError('El usuario  no ha terminado de procesar su solicitud')
                        // return res.status(400).json({
                        //     error: 'El usuario  no ha terminado de procesar su solicitud'
                        // })
                    }
                    user.rol = 'premium'
                }
                else if (user.rol == 'premium')
                    user.rol = 'user'
                else
                    // en otro caso no se puede cambiar el rol
                    return false

                await UserModel.updateOne({ _id: idUser }, { $set: { rol: user.rol } })  // se cambió el rol
                return true
            }
            else
                return false
        }
        catch (err) {
            console.error(err)
            return false
        }
    }

    async lastConnection(email, date) {
        return await UserModel.updateOne(email, { $set: { last_connection: date } })
    }

    async updateUserDocuments(userId, name, files) {
        const user = await this.getUserById(userId)

        const fileLink = files ? files.path : null // obtengo el enlace del archivo

        if (fileLink) {
            user.documents.push({ name, reference: fileLink })
        }

        user.status = "uploaded"

        const result = await this.updateUser(user)

        if (result) {
            return res.sendSuccess(`${user} actualizado`)
            // res.status(200).json({
            //     message: `${user} actualizado`
            // })
        } else {
            return res.sendUserError('Se produjo un error al intentar actualizar el usuario')
            // res.status(400).json({
            //     error: 'Se produjo un error al intentar actualizar el usuario'
            // })
        }

    }
}

module.exports = { UserDAO }