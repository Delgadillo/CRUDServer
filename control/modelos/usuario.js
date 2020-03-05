var mongoose = require('mongoose')
var Esquema = mongoose.Schema

module.exports = mongoose.model('Usuario', new Esquema({
  IR: Number, // Identificador de Registro
  IE: Number, // Identificador de Empresa
  IU: String, // Identificador de Usuario
  ER: { // Estado de Registro
      type: Number,
      enum: [ 0, 1, 2, 3, 4, 5 ]
  },
  CR: Date, // Creación de Registro
  UM: Date, // Última Modificación
  // Datos de la persona
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
}, { strict: false }), 'Usuarios')
