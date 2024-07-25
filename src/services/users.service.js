class UsersServices {

    constructor(dao) {
        this.dao = dao
    }

    async changeRole(idUser) {
        return await this.dao.changeRole(idUser)
    }

    async uploadDocuments(userId, files) {
        return await this.dao.uploadDocuments(userId, files)
    }
}

module.exports = { UsersServices }