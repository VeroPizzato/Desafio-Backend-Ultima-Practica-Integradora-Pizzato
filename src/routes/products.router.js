const { validarNuevoProducto, validarProductoExistente, validarProdActualizado } = require('../middlewares/product.middleware')
const { ProductsController } = require('../controllers/products.controller')
const { userIsLoggedIn, userIsAdmin, userIsAdminOrPremium } = require('../middlewares/auth.middleware')

const Router = require('./router')

const withController = callback => {
    return (req, res) => {          
        const controller = new ProductsController()
        return callback(controller, req, res)
    }
}

class ProductsRouter extends Router {
    init() {        
        this.get('/', withController((controller, req, res) => controller.getProducts(req, res)))         
       
        this.get('/:pid', validarProductoExistente, withController((controller, req, res) => controller.getProductById(req, res)))     

        this.post('/', userIsLoggedIn, userIsAdminOrPremium, validarNuevoProducto, withController((controller, req, res) => controller.addProduct(req, res))) 
                
        this.put('/:pid', userIsLoggedIn, userIsAdmin, validarProdActualizado, withController((controller, req, res) => controller.updateProduct(req, res)))

        this.delete('/:pid', userIsLoggedIn, userIsAdmin, validarProductoExistente, withController((controller, req, res) => controller.deleteProduct(req, res)))  
             
    }
}

module.exports = ProductsRouter

