// =============================================================================
// Módulos externos que serán requeridos
// =============================================================================
var io = require('socket.io')
var sa = require('fs')
var express = require('express')
var parseador = require('body-parser')
var https = require('https')
var mongoose = require('mongoose')

// =============================================================================
// Parámetros Certificado/Llave SSL
// =============================================================================
const certificado = {
    cert: sa.readFileSync('./ssl/certificado.cert'),
    key: sa.readFileSync('./ssl/llave.key')
}

// =============================================================================
// Controlador de Módulos
// =============================================================================
var control = require('./control') // Controladores en general

// =============================================================================
// Parámetros de servidor y de servicio
// =============================================================================
var parametros = require('./parametros') // Parámetros en general

// =============================================================================
// Conectar con MongoDB
// =============================================================================
// Parámetros del servidor MongoDB
var servidor = parametros.Servidor.MongoDB

// Iniciar promesa de conexión con MongoDB
var promesa = mongoose.connect(
  'mongodb://' + (servidor.Anfitrion ? servidor.Anfitrion : 'localhost') +
  ':' + (servidor.Puerto ? servidor.Puerto : '27017') +
  '/' + servidor.Base, {
    auth: {
        user: servidor.Usuario,
        password: servidor.Clave
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: servidor.Limite
})

// Servicio
var servicio = express()

// Parámetros de la interfaz
var interfaz = parametros.Servicio

// Manejo de bodyparser
servicio.use(parseador.urlencoded({ extended: false }))

// Manejo de formato JSON
servicio.use(parseador.json())

// Politicas de seguridad
servicio.use(control.Seguridad.Politicas)

// Directiva de autorización a nivel de API
servicio.use(control.Seguridad.Directiva)

// Router api v1.0.0
var apiv1 = express.Router()

// =============================================================================
// API para el módulo Seguridad v1
// =============================================================================
var seguridadv1 = express.Router()
seguridadv1.post('/Registro', control.Seguridad.Registro)
seguridadv1.post('/Activacion', control.Seguridad.Activacion)
seguridadv1.post('/Acceder', control.Seguridad.Acceder)
seguridadv1.post('/Sesion', control.Seguridad.Sesion)
seguridadv1.post('/Recuperar', control.Seguridad.Recuperar)
seguridadv1.post('/Salir', control.Seguridad.Salir)

// Publicar módulo de api: Seguridad
apiv1.use('/Seguridad', seguridadv1)

// =============================================================================
// API para el módulo Tareas v1
// =============================================================================
var tareasv1 = express.Router()
tareasv1.post('/Alta', control.Tareas.Alta)
tareasv1.delete('/Baja', control.Tareas.Baja)
tareasv1.get('/Consulta', control.Tareas.Consulta)
tareasv1.get('/Detalle', control.Tareas.Detalle)
tareasv1.put('/Edicion', control.Tareas.Edicion)

// Publicar módulo de api: Tareas
apiv1.use('/Tareas', tareasv1)

// Servir la interfaz web
servicio.use(express.static(__dirname + "/" + interfaz.Web))

// Publicar API's versionadas
servicio.use('/apiv1', apiv1) // Versión 1.0.0

// =============================================================================
// Iniciar el servicio ssl
// =============================================================================
var servidor_ssl = https.createServer(certificado, servicio)

// Manejo del socket IO
var socket = io.listen(servidor_ssl)

// =============================================================================
// Enlace de módulos IO
// =============================================================================

// Implementar el módulo: Seguridad
socket.use(control.Seguridad.IO)

// Implementar el módulo: Tareas
socket.use(control.Tareas.IO)

// =============================================================================
// Si la promesa principal se cumple, Iniciar el servicio de interfaz Web y SSL
// =============================================================================
promesa.then((MongoDB) => {
  // Iniciar los servicos de HTTP
  servicio.listen(interfaz.Puerto)
  servidor_ssl.listen(interfaz.SSL)
  // El servicio está listo
  console.log('Conectado a MongoDB: ' + MongoDB.connection.name)
  console.info('Servicio iniciado.')
}).catch((Error) => {
  console.log('Error de MongoDB: ' + Error.message)
  console.info('Servicio abortado.')
})