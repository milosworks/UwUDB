const uwudb = require('../lib/index')
const cliente = new uwudb.uwuCliente({ dir: './', nombre: 'data' })

const personasEsquemas = new uwudb.Esquema({
    nombre: 'string',
    apellido: {
        default: 'Doe',
        type: 'string'
    },
    edad: {
        required: true,
        type: 'number'
    }
})

const db = cliente.crearDB('personas', personasEsquemas)

db.establecer({ nombre: 'Vyrek', edad: 18 })

const resultado = db.buscarUno({ nombre: 'Vyrek' })

console.log(resultado)

/*
Documento {
    _id: '7KcCjb8EC682j4g64ff50',
    nombre: 'Vyrek',
    apellido: 'Doe',
    edad: 18
}
*/

resultado.eliminar()

console.log(db.buscarUno({ nombre: 'Vyrek' })) // undefined

db.establecer({ nombre: 'Pedro', apellido: 'Perez', edad: 15 })
db.establecer({ nombre: 'Juan', apellido: 'Lopez', edad: 15 })

const resultados = db.buscar({ edad: 15 })

console.log(resultados)

/*
[
    Documento {
        _id: '7ec190M2d309565k4KeCA',
        nombre: 'Pedro',
        apellido: 'Perez',
        edad: 15
    },
    Documento {
        _id: 'hD9F56d0G71JfDd04m510',
        nombre: 'Juan',
        apellido: 'Lopez',
        edad: 15
    }
]
*/

db.buscarUno({ esto_no_existe: 'Hola' }) // Error: esto_no_existe no es una propiedad especificada en el esquema