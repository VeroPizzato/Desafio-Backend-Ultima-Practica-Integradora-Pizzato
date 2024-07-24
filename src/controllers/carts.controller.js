const { CartsService } = require('../services/carts.service')
const { ProductsService } = require('../services/products.service')
const { JwtServices } = require('../services/jwt.service')
const { Cart: CartDAO, Product: ProductDAO } = require('../dao')
const { CartDTO } = require('../dao/DTOs/cart.dto')
const { addTicket } = require('./ticket.controller')
const { UserDAO } = require('../dao/mongo/user.dao')
const { CustomError } = require('../services/errors/CustomError')
const { ErrorCodes } = require('../services/errors/errorCodes')

class CartsController {

    constructor() {
        this.cartsService = new CartsService(new CartDAO())
        this.productsService = new ProductsService(new ProductDAO())
        this.jwtServices = new JwtServices(new UserDAO)
    }

    async getCarts(req, res) {
        try {
            const carts = await this.cartsService.getCarts()
            const cartsDTO = carts.map(cart => new CartDTO(cart))
            return res.sendSuccess(cartsDTO)
        }
        catch (err) {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            return res.sendServerError(err)
            // return res.status(500).json({
            //     message: err.message
            // })
        }
    }

    async getCartByCId(req, res) {
        try {
            let cidCart = req.cid
            let cartByCID = await this.cartsService.getCartByCId(cidCart)
            if (!cartByCID) {
                return cartByCID === false
                    ? res.sendNotFoundError({ message: 'Not found!' }, 404)
                    : res.sendServerError({ message: 'Something went wrong!' })
            }
            res.sendSuccess(new CartDTO(cartByCID))
            //res.status(200).json(cartByCID)    // HTTP 200 OK
        }
        catch {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            return res.sendServerError(err)
            // return res.status(500).json({
            //     message: err.message
            // })
        }
    }

    async addCart(req, res) {
        try {
            let { products } = req.body
            await this.cartsService.addCart(products)
            res.sendCreatedSuccess('Carrito agregado correctamente')
            //res.status(201).json({ message: "Carrito agregado correctamente" })  // HTTP 201 OK
        } catch (err) {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            res.sendUserError(err)
            // return res.status(400).json({
            //     message: err.message
            // })
        }
    }

    async addProductToCart(req, res) {
        try {
            let idCart = req.cid
            let idProd = req.pid
            let quantity = +req.body.quantity         
                      
            // const producto = await this.productsService.getProductById(prodId)
            // if (!producto) {
            //     return res.status(404).json({
            //         result: 'error',
            //         message: 'Producto no encontrado'
            //     });
            // }

            // if (!req.session.user || (req.session.user.rol === 'premium' && req.session.user.email === producto.owner)) {
            //     req.logger.error(`${error} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()} `)
            //     return res.send({
            //         status: "Error",
            //         error: 'No autorizado'
            //     })
            // }
            
            const result = await this.cartsService.addProductToCart(idCart, idProd, quantity)
            if (result) {
                res.sendSuccess(`Se agregaron ${quantity} producto/s con ID ${idProd} al carrito con ID ${idCart}`)
                //res.status(200).json(`Se agregaron ${quantity} producto/s con ID ${idProd} al carrito con ID ${idCart}`)    // HTTP 200 OK
            }
            else {
                throw CustomError.createError({
                    name: 'InvalidAction',
                    cause: `No se pudo agregar el producto '${idProd}' al carrito '${idCart}'`,
                    message: 'Error trying to add a product to a cart',
                    code: ErrorCodes.INVALID_TYPES_ERROR
                })
            }
        } catch (err) {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            return res.sendServerError(err)
            // return res.status(500).json({
            //     message: err.message
            // })
        }
    }

    async updateCartProducts(req, res) {
        try {
            let cartId = req.cid
            const { products } = req.body
            await this.cartsService.updateCartProducts(products)
            // HTTP 200 OK
            res.status(200).json(`Los productos del carrito con ID ${cartId} se actualizaron exitosamente.`)
        }
        catch (err) {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            return res.sendServerError(err)
            // return res.status(500).json({ message: err.message })
        }
    }   

    async deleteCart(req, res) {
        try {
            let cartId = req.cid
            await this.cartsService.deleteCart(cartId)
            res.status(200).json({ message: "Carrito eliminado correctamente" })  // HTTP 200 OK
        } catch (err) {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            return res.sendServerError(err)
            // return res.status(500).json({
            //     message: err.message
            // })
        }
    }

    async deleteProductToCart(req, res) {
        try {
            let cartId = req.cid
            let prodId = req.pid            
            const result = await this.cartsService.deleteProductToCart(cartId, prodId)
            if (result)
                // HTTP 200 OK
                res.sendSuccess(`Se eliminó el producto con ID ${prodId} del carrito con ID ${cartId}.`)
            else {
                res.sendUserError(err)
                // HTTP 400
                //res.status(400).json({ error: "Sintaxis incorrecta!" })
            }
        }
        catch (err) {
            req.logger.error(`${`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            return res.sendServerError(err)
            // return res.status(500).json({ message: err.message })
        }
    }

    // async deleteAllProductCart (req, res) {
    //     try {
    //         let cartId = req.cid
    //         await this.cartsService.deleteAllProductCart(cartId)
    //         res.status(200).json({ message: "Carrito vaciado correctamente" })  // HTTP 200 OK
    //     } catch (err) {
    //         return res.sendServerError(err)
    //         // return res.status(500).json({
    //         //     message: err.message
    //         // })
    //     }
    // }

    async HayStock(id, quantity) {
        try {
            const producto = await this.productsService.getProductById(id)
            const stock = producto.stock
            if (stock < quantity) {
                return false
            } else {
                return true
            }
        }
        catch (err) {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            return res.sendServerError(err)
        }
    }

    async finalizarCompra(req, res) {
        try {
            let cartId = req.cid
            let carrito = await this.cartsService.getCartByCId(cartId)
            let usuarioCarrito = req.session.user.email
            let totalCarrito = 0
            let cantidadItems = 0
            let cartItemsSinStock = []
            let arrayCartPendientes = []
            if (carrito) {
                await Promise.all(carrito.products.map(async (item) => {
                    const id = item._id._id.toString()
                    let hayStock = await this.HayStock(id, item.quantity)
                    if (hayStock) {
                        const stockAReducir = item.quantity
                        const result = await this.productsService.updateProduct(id, { $inc: { stock: -stockAReducir } })
                        const subtotal = stockAReducir * item._id.price
                        totalCarrito += subtotal
                        cantidadItems += item.quantity
                    } else {
                        arrayCartPendientes.push(item)
                        cartItemsSinStock.push(item._id._id.toString())
                    }
                }))

                if (totalCarrito > 0) {
                    const newTicket = {
                        code: this.generarCodUnico(),
                        amount: totalCarrito,
                        purchaser: usuarioCarrito
                    }

                    const ticketCompra = await addTicket(newTicket)  // GENERAR TICKET
                }
                //console.log(arrayCartPendientes)
                const prodSinComprar = await this.cartsService.updateCartProducts(cartId, arrayCartPendientes)  // quedan en el carrito los productos que no se pudieron comprar

                //console.log(cartItemsSinStock)
                return res.sendSuccess(cartItemsSinStock)  // devuelvo los id de los productos que no se puderon comprar
            }
        }
        catch (err) {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            return res.sendServerError(err)
        }
    }

    generarCodUnico() {
        return new Date().getTime().toString()
    }
}

module.exports = { CartsController }