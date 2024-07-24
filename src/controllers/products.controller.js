const { ProductsService } = require('../services/products.service')
const { Product: ProductDAO } = require('../dao')
const { ProductDTO } = require('../dao/DTOs/product.dto')

class ProductsController {

    constructor() {
        this.service = new ProductsService(new ProductDAO())
    }

    async getProducts(req, res) {
        try {
            const products = await this.service.getProducts(req.query)
            const result = {
                payload: products.totalDocs,
                totalPages: products.totalPages,
                prevPage: products.prevPage,
                nextPage: products.nextPage,
                page: products.page,
                hasPrevPage: products.hasPrevPage,
                hasNextPage: products.hasNextPage,
                prevLink: products.hasPrevPage ? `/products?page=${products.prevPage}` : null,
                nextlink: products.hasNextPage ? `/products?page=${products.nextPage}` : null
            }

            // let status = 'success'
            // if (products.docs.length === 0)
            //     status = 'error'
            // let objResult = {
            //     status,
            //     ...result
            // }

            // HTTP 200 OK
            //return res.status(200).json(objResult)
            //return res.sendSuccess(new ProductDTO(products.docs))

            return res.sendSuccess(result)
        }
        catch (err) {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            return res.sendServerError(err)
            // return res.status(500).json({
            //     message: err.message
            // })
        }
    }

    async getProductById(req, res) {
        try {
            const prodId = req.pid
            const producto = await this.service.getProductById(prodId)
            if (!producto) {
                return producto === false
                    ? res.sendNotFoundError({ message: 'Not found!' }, 404)
                    : res.sendServerError({ message: 'Something went wrong!' })
            }
            return res.sendSuccess(new ProductDTO(producto))
            //res.status(200).json(producto)    // HTTP 200 OK
        } catch (err) {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            return res.sendServerError(err)
            // return res.status(500).json({
            //     message: err.message
            // })
        }
    }

    async addProduct(req, res) {
        try {
            const user = req.session.user
            const { title, description, price, thumbnail, code, stock, status, category } = req.body
            if (user.rol == "admin" || user.rol == "premium") {  // no hace falta porque lo valida el middleware
                const createdProduct = await this.service.addProduct(title, description, price, thumbnail, code, stock, status, category, user.email)
                //res.sendCreatedSuccess('Producto agregado correctamente')
                res.sendCreatedSuccess(createdProduct._id)
                //return res.status(201).json({ success: true })
            }
            else
                res.sendUnauthorizedError(`El usuario ${user.email} no tiene permisos para crear productos`)
        } catch (err) {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            return res.sendUserError(err)
            // return res.status(400).json({
            //     message: err.message
            // })
        }
    }

    async updateProduct(req, res) {
        try {            
            const prodId = req.pid
            const datosAUpdate = req.body            
            // if (isNaN(prodId)){
            //     res.status(400).json({ error: "Invalid number format" })
            //     return
            // }
            const producto = await this.service.getProductById(prodId)
            if (!producto) {
                return producto === false
                    ? res.sendNotFoundError({ message: 'Not found!' }, 404)
                    : res.sendServerError({ message: 'Something went wrong!' })
            }
            if ((!req.session.user && req.session.user.rol !== 'admin') ||
                (!req.session.user && req.session.user.email !== producto.owner)) {
                req.logger.error(`${error} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()} `);
                return res.send({
                    status: "Error",
                    error: 'No autorizado'
                });
            }
            const result = this.service.updateProduct(prodId, datosAUpdate)
            //return res.sendSuccess(result)
            //return res.status(200).json(result)
            return res.sendSuccess(new ProductDTO(datosAUpdate))
        } catch (err) {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            res.sendUserError(err)
            // return res.status(400).json({
            //     message: err.message
            // })
        }
    }

    async deleteProduct(req, res) {
        try {
            const prodId = req.pid
            const producto = await this.service.getProductById(prodId)                    
            if (!producto) {
                return producto === false
                    ? res.sendNotFoundError({ message: 'Not found!' }, 404)
                    : res.sendServerError({ message: 'Something went wrong!' })
            }
            if ((!req.session.user && req.session.user.rol !== 'admin') ||
                (!req.session.user && req.session.user.email !== producto.owner)) {
                req.logger.error(`${error} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()} `)
                return res.send({
                    status: "Error",
                    error: 'No autorizado'
                })
            }           
            await this.service.deleteProduct(prodId)
            return res.sendSuccess('Producto Eliminado correctamente')
            // return res.status(200).json({ message: "Producto Eliminado correctamente" })    // HTTP 200 OK
        }
        catch (err) {
            req.logger.error(`${err} - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
            return res.sendServerError(err)
            // return res.status(500).json({
            //     message: err.message
            // })
        }
    }

}

module.exports = { ProductsController }
