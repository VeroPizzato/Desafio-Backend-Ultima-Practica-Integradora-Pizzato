const multer = require('multer')
//const path = require('path')

// configuramos multer. Usamos diskStorage para almacenar los archivos en el disco
// destination debe ser una función que recibe req (request), file (archivo luego de ser procesado por multer) y cb (callback que debe llamarse para indicar el directorio del archivo)
// filename, debe ser una función similar a la anterior, pero nos permitirá indicar el nombre del archivo cuando se haya cargado
const storage = multer.diskStorage({
    destination: function (req, file, cb) {        
        if (req.body.type === 'profile') {
            cb(null,`${__dirname}/../../public/profiles`)
            //cb(null, path.join(__dirname, '/../../public/profiles'))
        } else if (req.body.type === 'product') {
            cb(null,`${__dirname}/../../public/products`)
            //cb(null, path.join(__dirname, '/../../public/products'))
        } else if (req.body.type === 'document') {
            cb(null,`${__dirname}/../../public/documents`)
            //cb(null, path.join(__dirname, '/../../public/documents'))
        }  
    },
    filename: function (req, file, cb) {      
        cb(null, `${Date.now()}-${file.originalname}`) 
    }
})

// instanciamos el uploader. Idealmente, esto deberíamos tenerlo en un archivo separado, para poder
// reutilizarlo en distintos routers
const uploader = multer({ storage })

module.exports = uploader