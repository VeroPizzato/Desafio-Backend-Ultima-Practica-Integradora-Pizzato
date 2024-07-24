const mongoose = require('mongoose')
const { ProductDAO } = require('../src/dao/mongo/product.dao.js')

describe('Testing Product DAO with Chai', () => {
    let chai
    let expect
    before(async function () {
        chai = await import('chai')
        expect = chai.expect
        this.productsDao =  new ProductDAO()  
        this.timeout(5000)       
        await mongoose.connect('mongodb://localhost:27017', { dbName: 'testing' })
        this.connection = mongoose.connection
    })

    after(async function () {
        await this.connection.db.dropDatabase()
        await this.connection.close()
    })

    beforeEach(async function () {
        await this.connection.db.collection('products').deleteMany({})
        this.timeout(5000)
    })

    it('debe devolver un arreglo con todos los productos', async function () {
        const result = await this.productsDao.getProducts({})  
        expect(Array.isArray(result.docs)).to.be.equals(true)  
    })

    it('debe agregar correctamente un producto nuevo', async function () {
        const mockProduct = {
            title: 'Tester',
            description: 'Tester',
            price: 100,
            thumbnail: ['images/memoria.png'],   
            code: 'tester123',
            stock: 10,
            status: true,
            category: 'componente'            
        }        

        const newProduct = await this.productsDao.addProduct(mockProduct.title, mockProduct.description, mockProduct.price, mockProduct.thumbnail, mockProduct.code, mockProduct.stock, mockProduct.status, mockProduct.category, 'tester@gmail.com')
        expect(newProduct._id.toString()).length.greaterThan(0)         
    })

    it('debe eliminar correctamente un producto', async function () {
        const mockProduct = {
            title: 'Tester',
            description: 'Tester',
            price: 100,
            thumbnail: ['images/memoria.png'],   
            code: 'tester123',
            stock: 10,
            status: true,
            category: 'componente'            
        }       

        const newProduct = await this.productsDao.addProduct(mockProduct.title, mockProduct.description, mockProduct.price, mockProduct.thumbnail, mockProduct.code, mockProduct.stock, mockProduct.status, mockProduct.category, 'tester@gmail.com')

        await this.productsDao.deleteProduct(newProduct._id.toString())

        const product = await this.productsDao.getProductById({ _id: newProduct._id.toString() })

        expect(product).to.deep.equal(false)
    })
})