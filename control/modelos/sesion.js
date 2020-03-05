var mongoose = require('mongoose')
var Esquema = mongoose.Schema

module.exports = mongoose.model('Sesion', new Esquema({
  IR: Number, // Identificador de Registro
  IE: String, // Identificador de Empresa
  IU: String, // Identificador de Usuario
  ER: { // Estado de Registro
      type: Number,
      enum: [ 0, 1, 2, 3, 4, 5 ]
  },
  CR: Date, // Creación de Registro
  UM: Date, // Última Modificación
  // Datos de la sesión
  IP: String, // Dirección IP
  Sistema: String, // Sistema operativo
  Navegador: String, // Navegador Web
  Acceso: String, // Token de acceso
  // Datos del usuario (#REF Para historia)
  Titular: String,
  Nacimiento: Date,
  Telefono: String,
  Genero: String,
  Verificar: String,
  Credenciales: String,
  Rol: {
      type: Number,
      enum: [ 0, 1, 2, 3, 4, 5]
  }
}, { strict: false }), 'Sesiones')
