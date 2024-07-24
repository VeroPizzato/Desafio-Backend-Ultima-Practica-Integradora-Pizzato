// const { ProductsStorage } = require('../persistence/products.storage')
const { Product } = require('../dao')

const { ProductsService } = require('../services/products.service')

const { CustomError } = require('../services/errors/CustomError')
const { ErrorCodes } = require('../services/errors/errorCodes')
const { generateProductErrorInfo } = require('../services/errors/info')

const productDAO = new Product()
const productsService = new ProductsService(productDAO)

const soloNumYletras = (code) => {
    return (/^[a-z A-Z 0-9]+$/.test(code))
}

const soloNumPositivos = (code) => {
    return (/^[0-9]+$/.test(code) && (code > 0))
}

const soloNumPositivosYcero = (code) => {
    return (/^[0-9]+$/.test(code) && (code >= 0))
}

const validarDatos = (title, description, price, thumbnail, code, stock, status, category, owner) => {
    if (!title || !description || !price || !thumbnail || !code || !stock || !status || !category || !owner) {
        return false
    }
    if (isNaN(price) || isNaN(stock)) {
        return false
    }
    if (!soloNumPositivos(price)) {
        return false
    }
    if (!soloNumPositivosYcero(stock)) {
        return false
    }
    if (!Array.isArray(thumbnail)) {
        return false
    }
    else {
        let rutasValidas = true
        thumbnail.forEach(ruta => {
            if (typeof ruta != "string") {
                rutasValidas = false
                return
            }
        })
        if (!rutasValidas) {
            return false
        }
    }
    if (!soloNumYletras(code)) {
        return false
    }
    var boolStatus = status
    if (typeof boolStatus != "boolean") {
        return false
    }

    return true
}

// Middleware para validacion de datos al agregar un producto 
const validarNuevoProducto = async (req, res, next) => { 
    const product = req.body
    product.price = +product.price
    product.stock = +product.stock
    //product.thumbnail = [product.thumbnail]
    product.thumbnail = product.thumbnail
    product.status = JSON.parse(product.status)

    const title = product.title
    const description = product.description
    const price = product.price
    const thumbnail = product.thumbnail
    const code = product.code
    const stock = product.stock
    const status = product.status
    const category = product.category
    const owner = product.owner
       
    try {
        if (validarDatos(title, description, price, thumbnail, code, stock, status, category, owner)) {
            const prod = await productsService.getProductByCode(product.code)         
            if (prod) {
                // res.status(400).json({ error: "Codigo ya existente" })
                // return
                throw CustomError.createError({
                    name: 'InvalidProductData',
                    cause: `No se puede crear el producto con código '${code}' porque dicho codigo ya existe.`,
                    message: 'Error trying to create a new product',
                    code: ErrorCodes.INVALID_TYPES_ERROR
                })
            }
            return next()
        }

        throw CustomError.createError({
            name: 'InvalidProductData',
            cause: generateProductErrorInfo({
                title,
                description,
                price,
                category,
                status,
                thumbnail,
                code,
                stock                
            }),
            message: 'Error trying to create a new product',
            code: ErrorCodes.INVALID_TYPES_ERROR
        })
    }
    catch {
        //return res.status(400).json({ error: "Producto nuevo invalido." })
        throw CustomError.createError({
            name: 'InvalidProductData',
            cause: generateProductErrorInfo({
                title,
                description,
                price,
                category,
                status,
                thumbnail,
                code,
                stock                
            }),
            message: 'Error trying to create a new product',
            code: ErrorCodes.INVALID_TYPES_ERROR
        })
    }
}

// Middleware para validacion de datos al actualizar un producto 
// Si algun dato es vacio no se actualiza
const validarProdActualizado = async (req, res, next) => {
    const idProd = req.params.pid
    const product = req.body

    const title = product.title
    const description = product.description
    const price = product.price
    const thumbnail = product.thumbnail
    const code = product.code
    const stock = product.stock
    const status = product.status
    const category = product.category
    const owner = product.owner
    try {     
        const prod = await productsService.getProductById(idProd)    
        if (!prod){
            throw CustomError.createError({
                name: 'ProductNotFound',
                cause: `No existe el producto`,
                message: 'Error trying to get a product',
                code: ErrorCodes.NOT_FOUND
            })
        } 
        if (validarDatos(title, description, price, thumbnail, code, stock, status, category, owner)) {                       
            const listadoProductos = await productsService.getProducts(req.query)            
            let producto = listadoProductos.docs.find(element => ((element.code === product.code) && (element._id != idProd)))
            if (producto) {               
                // res.status(400).json({ error: "Codigo ya existente" })
                // return
                throw CustomError.createError({
                    name: 'InvalidProductData',
                    cause: `No se puede actualizar el producto con código '${code}' porque dicho codigo ya existe.`,
                    message: 'Error trying to create a new product',
                    code: ErrorCodes.INVALID_TYPES_ERROR
                })
            }              
           
            next()
        }   
        throw CustomError.createError({
            name: 'InvalidProductData',
            cause: generateProductErrorInfo({
                title,
                description,
                price,
                category,
                status,
                thumbnail,
                code,
                stock                
            }),
            message: 'Error trying to create a new product',
            code: ErrorCodes.INVALID_TYPES_ERROR
        })
    }
    catch {
        //return res.status(400).json({ error: "No existe el producto a actualizar." })
        throw CustomError.createError({
            name: 'InvalidProductData',
            cause: generateProductErrorInfo({
                title,
                description,
                price,
                category,
                status,
                thumbnail,
                code,
                stock                
            }),
            message: 'Error trying to create a new product',
            code: ErrorCodes.INVALID_TYPES_ERROR
        })
    }
}

// Middleware para validacion de datos de un producto 
const validarProductoExistente = async (req, res, next) => {
    try {      
        let prodId = req.params.pid        
        // if (isNaN(prodId)) {
        //     res.status(400).json({ error: "Formato invalido." })
        //     return
        // }
        const producto = await productsService.getProductById(prodId)       
        if (!producto) {
            throw CustomError.createError({
                name: 'ProductNotFound',
                cause: `No existe el producto`,
                message: 'Error trying to get a product',
                code: ErrorCodes.NOT_FOUND
            })
            // return producto === false
            //     ? res.status({ message: 'Not found!' }, 404)                 
            //     : res.status({ message: 'Something went wrong!' })
        }        
        next()
    }
    catch {
        //return res.status(400).json({ error: "No existe el producto." })
        throw CustomError.createError({
            name: 'ProductNotFound',
            cause: `No existe el producto`,
            message: 'Error trying to get a product',
            code: ErrorCodes.NOT_FOUND
        })
    }
}

module.exports = { validarNuevoProducto, validarProdActualizado, validarProductoExistente }  