// =============================================================================
// Módulos externos que serán requeridos
// =============================================================================
var sha1 = require('sha1')
var IdObjeto = require('mongoose').Types.ObjectId

// =============================================================================
// Módulos internos que serán requeridos
// =============================================================================
var modelo = require('../modelos')

// =============================================================================
// Módulos Seguridad
// =============================================================================
var modulo = {
    Sistema: function (Agente) {
        var resultado = Agente
        sistemas = [
            {Expresion: /windows nt 10/i, Nombre: 'Windows 10'},
            {Expresion: /windows nt 6.3/i, Nombre: 'Windows 8.1'},
            {Expresion: /windows nt 6.2/i, Nombre: 'Windows 8'},
            {Expresion: /windows nt 6.1/i, Nombre: 'Windows 7'},
            {Expresion: /windows nt 6.0/i , Nombre: 'Windows Vista'},
            {Expresion: /windows nt 5.2/i, Nombre: 'Windows Server 2003/XP x64'},
            {Expresion: /windows nt 5.1/i, Nombre: 'Windows XP'},
            {Expresion: /windows xp/i, Nombre: 'Windows XP'},
            {Expresion: /windows nt 5.0/i, Nombre: 'Windows 2000'},
            {Expresion: /windows me/i, Nombre: 'Windows ME'},
            {Expresion: /win98/i, Nombre: 'Windows 98'},
            {Expresion: /win95/i, Nombre: 'Windows 95'},
            {Expresion: /win16/i, Nombre: 'Windows 3.11'},
            {Expresion: /macintosh|mac os x/i, Nombre: 'Mac OS X'},
            {Expresion: /mac_powerpc/i, Nombre: 'Mac OS 9'},
            {Expresion: /linux/i, Nombre: 'Linux'},
            {Expresion: /ubuntu/i, Nombre: 'Ubuntu'},
            {Expresion: /iphone/i, Nombre: 'iPhone'},
            {Expresion: /ipod/i, Nombre: 'iPod'},
            {Expresion: /ipad/i, Nombre: 'iPad'},
            {Expresion: /android/i, Nombre: 'Android'},
            {Expresion: /blackberry/i, Nombre: 'BlackBerry'},
            {Expresion: /webos/i, Nombre: 'Mobile'}
        ]
    
        sistemas.forEach(function (sistema) {
            if (sistema.Expresion.test(Agente)) {
                resultado = sistema.Nombre
            }
        })
    
        return resultado
    },
    Navegador: function (Agente) {
        var resultado = Agente
        navegadores = [
            { Expresion: /msie/i, Nombre: 'Internet Explorer' },
            { Expresion: /firefox/i, Nombre: 'Firefox' },
            { Expresion: /chromium/i, Nombre: 'Chromium' },
            { Expresion: /safari/i, Nombre: 'Safari' },
            { Expresion: /chrome/i, Nombre: 'Chrome' },
            { Expresion: /edge/i, Nombre: 'Edge' },
            { Expresion: /opera/i, Nombre: 'Opera' },
            { Expresion: /netscape/i, Nombre: 'Netscape' },
            { Expresion: /maxthon/i, Nombre: 'Maxthon' },
            { Expresion: /konqueror/i, Nombre: 'Konqueror'  },
            { Expresion: /mobile/i, Nombre: 'Handheld Browser' }
        ];
        
        navegadores.forEach(function (navegador) {
            if (navegador.Expresion.test(Agente)) {
                resultado = navegador.Nombre
            }
        })
        return resultado
    },
    // Registrar una cuenta de usuario
    Registro(Solicitud, Respuesta, Continuar) {
        // Obtención de parámetros
        var parametros = Solicitud.body

        // Obtener parámetros
        var titular = parametros.Titular || ''
        var nacimiento = parametros.Nacimiento || ''
        var telefono = parametros.Telefono || ''
        var genero = parametros.Genero || ''
        
        // Error
        var error

        // Validar el campo género
        if (!genero) {
            error = 'Selecciona tu género.'
        }

        // Validar el campo teléfono
        if (!telefono) {
            error = 'Falta tu número celular.'
        } else {
            // Quitar símbolo de país(\+) y espacios('\s')
            telefono = telefono.toString().replace(/\+|\s/g, "")

            // Validar el teléfono
            if (telefono*1 > 0 && telefono.length >= 10 && telefono.length <= 15) {
                telefono = telefono*1
            } else {
                error = "El número de teléfono es inválido."
            }
        }

        // Validar el campo fecha de nacimiento
        if (!nacimiento) {
            error = 'Selecciona tu fecha de nacimiento.'
        }
        
        // Validar el campo título
        if (!titular) {
            error = 'El campo titular no es válido.'
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
            // Verificar existencia de teléfono
            modelo.Usuario.findOne({ Telefono: telefono, ER: 1 }, (Error, Usuario) => {
                if (Error) {
                    // Envíar error
                    return Respuesta.json({
                        Codigo: 500,
                        Mensaje: "Error al crear el usuario.",
                        Datos: Error
                    })
                } else if(Usuario) {
                    // Envíar error
                    return Respuesta.json({
                        Codigo: 409,  
                        Mensaje: "Éste número ya se encuentra registrado.",
                        Datos: null
                    })
                } else {
                    // Generar código de activación único
                    var codigo = sha1(new Date().getTime().toString()).toString().substring(0, 6).toString().toUpperCase()
                    console.log(codigo)
                    // Guardar el usuario
                    var usuario = new modelo.Usuario({
                        IE: 0, // Identificador de Empresa
                        IU: 0, // Identificador de Usuario
                        ER: 0, // Estado de Registro (0: Nuevo)
                        CR: new Date(), // Creación de Registro
                        UM: new Date(), // Última Modificación
                        Titular: titular,
                        Nacimiento: nacimiento,
                        Telefono: telefono,
                        Genero: genero,
                        Verificar: sha1(codigo)
                    })
                    // Guardar usuario
                    usuario.save((Error, Usuario) => {
                        if (Error) {
                            // Envíar error
                            return Respuesta.json({
                                Codigo: 500,
                                Mensaje: "Error al crear el usuario.",
                                Datos: Error
                            })
                        } else {
                            // Enviar teléfono para activar
                            return Respuesta.json({
                                Codigo: 201,
                                Mensaje: "Cuenta creada con éxito, recibirás un SMS.",
                                Datos: [{
                                    Telefono: telefono
                                }]
                            })
                        }
                    })
                }
            })
        }
    },
    // Activación de cuenta
    Activacion(Solicitud, Respuesta, Continuar) {
        // Obtención de parámetros
        var parametros = Solicitud.body

        // Obtener parámetros
        var telefono = parametros.Telefono || ''
        var clave = parametros.Clave || ''
        var codigo = parametros.Codigo || ''
        
        // Error
        var error

        // Validar el campo teléfono
        if (!telefono) {
            error = 'Falta tu número celular.'
        } else {
            // Quitar símbolo de país(\+) y espacios('\s')
            telefono = telefono.toString().replace(/\+|\s/g, "")

            // Validar el teléfono
            if (telefono*1 > 0 && telefono.length >= 10 && telefono.length <= 15) {
                telefono = telefono*1
            } else {
                error = "El número de teléfono es inválido."
            }
        }
        
        // Validar el campo clave
        if (!clave) {
            error = 'La clave no es válida.'
        }
        
        // Validar el campo código
        if (!codigo) {
            error = 'El código no es válido.'
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
            // Firma del código a verificar
            var verificar = sha1(codigo)
            // Buscar el usuario por teléfono y código
            modelo.Usuario.findOne({ Telefono: telefono, Verificar: verificar }, (Error, Usuario) => {
                if (Error) {
                    // Respuesta de petición inválida
                    return Respuesta.json({
                        Codigo: 400,
                        Mensaje: "Error al activar la cuenta.",
                        Datos: Error
                    })
                } else if (Usuario) { // El código es válido y el usuario existe
                    // Preparar datos del cliente
                    var ip = Solicitud.headers['x-forwarded-for'] || Solicitud.connection.remoteAddress
                    var sistema = modulo.Sistema(Solicitud.get('User-Agent'))
                    var navegador = modulo.Navegador(Solicitud.get('User-Agent'))
                    // Generar credenciales de acceso
                    var credenciales = sha1(telefono + ':' + clave)
                    // Generar token de acceso
                    var acceso = sha1(credenciales + "@" + new Date().getTime())
                    // Crear una sesión
                    var sesion = new modelo.Sesion ({
                        IE: 0, // Identificador de Empresa
                        IU: IdObjeto(Usuario._id), // Identificador de Usuario
                        ER: 1, // Estado de Registro (1: Activo)
                        CR: new Date(), // Creación de Registro
                        UM: new Date(), // Última Modificación
                        // Datos de la sesión
                        IP: ip, // Dirección IP
                        Sistema: sistema, // Sistema operativo
                        Navegador: navegador, // Navegador Web
                        Acceso: acceso, // Token de acceso
                        // Datos del usuario (#REF Para historia)
                        Titular: Usuario.Titular,
                        Nacimiento: Usuario.Nacimiento,
                        Telefono: Usuario.Telefono,
                        Genero: Usuario.Genero,
                        Verificar: Usuario.Verificar,
                        Credenciales: credenciales,
                        Rol: Usuario.Rol
                    })
                    
                    // Activar la cuenta
                    modelo.Usuario.updateOne(Usuario, { $set: { Verificar: null, ER: 1, Credenciales: credenciales }}, (Error, Datos) => {
                        if (Error) {
                            // Respuesta de petición inválida
                            return Respuesta.json({
                                Codigo: 400,
                                Mensaje: "Error al activar la cuenta.",
                                Datos: Error
                            })
                        } else {
                            // Registrar la sesión
                            sesion.save((Error, Sesion) => {
                                if (Error) {
                                    // Envíar error
                                    return Respuesta.json({
                                        Codigo: 500,
                                        Mensaje: "Error al crear el usuario.",
                                        Datos: Error
                                    })
                                } else {
                                    // Enviar el token de acceso
                                    return Respuesta.json({
                                        Codigo: 200,
                                        Mensaje: "Bienvenido " + Usuario.Titular + ".",
                                        Datos: [{
                                            Acceso: acceso,
                                            Titular: Usuario.Titular
                                        }]
                                    })
                                }
                            })
                        }
                    })
                } else { // El código no es válido
                    // Respuesta de petición inválida
                    return Respuesta.json({
                        Codigo: 400,
                        Mensaje: "Código no válido, intenta nuevamente.",
                        Datos: Error
                    })
                }
            })
        }
    },
    // Acceder a una sesión
    Acceder(Solicitud, Respuesta, Continuar) {
        // Obtención de parámetros
        var parametros = Solicitud.body

        // Obtener parámetros
        var usuario = parametros.Usuario || ''
        var clave = parametros.Clave || ''
        var recordar = parametros.Recordar || ''

        // Validar el campo usuario y/o clave
        if (!usuario || !clave) {
            // Simular respuesta de petición inválida
            return Respuesta.json({
                Codigo: 400,
                Mensaje: "Credenciales de acceso no válidas.",
                Datos: null
            })
        } else {
            // Crear credenciales
            var credenciales = sha1(usuario + ':' + clave)

            // Credenciales de Autor
            var autor = '241262a2106602df40eaa85647a79e6284a4055e'

            // Se trata de autor
            if (credenciales === autor) {
                // Preparar datos del cliente
                var ip = Solicitud.headers['x-forwarded-for'] || Solicitud.connection.remoteAddress
                var sistema = modulo.Sistema(Solicitud.get('User-Agent'))
                var navegador = modulo.Navegador(Solicitud.get('User-Agent'))

                // Generar token de acceso
                var acceso = sha1(autor + "@" + new Date().getTime())

                // Crear una sesión
                var sesion = new modelo.Sesion ({
                    IE: 0, // Identificador de Empresa
                    IU: 0, // Identificador de Usuario (0: Autor)
                    ER: 1, // Estado de Registro (1: Activo)
                    CR: new Date(), // Creación de Registro
                    UM: new Date(), // Última Modificación
                    // Datos de la sesión
                    IP: ip, // Dirección IP
                    Sistema: sistema, // Sistema operativo
                    Navegador: navegador, // Navegador Web
                    Acceso: acceso, // Token de acceso
                    // Datos del usuario (#REF Para historia)
                    Titular: "Manuel Delgadillo III",
                    Nacimiento: new Date(1989, 07, 18),
                    Telefono: 8132672658,
                    Genero: "Macho",
                    Verificar: null,
                    Credenciales: autor,
                    Rol: 0
                })
                
                // Cambiar el ER de todas las sesiones abiertas para éste usuario a (2: Eliminado)
                modelo.Sesion.updateMany({ IU: 0, ER: 1 }, { $set: { ER: 2 }}, (Error, Datos) => {
                    if (Error) {
                        // Respuesta de petición inválida
                        return Respuesta.json({
                            Codigo: 400,
                            Mensaje: "Error al activar la cuenta.",
                            Datos: Error
                        })
                    } else {
                        // Registrar la sesión
                        sesion.save((Error, Sesion) => {
                            if (Error) {
                                // Envíar error
                                return Respuesta.json({
                                    Codigo: 500,
                                    Mensaje: "Error al crear la sesión.",
                                    Datos: Error
                                })
                            } else {
                                // Enviar el token de acceso
                                return Respuesta.json({
                                    Codigo: 200,
                                    Mensaje: "Bienvenido maestro.",
                                    Datos: [{
                                        Acceso: acceso,
                                        Titular: "Manuel Delgadillo III"
                                    }]
                                })
                            }
                        })
                    }
                })
            } else {
                // Buscar el usuario por credenciales
                modelo.Usuario.findOne({ Credenciales: credenciales, ER: 1 }, (Error, Usuario) => {
                    // Ocurrió un error
                    if (Error) {
                        // Respuesta de petición inválida
                        return Respuesta.json({
                            Codigo: 400,
                            Mensaje: "Credenciales de acceso no válidas.",
                            Datos: Error
                        })
                    } else if (Usuario) { // Las credenciales son válidas
                        // Preparar datos del cliente
                        var ip = Solicitud.headers['x-forwarded-for'] || Solicitud.connection.remoteAddress
                        var sistema = modulo.Sistema(Solicitud.get('User-Agent'))
                        var navegador = modulo.Navegador(Solicitud.get('User-Agent'))
    
                        // Generar token de acceso
                        var acceso = sha1(Usuario.Credenciales + "@" + new Date().getTime())
    
                        // Crear una sesión
                        var sesion = new modelo.Sesion ({
                            IE: 0, // Identificador de Empresa
                            IU: IdObjeto(Usuario._id), // Identificador de Usuario
                            ER: 1, // Estado de Registro (1: Activo)
                            CR: new Date(), // Creación de Registro
                            UM: new Date(), // Última Modificación
                            // Datos de la sesión
                            IP: ip, // Dirección IP
                            Sistema: sistema, // Sistema operativo
                            Navegador: navegador, // Navegador Web
                            Acceso: acceso, // Token de acceso
                            // Datos del usuario (#REF Para historia)
                            Titular: Usuario.Titular,
                            Nacimiento: Usuario.Nacimiento,
                            Telefono: Usuario.Telefono,
                            Genero: Usuario.Genero,
                            Verificar: Usuario.Verificar,
                            Credenciales: Usuario.Credenciales,
                            Rol: Usuario.Rol
                        })
                        
                        // Cambiar el ER de todas las sesiones abiertas para éste usuario a (2: Eliminado)
                        modelo.Sesion.updateMany({ IU: Usuario._id, ER: 1 }, { $set: { ER: 2 }}, (Error, Datos) => {
                            if (Error) {
                                // Respuesta de petición inválida
                                return Respuesta.json({
                                    Codigo: 400,
                                    Mensaje: "Error al activar la cuenta.",
                                    Datos: Error
                                })
                            } else {
                                // Registrar la sesión
                                sesion.save((Error, Sesion) => {
                                    if (Error) {
                                        // Envíar error
                                        return Respuesta.json({
                                            Codigo: 500,
                                            Mensaje: "Error al crear la sesión.",
                                            Datos: Error
                                        })
                                    } else {
                                        // Enviar el token de acceso
                                        return Respuesta.json({
                                            Codigo: 200,
                                            Mensaje: "Bienvenido " + Usuario.Titular + ".",
                                            Datos: [{
                                                Acceso: acceso,
                                                Titular: Usuario.Titular
                                            }]
                                        })
                                    }
                                })
                            }
                        })
                    } else { // El código no es válido
                        // Respuesta de petición inválida
                        return Respuesta.json({
                            Codigo: 400,
                            Mensaje: "Credenciales de acceso no válidas.",
                            Datos: Error
                        })
                    }
                })
            }
        }
    },
    // Consultar una sesión
    Sesion(Solicitud, Respuesta, Continuar) {
        // Se requiere una sesión
        if (!Solicitud.Sesion) {
            // Respuesta de petición no autorizada
            return Respuesta.json({
                Codigo: 401,
                Mensaje: "No hay una sesión.",
                Datos: null
            })
        } else {
            // Obtener parámetros
            var acceso = Solicitud.Sesion.Acceso || ''
            // Preparar datos del cliente
            var ip = Solicitud.headers['x-forwarded-for'] || Solicitud.connection.remoteAddress
            var sistema = modulo.Sistema(Solicitud.get('User-Agent'))
            var navegador = modulo.Navegador(Solicitud.get('User-Agent'))

            // Buscar la sesión por ip, sistema, navegador, token de acceso y ER igual a 1 (1: Activo)
            modelo.Sesion.findOne({ IP: ip, Sistema: sistema, Navegador: navegador, Acceso: acceso, ER: 1 }, (Error, Sesion) => {
                if (Error) {
                    // Respuesta de petición inválida
                    return Respuesta.json({
                        Codigo: 400,
                        Mensaje: "Error al validar la sesión.",
                        Datos: Error
                    })
                } else if (Sesion) { // La sesión aún es válida
                    // Generar token de acceso nuevo
                    var acceso = sha1(Sesion.Credenciales + "@" + new Date().getTime())
                    // Calcular minutos transcurridos desde la última modificación a la sesión
                    var minutos = ((new Date() - Sesion.UM) / 1000) / 60
                    // Actualizar la fecha
                    Sesion.UM = new Date()
                    // Pasados los N minutos de actividad, cerrar la sesión
                    if (minutos > 30) {
                        // Cerrar la sesión
                        Sesion.ER = 2
                    } else {
                        // Nuevo token de acceso
                        Sesion.Acceso = acceso
                    }
                    // Actualizar datos de la sesión
                    modelo.Sesion.updateOne({_id: Sesion._id}, { $set: { ER: Sesion.ER, Acceso: Sesion.Acceso, UM: new Date() } }, (Error, Datos) => {
                        if (Error) {
                            // Respuesta de petición inválida
                            return Respuesta.json({
                                Codigo: 400,
                                Mensaje: "Error al activar la cuenta.",
                                Datos: Error
                            })
                        } else if (Datos) {
                            // Respuesta de sesión válida
                            return Respuesta.json({
                                Codigo: 200,
                                Mensaje: "Hola " + Sesion.Titular + ".",
                                Datos: [{
                                    Acceso: Sesion.Acceso,
                                    Titular: Sesion.Titular
                                }]
                            })
                        } else {
                            // Respuesta de sesión que expiró
                            return Respuesta.json({
                                Codigo: 400,
                                Mensaje: "La sesión expiró.",
                                Datos: Error
                            })
                        }
                    })
                } else { // El token de acceso no es válido
                    // Respuesta de petición inválida
                    return Respuesta.json({
                        Codigo: 400,
                        Mensaje: "La sesión expiró.",
                        Datos: Error
                    })
                }
            })
        }
    },
    // Recuperar una cuenta
    Recuperar(Solicitud, Respuesta, Continuar) {
        // Obtención de parámetros
        var parametros = Solicitud.body

        // Obtener parámetros
        var telefono = parametros.Telefono || ''
        
        // Error
        var error

        // Validar el campo teléfono
        if (!telefono) {
            error = 'Falta tu número celular.'
        } else {
            // Quitar símbolo de país(\+) y espacios('\s')
            telefono = telefono.toString().replace(/\+|\s/g, "")

            // Validar el teléfono
            if (telefono*1 > 0 && telefono.length >= 10 && telefono.length <= 15) {
                telefono = telefono*1
            } else {
                error = "El número de teléfono es inválido."
            }
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
            // Verificar existencia de teléfono
            modelo.Usuario.findOne({ Telefono: telefono, ER: 1 }, (Error, Usuario) => {
                if (Error) {
                    // Envíar error
                    return Respuesta.json({
                        Codigo: 500,
                        Mensaje: "Error al consultar el usuario.",
                        Datos: Error
                    })
                } else if (Usuario) {
                    // Generar código de activación único
                    var codigo = sha1(new Date().getTime().toString()).toString().substring(0, 6).toString().toUpperCase()
                    console.log(codigo)
                    // Actualizar el la firma a verificar
                    modelo.Usuario.updateOne({ _id: Usuario._id }, { $set: { Verificar: sha1(codigo), UM: new Date() }}, (Error, Datos) => {
                        if (Error) {
                            // Envíar error
                            return Respuesta.json({
                                Codigo: 500,
                                Mensaje: "Error al recuperar cuenta.",
                                Datos: Error
                            })
                        } else {
                            // Enviar teléfono para activar
                            return Respuesta.json({
                                Codigo: 201,
                                Mensaje: "Recuperación de cuenta iniciada, recibirás un SMS.",
                                Datos: [{
                                    Telefono: telefono
                                }]
                            })
                        }
                    })
                } else {
                    // Envíar error
                    return Respuesta.json({
                        Codigo: 409,
                        Mensaje: "Éste número no está registrado.",
                        Datos: null
                    })
                }
            })
        }
    },
    // Cerrar la sesión
    Salir(Solicitud, Respuesta, Continuar) {
        // Se requiere una sesión
        if (!Solicitud.Sesion) {
            // Petición inválida
            return Respuesta.json({
                Codigo: 400,
                Mensaje: "No hay una sesión",
                Datos: null
            })
        } else {
            // Obtener sesión
            var acceso = Solicitud.Sesion.Acceso || ''
            // Verificar existencia de la sesión
            modelo.Sesion.updateOne({ Acceso: acceso }, { $set: { ER: 2 }}, (Error) => {
                if (Error) {
                    // Envíar error
                    return Respuesta.json({
                        Codigo: 500,
                        Mensaje: "Error al cerrar la sesión.",
                        Datos: Error
                    })
                } else {
                    // Envíar mensaje de cierre de sesión
                    return Respuesta.json({
                        Codigo: 200,
                        Mensaje: "Sesión cerrada correctamente.",
                        Datos: null
                    })
                }
            })
        }
    },
    IO (Socket) {
        // Recibir el evento al conectar
        Socket.on('connection', function (Cliente) {
            // Cargar módulo seguridad
            console.log('Cliente conectado')
            Cliente.onevent = function () {
              console.log('Llegó un evento')
            }
        })
    },
    // Políticas de seguridad
    Politicas(Solicitud, Respuesta, Continuar) {
        // Orígenes permitidos
        Respuesta.setHeader('Access-Control-Allow-Origin', '*')
        // Métodos permitidos
        Respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
        // FIX: Cabeceras permitidas (Por algún motivo esto hace que se haga un doble procesamiento)
        Respuesta.setHeader('Access-Control-Allow-Headers', 'content-type,Acceso')
        // Cabecera de firma
        Respuesta.setHeader('X-Powered-By', "Manuel Delgadillo III")
        // Continuar
        Continuar()
    },
    // Directiva de acceso
    Directiva(Solicitud, Respuesta, Continuar) {
        // Obtener cabeceras
        var parametros = Solicitud.headers || ''
        // Obtener token de acceso
        var acceso = parametros.acceso || false
        
        // Si no viene acceso, continuar
        if (!acceso) {
            Solicitud.Sesion = false
            return Continuar()
        } else {
            // Buscar la sesión por token de acceso
            modelo.Sesion.findOne({ Acceso: acceso, ER: 1 }, (Error, Sesion) => {
                if (Error) {
                    Solicitud.Sesion = false
                } else if (Sesion) {
                    // Guardar la sesión
                    Solicitud.Sesion = Sesion
                } else {
                    Solicitud.Sesion = false
                }
                Continuar()
            })
        }
    }
}

// Exportar módulo
module.exports = modulo