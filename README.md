# UwUDB
Una DB facil de usar para todos, facil de usar y no se corrompe!

UwUDB cuenta con errores dinamicos para saber donde fue donde te equivocaste, esquemas para tener un estricto uso de lo que le puedes meter a la db y todo esta en español!

<a name="CAM"></a>

## CAMBIOS
```
    .- Se agregaron typings al modulo y capacidad de autocompletado al insertar y buscar documentos
    .- Se termino todo el README con cada propiedad definida
    .- Se remueven ciertos exports del modulo
    .- Se agregan otros errores al cliente
```

Puedes ver los cambios de todas las versiones en el [CHANGELOG](./CHANGELOG.md)

# Contenido
- [Cambios](#CAM)
- [ToDo](#TOD)
- [Instalacion](#INS)
- [Uso](#USO)
- [Constructores](#CON)
  - [Esquema](#ESQ)
  - [uwuCliente](#UCL)
  - [DB](#UDB)
  - [Documento](#DOC)
- [Metodos](#FUN)
  - [validarID](#VAL)

<a name="TOD"></a>

# ToDo

```
    .- Agregar la capacidad de usar arrays en la DB
    .- Terminar todos los metodos en Documento y DB
```

<a name="INS"></a>

# Instalacion

```
npm i uwudb --s
```

<a name="INS"></a>

# Uso
```js
//CommonJS
const uwudb = require('uwudb')

//TypeScript/ES6 Modulos
import uwudb from 'uwudb'
```

<a name="CON"></a>
<a name="ESQ"></a>

# class *Esquema*

- [new Database()](#new-esquemaobj)
- [Propiedades](#ESQ-PRO)

### new Esquema({*obj*})

Esta clase recibe un objeto al crearse, el objeto sera el esquema que tendra la db, 
las propiedades que pongas aqui seran las que estaran en la db

Vease los tipos, *[aqui](#ESQ-TYP)*

- `obj.<Propiedad>.type`: Incluye el tipo de la propiedad, tambien puedes usar \<Propiedad\>: *[Tipo](#ESQ-TYP)*

- `obj.<Propiedad>.required`: Una variable booleana, si se pasa como true se necesitara incluir esa propiedad al insertar algo a la db (default: `false`)

- `obj.<Propiedad>.default`: El valor que tendra por default la propiedad, si al insertar un dato a la db y tiene esta propiedad se sobreescribira por el valor ingresado no el default

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

<a name="ESQ-PRO"></a>

## Propiedades

**.rawModel -> _object_** - El objeto ingresado

**.properties -> _string[]_** - Un array con todas las propiedades del objeto

**.values -> _string[]_** - Un array con los valores para SQL de cada propiedad

**.types -> _string[]_** - Un objeto de una propiedad, su tipo, si es requerido y si tiene, el valor default

**.sentence -> _string_** - Una string con la sentencia para crear la tabla



<a name="UCL"></a>

# class *uwuCliente*

- [new uwuCliente](#new-uwuclienteopcionescliente)
- [uwuCliente#crearDB](#UCL-CDB) (ver [`DB`](#UDB) y [`Esquema`](#ESQ))
- [Propiedades](#UCL-PRO)

### new uwuCliente({*OpcionesCliente*})

Esta clase es la base de todo el modulo, en ella puedes crear databases y ver cuales has creado.

Las opciones son variadas:

- `OpcionesCliente.dir`: El directorio donde se creara la DB (requerido: `Si`)

- `OpcionesCliente.nombre`: El nombre de el archivo de la DB (requerido: `Si`)

- `OpcionesCliente.WAL`: Inicia la db de sqlite en [`WAL mode`](https://sqlite.org/wal.html) (default: `false`)

- `OpcionesCliente.verbose`: Pasa una funcion que sera ejecutada con cada accion en sqlite

```js
const uwudb = require('uwudb')
const client = new uwudb.uwuCliente({dir: './database', nombre: 'data', WAL: false, verbose: console.log})
```

<a name="UCL-CDB"></a>

### .crearDB(*nombre*, *esquema*) -> [*DB*](#UDB)

Crea una nueva db con el esquema y nombre recibidos, devuelve una nueva clase [DB](#UDB)

```js
const personas = client.crearDB('personas', personasEsquema)
```

<a name="UCL-PRO"></a>

### Propiedades

**.OpcionesCliente -> OpcionesCliente** - Las opciones ingresadas al instanciar la clase

**.Databases -> [DB](#UDB)[]** - Todas las DBs creadas

**.db -> [Database](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#class-database)** - La base _cruda_ de better-sqlite3



<a name="UDB"></a>

# class *DB*

- [new DB()](#new-dbnombre-esquema-client)
- [DB#establecer()](#UDB-SET)
- [DB#buscarUno()](#UDB-UNO) (ver [Documento](#DOC))
- [DB#buscar()](#UDB-BUS) (ver [Documento](#DOC))
- [DB#eliminarPorId()](#UDB-EPI)
- [Propiedades](#UDB-PRO)

### new DB(*nombre*, *esquema*, *client*)

Crea una DB nueva, recomiendo **mucho** no usar esta clase, usen **[uwuCliente#crearDB](#UCL-CDB)**

**Atencion:** Cada documento viene con una _id asignada por uwudb, no la modifiquen recomendablemente, pueden ocurrir algunos errores al hacerlo

- `nombre`: El nombre de la db (requerido: `Si`)

- `esquema`: El esquema perteneciente a la db (requerido: `Si`)

- `client`: Una clase instanciada de **[uwuClient](#UCL)**

<a name="UDB-SET"></a>

### .establecer({*obj*}) -> *[BetterSqlite3.RunResult](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#runbindparameters---object)*

Establece un objeto en la database, *obj* debe incluir las propiedades de el esquema *(no todas)*, si pusiste en el esquema una propiedad como requerida y no la pones saltara un error, si pusiste un valor por default y pones su valor en el objeto se sobreescribira el valor default a ese que pusiste en *obj*

```js
try {
const resultadp = personas.establecer({nombre: 'Pedro', edad: 16})
} catch (e) {
    console.log(e)
}
```

<a name="UDB-UNO"></a>

### .buscarUno({*obj*}) -> *[Documento](#DOC)*

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

<a name="UDB-BUS"></a>

### .buscar({*obj*?}, *limite?*) -> *[Documento](#DOC)[]*

Busca varios documentos que se encuentren con la query si no se pone la query se mostraran todos los documentos en esa tabla _(puede causar problemas a grandes escalas)_, el limite es opcional, si no se pone se mostraran todos los docs con esa query

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

<a name="UDB-EPI"></a>

### .eliminarPorId(*_id*) -> *[BetterSqlite3.RunResult](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#runbindparameters---object)*

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

<a name="UDB-PRO"></a>

## Propiedades

**.Esquema -> _[new Esquema](#ESQ)_** - El esquema de la db

**.nombre -> _string_** - El nombre de la db

<a name="DOC"></a>

# class *Documento*

- [new Documento()](#new-databasepath-options)
- [Documento#eliminar()](#DOC-DEL)

### new Documento(*data*, *db*)

Crea un nuevo documento para responder con el en una busqueda, recomiendo **no** instanciar esta clase para otras cosas, esta clase es solo para cosas internas al devolver una query

<a name="DOC-DEL"></a>

### .eliminar() -> *[BetterSqlite3.RunResult](https://github.com/JoshuaWise/better-sqlite3/blob/master/docs/api.md#runbindparameters---object)*

Elimina el documento actual, misma documentacion que *[Database#eliminarPorId](#UDB-EPI)*

```js
const resultado = personas.buscarUno({nombre: 'Juana'})

console.log(resultado.eliminar())
```

<a name="FUN"></a>
<a name="VAL"></a>

# function validarID

### validarID(*_id*) -> *boolean*

Valida cualquier _id

```js
console.log(uwudb.Utils.validarID('f2j3Kmag0F27JH1d100c6')) // true

console.log(uwudb.Utils.validarID('uwu')) // false

console.log(uwudb.Utils.validarID('8sjñXag0F27zY1d1u0c6')) // false
```

<a name="ESQ-TYP"></a>

## Tipos de Variables en Esquemas

Los tipos validos en el esquema son: *`string`*, *`number`*, *`boolean`*