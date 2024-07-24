const mongoose = require('mongoose')
const { CartDAO } = require('../src/dao/mongo/cart.dao.js')

describe('Testing Cart DAO with Chai', () => {
    let chai
    let expect
    before(async function () {
        chai = await import('chai')
        expect = chai.expect
        this.cartsDao = new CartDAO()  
        this.timeout(5000)          
        await mongoose.connect('mongodb://localhost:27017', { dbName: 'testing' })
        this.connection = mongoose.connection
    })

    after(async function () {
        await this.connection.db.dropDatabase()
        await this.connection.close()
    })

    beforeEach(async function () {
        await this.connection.db.collection('carts').deleteMany({})
        this.timeout(5000)       
    })

    it('debe devolver un arreglo con todos los carritos', async function () {
        const result = await this.cartsDao.getCarts()       
        expect(Array.isArray(result)).to.be.equals(true) 
    }) 

    it('debe agregar correctamente un carrito nuevo', async function () {
        let products = [{
            _id: '6609b708bc530ed5f2d7d46a',
            quantity: 2
        },
        {
            _id: '660c2ef5eae06b4c3ff95037',
            quantity: 4
        },
        {
            _id: '660c2e59eae06b4c3ff95029',
            quantity: 1
        }]
        const mockCart = await this.cartsDao.addCart(products)
        expect(mockCart._id.toString()).length.greaterThan(0)
    })

    it('debe eliminar correctamente un carrito', async function () {
        let products = [{
            _id: '6609b708bc530ed5f2d7d46a',
            quantity: 2
        },
        {
            _id: '660c2ef5eae06b4c3ff95037',
            quantity: 4
        },
        {
            _id: '660c2e59eae06b4c3ff95029',
            quantity: 1
        }]
        const mockCart = await this.cartsDao.addCart(products)
        await this.cartsDao.deleteCart(mockCart._id)
        const cart = await this.cartsDao.getCartByCId({ _id: mockCart._id.toString() })
        expect(cart).to.deep.equal(false)
    })
})