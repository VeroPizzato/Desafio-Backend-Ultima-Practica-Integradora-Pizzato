class UsersServices {

    constructor(dao) {
        this.dao = dao
    }

    async changeRole(idUser) {
        return await this.dao.changeRole(idUser)
    }

    async updateUserDocuments(userId, files) {
        return await this.dao.updateUserDocuments(userId, files)
    }
}

module.exports = { UsersServices }