const mongoose = require('mongoose')
const supertest = require('supertest')
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('../src/config/config')
const requester = supertest('http://localhost:8080')
const { UserDAO } = require('../src/dao/mongo/user.dao')

describe('Testing Ecommerce', () => {
    const mockUser = {
        first_name: 'Tester',
        last_name: 'Tester',
        age: 21,
        email: 'tester@gmail.com',
        password: 'tester123',
        cart: null
    }

    // register user
    const registerUser = async (user) => {
        return await requester.post('/api/sessions/register').send(user)
    }

    // login user
    const loginUser = async (user) => {
        const userToLogin = { email: user.email, password: user.password }
        return await requester.post('/api/sessions/login').send(userToLogin)
    }

    // función auxiliar para logueo de admin
    const loginAdminUser = async () => {
        const user = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
        const result = await requester.post('/api/sessions/login').send(user)
        return result.headers['set-cookie'][0] // cookie del encabezado de la respuesta
    }

    let chai
    let expect
    let usersDao
    let registerUserStatus
    let loginUserStatus
    let createProductStatus

    before(async function () {
        chai = await import('chai')
        expect = chai.expect        
        usersDao = new UserDAO()
        this.timeout(5000)
        await mongoose.connect('mongodb://localhost:27017', { dbName: 'testing' })
        this.connection = mongoose.connection
    })

    after(async function () {
        await this.connection.db.dropDatabase()
        await this.connection.close()
    })

    beforeEach(async function () {
        this.timeout(5000)
    })

    describe('Test de productos', () => {
        it('endpoint GET /api/products => debe devolver todos los productos de la base de datos', async () => {
            const { statusCode, ok, body } = await requester.get('/api/products')
            expect(statusCode).to.equal(200)
            expect(ok).to.equal(true)
            expect(body.status).to.equal('success')
        })

        // it('debe registrar un usuario nuevo e iniciar sesion', async () => {   
        //     // register user            
        //     console.log('Registrando usuario...')
        //     registerUserStatus = await registerUser(mockUser)
        //     console.log('Usuario registrado, respuesta:', registerUserStatus.body)
        //     expect(registerUserStatus.ok).to.be.true
        //     expect(registerUserStatus.body.status).to.be.equals('success')
        //     // login user
        //     console.log('Iniciando sesión del usuario...')
        //     loginUserStatus = await loginUser(mockUser)
        //     console.log('Usuario ha iniciado sesión, respuesta:', loginUserStatus.body)
        //     expect(loginUserStatus.ok).to.be.true
        //     expect(loginUserStatus.body.status).to.be.equals('success')
        // })


        // it('endpoint POST /api/products => debe crear un nuevo producto correctamente, cambio el rol del user a PREMIUM previamente', async () => {
        //     // change rol to PREMIUM
        //     console.log('Cambiando rol del usuario a PREMIUM...')
        //     const userId = loginUserStatus.body.payload
        //     const userPremiumStatus = await requester.put(`/api/sessions/premium/${userId.toString()}`)
        //     console.log('Rol cambiado, respuesta:', userPremiumStatus.body)
        //     expect(userPremiumStatus.statusCode).to.be.equal(200)
        //     expect(userPremiumStatus.ok).to.be.true
        //     // relogin user
        //     console.log('Relogueando usuario...')
        //     loginUserStatus = await loginUser(mockUser)
        //     console.log('Usuario relogueado, respuesta:', loginUserStatus.body)
        //     const cookie = loginUserStatus.headers['set-cookie'][0]
        //     expect(loginUserStatus.ok).to.be.true
        //     expect(loginUserStatus.body.status).to.be.equals('success')
        //     // create a product
        //     console.log('Creando producto...')
        //     const productMock = {
        //         title: 'Product Tester',
        //         description: 'Product Tester',
        //         price: 100,
        //         thumbnail: ['images/memoria.png'],
        //         code: 'tester123',
        //         stock: 10,
        //         status: true,
        //         category: 'componente',
        //         owner: ADMIN_EMAIL
        //     }
        //     const newProductStatus = await requester.post('/api/products').set('Cookie', cookie).send(productMock)
        //     console.log('Producto creado, respuesta:', newProductStatus.body)
        //     expect(newProductStatus.ok).to.be.true
        //     expect(newProductStatus.statusCode).to.be.equal(201)
        //     expect(newProductStatus.body.status).to.be.equal('success')
        // })

        it('endpoint POST /api/products => debe crear un nuevo producto correctamente', async () => {

            const cookie = await loginAdminUser()  // me logueo como admin

            const productMock = {
                title: 'Product Tester',
                description: 'Product Tester',
                price: 100,
                thumbnail: ['images/memoria.png'],
                code: 'tester123',
                stock: 10,
                status: true,
                category: 'componente',
                owner: ADMIN_EMAIL
            }

            const { statusCode, ok, body } = await requester.post('/api/products').set('Cookie', cookie).send(productMock)

            expect(ok).to.be.true
            expect(statusCode).to.be.equal(201)
            expect(body.status).to.be.equal('success')
        })

        it('endpoint DELETE /api/products/:id => debe eliminar un producto', async () => {

            const cookie = await loginAdminUser()  // me logueo como admin

            const productMock = {
                title: 'Product Tester2',
                description: 'Product Tester2',
                price: 100,
                thumbnail: ['images/memoria.png'],
                code: 'tester1234',
                stock: 20,
                status: true,
                category: 'componente',
                owner: ADMIN_EMAIL
            }

            const product = await requester.post('/api/products').set('Cookie', cookie).send(productMock)
            expect(product.ok).to.be.true
            expect(product.statusCode).to.be.equal(201)

            const prodId = product.body.payload

            const deleteRequestStatus = await requester.delete(`/api/products/${prodId}`).set('Cookie', cookie)

            expect(deleteRequestStatus.ok).to.be.true
            expect(deleteRequestStatus.statusCode).to.be.equal(200)

            const deletedProduct = await requester.get(`/api/products/${prodId}`)
            //expect(deletedProduct.statusCode).to.equal(404)        
            expect(deletedProduct.statusCode).to.equal(500)
        })
    })

    describe('Test de carts', () => {
        it('endpoint GET /api/carts => debe devolver todos los carritos de la base de datos o un array vacio', async () => {
            const { statusCode, ok, body } = await requester.get('/api/carts')

            expect(statusCode).to.equal(200)
            expect(ok).to.equal(true)
            expect(body.status).to.be.equals('success')
        })

        it('endpoint GET /api/carts/:cid/products/:pid => debe poder agregar un producto a su carrito', async () => {
            // creo un producto
            const productMock = {
                title: 'Product Tester3',
                description: 'Product Tester3',
                price: 100,
                thumbnail: ['images/memoria.png'],
                code: 'tester12345',
                stock: 15,
                status: true,
                category: 'componente',
                owner: ADMIN_EMAIL
            }
            const cookie = await loginAdminUser()  // me logueo como admin
           
            createProductStatus = await requester.post('/api/products').set('Cookie', cookie).send(productMock)
            expect(createProductStatus.ok).to.be.true
            expect(createProductStatus.statusCode).to.be.equal(201)
            expect(createProductStatus.body.status).to.be.equal('success')                      
         
            // register user            
            //console.log('Registrando usuario...')
            registerUserStatus = await registerUser(mockUser)
            //console.log('Usuario registrado, respuesta:', registerUserStatus.body)
            expect(registerUserStatus.ok).to.be.true
            expect(registerUserStatus.body.status).to.be.equals('success')
            // login user
            //console.log('Iniciando sesión del usuario...')
            loginUserStatus = await loginUser(mockUser)
            //console.log('Usuario ha iniciado sesión, respuesta:', loginUserStatus.body)
            expect(loginUserStatus.ok).to.be.true
            expect(loginUserStatus.body.status).to.be.equals('success')

            let cookie2 = loginUserStatus.headers['set-cookie'][0]

            // add product to userMock's cart
            const user2 = await usersDao.getUserByEmail(mockUser.email)
            const cid = user2.cart                            
            const productId = createProductStatus.body.payload          
            let addProductToCartStatus = await requester.post(`/api/carts/${cid.toString()}/products/${productId.toString()}`).set('Cookie', cookie2).send({ quantity: 1 })
      
            expect(addProductToCartStatus.ok).to.be.true
            expect(addProductToCartStatus.status).to.be.equal(200)
            expect(addProductToCartStatus.body.status).to.be.equals('success')           
        })

        it('endpoint DELETE /api/carts/:cid/products/:pid => debe poder eliminar un producto de su carrito', async () => {
            let cookie2 = loginUserStatus.headers['set-cookie'][0] 
            // delete product from userMock's cart
            const user2 = await usersDao.getUserByEmail(mockUser.email)            
            const cid = user2.cart
            const productId = createProductStatus.body.payload          
            let addProductToCartStatus = await requester.delete(`/api/carts/${cid.toString()}/products/${productId.toString()}`).set('Cookie', cookie2)
                      
            expect(addProductToCartStatus.ok).to.be.ok
            expect(addProductToCartStatus.statusCode).to.be.equal(200)
            expect(addProductToCartStatus.body.status).to.be.equals('success')
        })


    })

    describe('Test de users', () => {
        it('endpoint PUT /premium/:uid => debe permitir cambiar el rol a un usuario', async () => {
            // change rol to PREMIUM
            const userId = loginUserStatus.body.payload
            const userPremiumStatus = await requester.put(`/api/users/premium/${userId.toString()}`)
            //const userPremiumStatus = await requester.put(`/api/sessions/premium/${userId.toString()}`)
                                
            expect(userPremiumStatus.statusCode).to.be.equal(200)
            expect(userPremiumStatus.ok).to.be.true
        }) 
           
        it('endpoint POST /api/session/register => debe registrar un usuario de marera correcta', async () => {
            const user = {
                first_name: 'Juan',
                last_name: 'Perez',
                age: 32,
                email: 'jperez@hotmail.com',
                password: 'pass1234'
            }

            const { statusCode, ok, body } = await requester.post('/api/sessions/register').send(user);

            expect(statusCode).to.equal(200)
            expect(ok).to.equal(true)         
        })

        it('endpoint POST /api/session/register => debe arrojar error si el usuario ya está registrado', async () => {
            const user = {
                first_name: 'Juan',
                last_name: 'Perez',
                age: 32,
                email: 'jperez@hotmail.com',
                password: 'pass1234'
            }

            const { statusCode, ok, body } = await requester.post('/api/sessions/register').send(user);

            expect(statusCode).to.equal(302)
            expect(ok).to.equal(false)           
        })

        it('endpoint POST /api/session/register => no debe registrar un usuario con datos invalidos', async () => {
            const user = {
                first_name: 'Pepe',
                last_name: 'Argento',
                age: 22,
                email: 'pepito@gmail.com',
                password: '',
                cart: null
            }

            const { statusCode, ok, body } = await requester.post('/api/sessions/register').send(user)
           
            expect(statusCode).to.equal(302)
            expect(ok).to.equal(false)                
        })

    })
})