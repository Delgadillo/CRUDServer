var mongoose = require('mongoose')
var Esquema = mongoose.Schema

// Modelo comentario (para nestear)
var comentario = new Esquema({
  IR: Number, // Identificador de Registro
  IE: Number, // Identificador de Empresa
  IU: String, // Identificador de Usuario
  ER: { // Estado de Registro
      type: Number,
      enum: [ 0, 1, 2, 3, 4, 5 ]
  },
  CR: Date, // Creación de Registro
  UM: Date, // Última Modificación,
  Titular: String, // Nombre del usuario
  Comentario: String, // Comentario
  Respuesta: String // Si es respuesta a un comentario, poner el IR del comentario, si no, 0
})

// Modelo tarea
module.exports = mongoose.model('Tarea', new Esquema({
  IR: Number, // Identificador de Registro
  IE: Number, // Identificador de Empresa
  IU: String, // Identificador de Usuario
  ER: { // Estado de Registro
      type: Number,
      enum: [ 0, 1, 2, 3, 4, 5 ]
  },
  CR: Date, // Creación de Registro
  UM: Date, // Última Modificación
  // Datos de la tarea
  Titulo: String,
  Categoria: String,
  Descripcion: String,
  Comentarios: [comentario]
}, { strict: false }), 'Tareas')
