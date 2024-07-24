const { ProductDAO } = require("../dao/mongo/product.dao")
const { UserDAO } = require("../dao/mongo/user.dao")
const { ProductsService } = require('../services/products.service')
const { JwtServices } = require('../services/jwt.service')

class CartsService {

    constructor(dao) {
        this.dao = dao
        this.productsService = new ProductsService(new ProductDAO())
        this.jwtServices = new JwtServices(new UserDAO)
    }

    async getCarts () {
        return await this.dao.getCarts()
    }

    async getCartByCId (cid) {
        return await this.dao.getCartByCId(cid)
    }

    async addCart (products) {
        await this.dao.addCart(products)
    }

    async addProductToCart (cartId, prodId, quantity) { 
        const product = await this.productsService.getProductById(prodId)         
        if (!product)
            return false       
        const userOwner = await this.jwtServices.getUserByEmail(product.owner)     
        if (!userOwner)
            return false       
        const userCart = await this.jwtServices.getUserByCartId(cartId)         
        if (!userCart)
            return false      
        if ((userCart.email == userOwner.email) && (userCart.rol == "premium"))
            return false  // un usuario premium NO puede agregar un producto que le pertenece
        else {           
            return await this.dao.addProductToCart(cartId, prodId, quantity)
        }     
    }

    async updateCartProducts (cartId, products) {  
        await this.dao.updateCartProducts(cartId, products)
    }   

    async deleteCart (cid) {
        await this.dao.deleteCart(cid)
    }

    async deleteProductToCart (cartId, prodId) {
        return await this.dao.deleteProductToCart(cartId, prodId)
    }

    // async deleteAllProductCart (cartId) {
    //     return await this.dao.deleteAllProductCart(cartId)
    // }
}

module.exports = { CartsService }