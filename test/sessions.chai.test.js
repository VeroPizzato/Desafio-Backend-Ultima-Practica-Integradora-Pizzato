const mongoose = require('mongoose')
const { UserDAO } = require('../src/dao/mongo/user.dao.js')
const { hashPassword } = require('../src/utils/hashing')
const { CartDAO } = require('../src/dao/mongo/cart.dao')
const cartDAO = new CartDAO()

describe('Testing User DAO with Chai', () => {
    let chai
    let expect
    before(async function () {
        chai = await import('chai')
        expect = chai.expect
        this.usersDao =  new UserDAO()
        this.timeout(5000)         
        await mongoose.connect('mongodb://localhost:27017', { dbName: 'testing' })
        this.connection = mongoose.connection
    })

    after(async function () {
        await this.connection.db.dropDatabase()
        await this.connection.close()
    })

    beforeEach(async function () {
        await this.connection.db.collection('users').deleteMany({})
        this.timeout(5000)
    })
    
    it('debe devolver un arreglo con todos los usuarios', async function () {
        const result = await this.usersDao.getUsers()        
        expect(Array.isArray(result)).to.be.equals(true)
    })

    it('debe agregar correctamente un usuario nuevo', async function () {
        const emptyCart = cartDAO.getIdCart(await cartDAO.addCart([]))
        const mockUser = {
            first_name: 'Tester',
            last_name: 'Tester',
            age: 21,
            email: 'tester@gmail.com',
            password: hashPassword('tester123'),
            cart: emptyCart,
            rol: 'user'
        }        

        const newUser = await this.usersDao.saveUser(mockUser)
        expect(newUser._id.toString()).length.greaterThan(0)            
    })

    it('debe poder devolver un usuario por email', async function () {
        const emptyCart = cartDAO.getIdCart(await cartDAO.addCart([]))
        const mockUser = {
            first_name: 'Tester',
            last_name: 'Tester',
            age: 21,
            email: 'tester@gmail.com',
            password: hashPassword('tester123'),
            cart: emptyCart,
            rol: 'user'
        } 

        await this.usersDao.saveUser(mockUser)

        const user = await this.usersDao.findByEmail({ email: 'tester@gmail.com' })
        expect(user._id.toString()).length.greaterThan(0)
        expect(user.first_name).to.be.equal('Tester')
    })

})