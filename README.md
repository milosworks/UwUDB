# UwUDB
Una DB fácil de usar para todos que no se corrompe!

UwUDB cuenta con errores dinámicos para saber donde fue donde te equivocaste, esquemas para tener un estricto uso de lo que le puedes meter a la db y todo esta en español!

## CAMBIOS
```
    .- Se mejoro el README
    .- Se agrego eliminarDB en uwuCliente
```

Puedes ver los cambios de todas las versiones en el [CHANGELOG](./CHANGELOG.md)

# Contenido
- [Cambios](#cambios)
- [ToDo](#todo)
- [Instalación](#instalación)
- [Uso y Soporte](#uso)
- [Soporte](#soporte)
- [Constructores](#class-esquema)
  - [uwuCliente](#class-uwucliente)
  - [Esquema](#class-esquema)
  - [DB](#class-db)
  - [Documento](#class-documento)
- [Métodos](#function-validarID)
  - [validarID](#function-validarID)
  - [formatArray](#function-formatArray)
- [Typings](./docs/TYPES.md)

# ToDo

```
    .- Terminar todos los métodos en Documento y DB
```

# Instalación

```
npm i uwudb --s
```

# Uso
```js
//CommonJS
const uwudb = require('uwudb')

//TypeScript/ES6 Módulos
import { uwuCliente, Esquema } from 'uwudb'
```

## Como puedo usar arrays?
SQL no soporta arrays por default por lo tanto uwudb tampoco

```js
const { Utils} = require('uwudb')
//Aquí tendríamos nuestro array
const miarray = ['Jajaja', 'Hola']
//Creamos nuestro esquema y ponemos array como string
const miesquema = new Esquema({
    array: 'string',
    nombre: 'string'
})
//Creamos nuestra db
const db = cliente.crearDB('arrays', miesquema)
//Establecemos el array como string
db.establecer({array: miarray.toString(), nombre: 'ArraysEnUwUDB'})
//Para obtenerlo usaríamos
const resultado = db.buscarUno({nombre: 'ArraysEnUwUDB'})

console.log(Utils.formatArray(resultado.array))
// ["Jajaja", "Hola"]
console.log(resultado.array)
// "['Jajaja", "Hola']"
```

# class *uwuCliente*

- [new uwuCliente()](#new-uwuclienteopcionescliente)
- [uwuCliente#crearDB](#creardbnombre-esquema---db) (ver [`DB`](#class-db) y [`Esquema`](#ESQ))
- [uwuCliente#eliminarDB](#eliminardbnombre---boolean)
- [Propiedades](#propiedades-1)

### new uwuCliente({*OpcionesCliente*})

Esta clase es la base de todo el modulo, en ella puedes crear databases y ver cuales has creado.

Las opciones son variadas:

- `OpcionesCliente.dir`: El directorio donde se creara la DB (requerido: `Si`)

- `OpcionesCliente.nombre`: El nombre de el archivo de la DB (requerido: `Si`)

- `OpcionesCliente.WAL`: Inicia la db de sqlite en [`WAL mode`](https://sqlite.org/wal.html) (default: `false`)

- `OpcionesCliente.verbose`: Pasa una función que sera ejecutada con cada acción en sqlite

```js
const uwudb = require('uwudb')
const client = new uwudb.uwuCliente({dir: './database', nombre: 'data', WAL: false, verbose: console.log})
```

### .crearDB(*nombre*, *esquema*) -> *DB*

Crea una nueva db con el esquema y nombre recibidos, devuelve una nueva clase [DB](#class-db)

```js
const personas = client.crearDB('personas', personasEsquema)
```

### .eliminarDB(*nombre*) -> *boolean*

Elimina una db (Tabla) de uwudb, ten en cuenta que se eliminaran todos los datos de esa DB

```js
client.eliminarDB('personas')
```

## Propiedades

**.OpcionesCliente -> OpcionesCliente** - Las opciones ingresadas al instanciar la clase

**.Databases -> Map<string, [DB](#class-db)[]>** - Todas las DBs creadas, puedes buscar una por su nombre

**.db -> [Database](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#class-database)** - La base _cruda_ de better-sqlite3


# class *Esquema*

- [new Esquema()](#new-esquemaobj)
- [Propiedades](#propiedades)

### new Esquema({*obj*})

Esta clase recibe un objeto al crearse, el objeto sera el esquema que tendrá la db, 
las propiedades que pongas aquí serán las que estarán en la db

Véase los tipos, *[aquí](#tipos-de-variables-en-esquemas)*

- `obj.<Propiedad>.type`: Incluye el tipo de la propiedad, también puedes usar *\<Propiedad\>*: *[Tipo](#tipos-de-variables-en-esquemas)*

- `obj.<Propiedad>.required`: Una variable booleana, si se pasa como true se necesitara incluir esa propiedad al insertar algo a la db (default: `false`)

- `obj.<Propiedad>.default`: El valor que tendrá por default la propiedad, si al insertar un dato a la db y tiene esta propiedad se sobrescribirá por el valor ingresado no el default

```js
const personasEsquema = new Esquema({
    nombre: 'string',
    segundoNombre: {
        type: 'string',
        default: 'Doe'
    },
    edad: {
        type: 'number',
        required: true
    }
})
```

## Propiedades

**.rawModel -> _object_** - El objeto ingresado

**.properties -> _string[]_** - Un array con todas las propiedades del objeto

**.values -> _string[]_** - Un array con los valores para SQL de cada propiedad

**.types -> _string[]_** - Un objeto de una propiedad, su tipo, si es requerido y si tiene, el valor default

**.sentence -> _string_** - Una string con la sentencia para crear la tabla


# class *DB*

- [new DB()](#new-dbnombre-esquema-client)
- [DB#establecer()](#establecerobj---resultadooperacion) (ver [ResultadoOperación](./docs/TYPES.md))
- [DB#buscarUno()](#buscarunoBúsqueda---documento) (ver [Documento](#DOC))
- [DB#buscar()](#buscarBúsqueda-limite---documento) (ver [Documento](#DOC))
- [DB#actualizarUno()](#actualizarunoBúsqueda-nuevosdatos---documento) (ver [Documento](#DOC))
- [DB#eliminarUno()](#eliminarunoBúsqueda---resultadooperacion) (ver [ResultadoOperacion](./docs/TYPES.md))
- [DB#eliminarVarios()](#eliminarvariosBúsqueda---resultadooperacion) (ver [ResultadoOperacion](./docs/TYPES.md))
- [DB#eliminarPorId()](#eliminarporid_id---resultadooperacion) (ver [ResultadoOperacion](./docs/TYPES.md))
- [Propiedades](#propiedades-2)

### new DB(*nombre*, *esquema*, *client*)

Crea una DB nueva, recomiendo **mucho** no usar esta clase, usen **[uwuCliente#crearDB](#UCL-CDB)**

**Atención:** Cada documento viene con una _id asignada por uwudb, no la modifiquen recomendablemente, pueden ocurrir algunos errores al hacerlo

- `nombre`: El nombre de la db (requerido: `Si`)

- `esquema`: El esquema perteneciente a la db (requerido: `Si`)

- `client`: Una clase instanciada de **[uwuClient](#UCL)**


### .establecer({*obj*}) -> *ResultadoOperacion*

Establece un objeto en la database, *obj* debe incluir las propiedades de el esquema *(no todas)*, si pusiste en el esquema una propiedad como requerida y no la pones saltara un error, si pusiste un valor por default y pones su valor en el objeto se sobrescribirá el valor default a ese que pusiste en *obj*

```js
try {
const resultado = personas.establecer({nombre: 'Pedro', edad: 16})
} catch (e) {
    console.log(e)
}
```

### .buscarUno({*Búsqueda*}) -> *Documento*

Busca un documento en la db con las propiedades que se hayan ingresado en *obj*

```js
const resultado = personas.buscarUno({nombre: 'Pedro'})

console.log(resultado)

/*
Documento {
    _id: AGm83242ea891je07ed9M,
    nombre: 'Pedro',
    segundonombre: 'Doe',
    edad: 16
}
*/
```

### .buscar({*Búsqueda*?}, *limite?*) -> *Documento[]*

Busca varios documentos que se encuentren con la Búsqueda si no se pone la Búsqueda se mostraran todos los documentos en esa tabla, el limite es opcional, si no se pone se mostraran todos los docs con esa Búsqueda

```js
personas.establecer({nombre: 'Juana', edad: 18})

const resultado = personas.buscar({segundonombre: 'Doe'})

console.log(resultado)

/*
[
    Documento {
        _id: AGm83242ea891je07ed9M,
        nombre: 'Pedro',
        segundonombre: 'Doe',
        edad: 16
    },
    Documento {
        _id: f2j3Kmag0F27JH1d100c6,
        nombre: 'Juana',
        segundonombre: 'Doe',
        edad: 18
    }
]
*/
```

### .actualizarUno({*Búsqueda*}, {*nuevosDatos*}) -> *Documento*

Actualiza un documento, primero buscándolo y poniendo los nuevos datos a actualizar

```js
personas.establecer({nombre: 'Juana', edad: 18})

const cambios = personas.actualizarUno({nombre: 'Juana'}, {edad: 19})

console.log(cambios)

/*
Documento {
    nombre: 'Juana',
    edad: 19
}
*/
```

### .eliminarUno({*Búsqueda*}) -> *ResultadoOperacion*

Elimina un documento que cumpla con la Búsqueda

```js
personas.establecer({nombre: 'Juana', edad: 18})

const eliminar = personas.eliminarVarios({edad: 18})

console.log(eliminar)

/*
{ ok: true, documentos: 1 }
*/
```

### .eliminarVarios({*Búsqueda*}) -> *ResultadoOperacion*

Elimina varios documentos que cumplan con la Búsqueda

```js
personas.establecer({nombre: 'Juana', edad: 18})
personas.establecer({nombre: 'Juan', edad: 18})

const eliminar = personas.eliminarVarios({edad: 18})

console.log(eliminar)

/*
{ ok: true, documentos: 2 }
*/
```

### .eliminarPorId(*_id*) -> *ResultadoOperacion*

Elimina documentos por la _id asignada por uwudb

```js
personas.eliminarPorId('AGm83242ea891je07ed9M')

const resultado = personas.buscar()

console.log(resultado)

/*
[
    Documento {
        _id: f2j3Kmag0F27JH1d100c6,
        nombre: 'Juana',
        segundonombre: 'Doe',
        edad: 18
    }
]
*/
```

## Propiedades

**.Esquema -> _[new Esquema](#ESQ)_** - El esquema de la db

**.nombre -> _string_** - El nombre de la db

# class *Documento*

- [new Documento()](#new-documentodata-db)
- [Documento#eliminar()](#eliminar---resultadooperacion) (ver [ResultadoOperacion](./docs/TYPES.md))
- [Documento#guardar()](#guardar---documento)

### new Documento(*data*, *db*)

Crea un nuevo documento para responder con el en una Búsqueda, recomiendo **no** instanciar esta clase para otras cosas, esta clase es solo para cosas internas al devolver una Búsqueda

### .eliminar() -> *ResultadoOperacion*

Elimina el documento actual, misma documentacion que *[Database#eliminarPorId](#class-db-EPI)*

```js
const resultado = personas.buscarUno({nombre: 'Juana'})

console.log(resultado.eliminar())
```

### .guardar() -> *Documento*

Guarda los cambios de el documento actual

```js
const resultado = personas.buscarUno({nombre: 'Juana'})

resultado.nombre = 'Juan'

console.log(resultado.guardar())
```

# function validarID

### validarID(*_id*) -> *boolean*

Valida cualquier _id

```js
console.log(uwudb.Utils.validarID('f2j3Kmag0F27JH1d100c6')) // true

console.log(uwudb.Utils.validarID('uwu')) // false

console.log(uwudb.Utils.validarID('8sjñXag0F27zY1d1u0c6')) // false
```

# function formatArray

### formatArray(*array*) -> *any[]*
Formatea un array dentro de un string a un array real

```js
const miarray = "['MiElemento']"
const miarrayreal = formatArray(miarray)

console.log(miarrayreal) // ["MiElemento"]
```

## Tipos de Variables en Esquemas

Los tipos validos en el esquema son: *`string`*, *`number`*, *`boolean`*

## Soporte

Si quieren que se agrege una nueva funcionalidad o reportar un error mandadme un MD en discord: Vyrek#7545