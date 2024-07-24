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
            const user = await UserModel.findOne({email})     
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
                if (user.rol == 'user')
                    user.rol = 'premium'
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

}

module.exports = { UserDAO }