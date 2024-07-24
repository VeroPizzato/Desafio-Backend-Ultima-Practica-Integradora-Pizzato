const { JwtServices } = require('../services/jwt.service')
const { User: UserDAO } = require('../dao')
const { UserDTO } = require("../dao/DTOs/user.dto")
const { generateUser } = require("../mock/generateUser")
const transport = require("../config/transport")
const jwt = require('jsonwebtoken')
const { SECRET } = require('../config/config')

class SessionController {

    constructor() {
        this.service = new JwtServices(new UserDAO())
    }

    login(req, res) {
        try {
            if (!req.user) return res.sendUserError('Invalid credentials!')
            //if (!req.user) return res.status(400).send('Invalid credentials!')
            // crear nueva sesión si el usuario existe   
            //console.log(req.user)
            req.session.user = new UserDTO(req.user)
            //req.session.user = { _id: req.user._id, first_name: req.user.first_name, last_name: req.user.last_name, age: req.user.age, email: req.user.email, rol: req.user.rol, cart: req.user.cart }
            //return res.redirect('/products')
            return res.sendSuccess(req.user._id)
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    faillogin(req, res) {
        req.logger.warning(`Usuario no existe o password incorrecto - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()}`)
        res.sendUnauthorized('Login failed!')
        //res.send({ status: 'error', message: 'Login failed!' })
    }

    logout(req, res) {
        try {
            req.session.destroy(_ => {
                //res.redirect('/')
                res.sendSuccess(req.user._id)
            })
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    register(req, res) {
        try {
            //console.log(req.body)
            // no es necesario registrar el usuario aquí, ya lo hacemos en la estrategia!
            //res.redirect('/login')
            res.sendSuccess(`El usuario '${req.user.email}' se registró exitosamente.`)
        }
        catch (err) {
            //return res.status(500).json({ message: err.message })
            return res.sendServerError(err)
        }
    }

    failregister(req, res) {
        req.logger.info(`Failed register - ${req.method} en ${req.url} - ${new Date().toLocaleDateString()} `);
        res.sendUserError('Register failed!')
        //res.send({ status: 'error', message: 'Register failed!' })
    }

    async reset_password(req, res) {
        const token = req.params.token
        const { email, password } = req.body
        //console.log(email + " " + password)
        if (!token) {
            req.logger.info('Token no proporcionado')
            //return res.status(401).send('Token no proporcionado')
        }

        jwt.verify(token, SECRET, async (err, decoded) => {
            if (err) {
                req.logger.info('Enlace no válido o ha expirado')
                return res.redirect('/forget_password')
            }

            const result = await this.service.validarPassRepetidos(email, password)
            //console.log(result)          
            if (!result) {
                req.logger.info('Contraseña inválida, la nueva contraseña no puede ser igual a la contraseña anterior')
                return res.redirect('/')
            }

            req.logger.info('Contraseña actualizada')
            res.redirect('/login')
        })
    }

    forget_password = async (req, res) => {
        const { email } = req.body
        if (email) {
            try {
                const token = jwt.sign({ email }, SECRET, { expiresIn: '1h' })
                const resetLink = `http://localhost:8080/reset_password/${token}`
                await transport.sendMail({
                    from: 'Servicio Google <verizzato@gmail.com>',
                    to: `${email}`,
                    subject: 'Solicitud de restauracion de contraseña',
                    html: `<div>
                    <h2>Ingrese al siguiente link para poder restablecer su contraseña</h2>
                    <h4>Tenga en cuenta que el link expirará en una hora!!</h4>
                    <a href="${resetLink}">Restablecer contraseña</a>    
                </div>`,
                    attachments: []
                })

                // Si el envío de correo fue exitoso
                req.logger.info('Correo enviado con éxito')
                // res.status(200).json({
                //     message: 'Correo enviado con éxito'
                // })

            } catch (err) {
                req.logger.error(err)
                // console.error('Error al enviar el correo:', err)
                // res.status(500).json({
                //     err: 'Error al enviar el correo'
                // })
            }
        } else {
            req.logger.info('Correo electrónico no proporcionado')
            // res.status(400).json({
            //     err: 'Correo electrónico no proporcionado'
            // })
        }
    }

    failreset(req, res) {
        res.sendUserError('Reset password failed!')
        //res.send({ status: 'error', message: 'Reset password failed!' })
    }

    githubcallback(req, res) {
        req.session.user = new UserDTO(req.user)
        //req.session.user = req.user
        res.redirect('/products')
    }

    current(req, res) {
        if (!req.user) return res.sendUserError('No hay usuario logueado')
        //if (!req.user) return res.status(400).send('No hay usuario logueado')
        req.session.user = new UserDTO(req.user)
        //req.session.user = { _id: req.user._id, first_name: req.user.first_name, last_name: req.user.last_name, age: req.user.age, email: req.user.email, rol: req.user.rol, cart: req.user.cart }
        res.redirect('/profile')
    }

    mockingUsers(req, res) {
        const users = []
        for (let i = 0; i < 100; i++) {
            users.push(generateUser())
        }
        res.json(users)
    }

    async changeRole(req, res) {
        try {
            const idUser = req.params.uid
            const user = await this.service.changeRole(idUser)
            if (!user) {
                return user === false
                    ? res.sendNotFoundError(`El usuario '${idUser}' no existe`)
                    : res.sendServerError(`No se pudo cambiar el rol del usuario '${idUser}'`)
            }

            res.sendSuccess(`El usuario '${idUser}' cambió su rol'`)
        }
        catch (err) {
            res.sendServerError(err)
        }
    }

}

module.exports = { SessionController }