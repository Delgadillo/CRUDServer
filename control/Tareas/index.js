// =============================================================================
// Módulos externos que serán requeridos
// =============================================================================
var IdObjeto = require('mongoose').Types.ObjectId

// =============================================================================
// Módulos internos que serán requeridos
// =============================================================================
var modelo = require('../modelos')

// =============================================================================
// Módulos Tareas
// =============================================================================
var modulo = {
    // Alta de tarea
    Alta(Solicitud, Respuesta, Continuar) {
        // Se requiere una sesión
        if (!Solicitud.Sesion) {
            // Respuesta de petición no autorizada
            return Respuesta.json({
                Codigo: 401,
                Mensaje: "No hay una sesión.",
                Datos: null
            })
        } else {
            // Obtención de parámetros
            var parametros = Solicitud.body
    
            // Obtener parámetros
            var titulo = parametros.Titulo || ''
            var categoria = parametros.Categoria || ''
            var descripcion = parametros.Descripcion || ''
            
            // Error
            var error
    
            // Validar el campo descripcion
            if (!descripcion) {
                error = 'Agrega una descripción a la tarea.'
            }
    
            // Validar el campo categoría
            if (!categoria) {
                error = 'Selecciona una categoría.'
            }
            
            // Validar el campo título
            if (!titulo) {
                error = 'Falta el título de tarea.'
            }
    
            // Hay algún error
            if (error) {
                // Simular respuesta de petición inválida
                return Respuesta.json({
                    Codigo: 400,
                    Mensaje: error,
                    Datos: null
                })
            } else {
                // Preparar el modelo de datos tarea
                var tarea = new modelo.Tarea({
                    IR: 0, // Identificador de Registro
                    IE: Solicitud.Sesion.IE, // Identificador de Empresa
                    IU: Solicitud.Sesion.IU, // Identificador de Usuario
                    ER: 1, // Tarea nueva (1: Activa)
                    CR: new Date(), // Creación de Registro
                    UM: new Date(), // Última Modificación
                    // Datos de la tarea
                    Titulo: titulo,
                    Categoria: categoria,
                    Descripcion: descripcion,
                    Comentarios: []
                })
                // Guardar la tarea
                tarea.save((Error, Tarea) => {
                    if (Error) {
                        // Envíar error
                        return Respuesta.json({
                            Codigo: 500,
                            Mensaje: "Error al crear tarea.",
                            Datos: Error
                        })
                    } else if (Tarea) {
                        // Envíar mensaje
                        return Respuesta.json({
                            Codigo: 201,
                            Mensaje: "Tarea registrada con éxito.",
                            Datos: null
                        })
                    } else {
                        console.log('No se gruardó la tarea')
                        // Envíar mensaje
                        return Respuesta.json({
                            Codigo: 202,
                            Mensaje: "Se recibió la petición.",
                            Datos: null
                        })
                    }
                })
            }
        }
    },
    // Baja de tarea
    Baja(Solicitud, Respuesta, Continuar) {
        // Se requiere una sesión
        if (!Solicitud.Sesion) {
            // Respuesta de petición no autorizada
            return Respuesta.json({
                Codigo: 401,
                Mensaje: "No hay una sesión.",
                Datos: null
            })
        } else {
            // Obtención de parámetros
            var parametros = Solicitud.body
    
            // Obtener parámetros
            var id = parametros._id || ''
            
            // Validar el campo id
            if (!id) {
                // Respuesta de petición inválida
                return Respuesta.json({
                    Codigo: 400,
                    Mensaje: "El campo id no es válido.",
                    Datos: null
                })
            } else {
                // "Eliminar" la tarea
                modelo.Tarea.updateOne({ _id: id, IU: Solicitud.Sesion.IU }, { $set: { ER: 0, UM: new Date() }}, (Error, Tarea) => {
                    if (Error) {
                        // Envíar error
                        return Respuesta.json({
                            Codigo: 500,
                            Mensaje: "Error al eliminar tarea.",
                            Datos: Error
                        })
                    } else if (Tarea) {
                        // Envíar mensaje
                        return Respuesta.json({
                            Codigo: 201,
                            Mensaje: "Tarea eliminada con éxito.",
                            Datos: null
                        })
                    } else {
                        console.log('No se eliminó la tarea')
                        // Envíar mensaje
                        return Respuesta.json({
                            Codigo: 202,
                            Mensaje: "Se recibió la petición.",
                            Datos: null
                        })
                    }  
                })
            }
        }
    },
    // Consulta de tareas
    Consulta(Solicitud, Respuesta, Continuar) {
        // Se requiere una sesión
        if (!Solicitud.Sesion) {
            // Respuesta de petición no autorizada
            return Respuesta.json({
                Codigo: 401,
                Mensaje: "No hay una sesión.",
                Datos: null
            })
        } else {
            // Obtención de parámetros
            var parametros = Solicitud.body

            // Consultar tareas no "Eliminadas"
            modelo.Tarea.find({ ER: { $ne: 0}, IU: Solicitud.Sesion.IU }, (Error, Tareas) => {
                if (Error) {
                    // Envíar error
                    return Respuesta.json({
                        Codigo: 500,
                        Mensaje: "Error al consultar tareas.",
                        Datos: Error
                    })
                } else if (Tareas) {
                    // Envíar mensaje
                    return Respuesta.json({
                        Codigo: 200,
                        Mensaje: Tareas.length ? "Hay " + Tareas.length + " tareas." : "No tienes tareas",
                        Datos: Tareas
                    })
                } else {
                    console.log('No se encontraron tareas')
                    // Envíar mensaje
                    return Respuesta.json({
                        Codigo: 202,
                        Mensaje: "Se recibió la petición.",
                        Datos: Tareas
                    })
                }  
            })
        }
    },
    // Detalle de tarea
    Detalle(Solicitud, Respuesta, Continuar) {
        // Se requiere una sesión
        if (!Solicitud.Sesion) {
            // Respuesta de petición no autorizada
            return Respuesta.json({
                Codigo: 401,
                Mensaje: "No hay una sesión.",
                Datos: null
            })
        } else {
            // Obtención de parámetros
            var parametros = Solicitud.body

            var id = parametros.Id || ""

            if (!id) {
                // Respuesta de petición inválida
                return Respuesta.json({
                    Codigo: 400,
                    Mensaje: "El campo id no es válido.",
                    Datos: null
                })
            } else {
                // Consultar tareas no "Eliminadas"
                modelo.Tarea.find({ ER: { $ne: 0}, _id: id, IU: Solicitud.Sesion.IU }, (Error, Tarea) => {
                    if (Error) {
                        // Envíar error
                        return Respuesta.json({
                            Codigo: 500,
                            Mensaje: "Error al consultar tarea.",
                            Datos: Error
                        })
                    } else if (Tarea) {
                        // Envíar mensaje
                        return Respuesta.json({
                            Codigo: 201,
                            Mensaje: "Tarea detallada con éxito.",
                            Datos: Tarea
                        })
                    } else {
                        console.log('No se encontraron tareas')
                        // Envíar mensaje
                        return Respuesta.json({
                            Codigo: 202,
                            Mensaje: "Se recibió la petición.",
                            Datos: Tarea
                        })
                    }  
                })
            }
        }
    },
    // Editar una o más tareas
    Edicion(Solicitud, Respuesta, Continuar) {
        // Se requiere una sesión
        if (!Solicitud.Sesion) {
            // Respuesta de petición no autorizada
            return Respuesta.json({
                Codigo: 401,
                Mensaje: "No hay una sesión.",
                Datos: null
            })
        } else {
            // Obtención de parámetros
            var parametros = Solicitud.body

            var id = parametros._id || ""
            var titulo = parametros.Titulo || ''
            var categoria = parametros.Categoria || ''
            var descripcion = parametros.Descripcion || ''

            // Error
            var error

            // Validar el campo descripcion
            if (!descripcion) {
                error = 'Agrega una descripción a la tarea.'
            }

            // Validar el campo categoría
            if (!categoria) {
                error = 'Selecciona una categoría.'
            }

            // Validar el campo título
            if (!titulo) {
                error = 'Falta el título de tarea.'
            }

            // Validar el campo id
            if (!id) {
                error = 'Falta el id de tarea.'
            }

            if (error) {
                // Respuesta de petición inválida
                return Respuesta.json({
                    Codigo: 400,
                    Mensaje: error,
                    Datos: null
                })
            } else {
                // Actualizar tareas no "Eliminadas" para el usuario actual
                modelo.Tarea.updateOne({ _id: IdObjeto(id), IU: Solicitud.Sesion.IU }, { $set: { UM: new Date(), Titulo: titulo, Categoria: categoria, Descripcion: descripcion } }, (Error, Tarea) => {
                    if (Error) {
                        // Envíar error
                        return Respuesta.json({
                            Codigo: 500,
                            Mensaje: "Error al editar tarea.",
                            Datos: Error
                        })
                    } else if (Tarea) {
                        // Envíar mensaje
                        return Respuesta.json({
                            Codigo: 201,
                            Mensaje: "Tarea modificada con éxito.",
                            Datos: Tarea
                        })
                    } else {
                        console.log('No se encontró la tarea')
                        // Envíar mensaje
                        return Respuesta.json({
                            Codigo: 202,
                            Mensaje: "Se recibió la petición.",
                            Datos: Tarea
                        })
                    }  
                })
            }
        }
    },
    // Interfaz para socket
    IO (Socket) {
        // Recibir el evento al conectar
        Socket.on('connection', function (Cliente) {
            // Cargar módulo seguridad
            console.log('Cliente conectado')
            Cliente.onevent = function () {
              console.log('Llegó un evento')
            }
        })
    }
}

// Exportar módulo
module.exports = modulo