const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    first_name: String,
    last_name: String,
    age: Number,
    email: {
        type: String,
        unique: true
    },
    password: String,
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    },
    rol: {
        type: String,
        default: 'user'  // puede ser user, admin o premium
    },
    status: { 
        type: String, 
        default: 'empty' 
    },
    last_connection: String,
    documents: {
        type: [
            {
                name: {
                    type: String
                },
                reference: {
                    type: String
                },
            }
        ],
        default: []
    }
})

module.exports = mongoose.model('User', schema, 'users')