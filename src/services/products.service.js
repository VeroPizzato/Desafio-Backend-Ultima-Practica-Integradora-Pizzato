class ProductsService {   
    
    constructor(dao) { 
        this.dao = dao      
    }

    async getProducts (filters) {    
        return await this.dao.getProducts(filters)
    }

    async getProductById (pid) {
        return await this.dao.getProductById(pid)
    }

    async getProductByCode(prodCode) {
        return await this.dao.getProductByCode(prodCode)
    }
    
    async addProduct (title, description, price, thumbnail, code, stock, status, category, owner) {
        return await this.dao.addProduct(title, description, price, thumbnail, code, stock, status, category, owner)
    }
    
    async updateProduct (prodId, producto) {
        return await this.dao.updateProduct(prodId, producto)
    }

    async deleteProduct (prodId) {
        return await this.dao.deleteProduct(prodId)
    }
}

module.exports = { ProductsService}