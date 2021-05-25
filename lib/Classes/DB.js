// eslint-disable-next-line
const BetterSqlite3 = require('better-sqlite3')
// eslint-disable-next-line
const uwuCliente = require('./Cliente')
const uwuDBError = require('../Util/Errors')
const Esquema = require('./Esquema')
const Documento = require('./Documento')
const Utils = require('../Util/Utilidades')
const { validarID } = require('../Util/UtilidadesP')

class uwuDB {

    /**
     * Crea una nueva db
     * @param {string} nombre - El nombre de la db
     * @param {string} esquema - El esquema de la db
     * @param {uwuCliente} client - El cliente de uwudb
    */
    constructor(nombre, esquema, client) {
        if (!nombre) throw new uwuDBError('Debes de poner el nombre de la DB')
        if (typeof nombre !== 'string') throw new uwuDBError(`El nombre de la DB debe ser una string, se recibio: ${typeof nombre}`)
        if (!esquema) throw new uwuDBError('Debes de poner un esquema para crear la DB')
        if (!(esquema instanceof Esquema)) throw new uwuDBError('Debes de poner un esquema valido')

        this.Esquema = esquema
        this.nombre = nombre

        /**
         * @private
         * @type {BetterSqlite3.Database}
         */
        this.db = client.db

        const sentence = this.db.prepare(this.Esquema.sentence.replace(/\?/, nombre))

        sentence.run()
    }

    /**
     * Establece un nuevo objeto dentro de la db
     * @param {object} obj - El objeto a insertar en la db
     * @returns {Documento}
     */
    establecer(obj) {
        if (!obj) throw new uwuDBError('Debes de poner los datos que quieres añadir a la db')
        if (typeof obj !== 'object') throw new uwuDBError(`Debes de poner un objeto valido, se recibio '${typeof obj}'`)

        const objProps = Utils.objProps(obj)
        const loosing = objProps.properties.filter(item => !(this.Esquema.properties.includes(item)))

        if (loosing.some((item) => !this.Esquema.properties.includes(item))) throw new uwuDBError(`La(s) propiedad(es) '${loosing.join(', ')}' no existen en el esquema`)
        this._checkAll(this.Esquema.types, objProps.properties, obj)

        const columnsAndValues = this._buildStatement(obj)
        const _id = Utils.chooseID(this.db, this.nombre)

        const statement = `INSERT INTO ${this.nombre} (_id, ${columnsAndValues.columns.join(', ')}) VALUES (?, ${columnsAndValues.values.map(x => `'${x}'`).join(', ')})`
        this.db.prepare(statement).run(_id)

        return this.buscarUno({ _id })
    }

    /**
     * Busca un doc con la busqueda propuesta
     * @param {object} Busqueda - Busca un doc con las propiedades puestas aqui
     * @returns {Documento}
     */
    buscarUno(Busqueda) {
        if (!Busqueda) throw new uwuDBError('Debes de poner una busqueda para buscar')
        if (typeof Busqueda !== 'object') throw new uwuDBError(`Debes de poner un objeto valido, se recibio '${typeof Busqueda}'`)

        const BusquedaProps = Utils.objProps(Busqueda)
        const loosing = BusquedaProps.properties.filter(item => !(this.Esquema.properties.includes(item)))

        if (loosing.some((item) => !this.Esquema.properties.includes(item))) throw new uwuDBError(`La(s) propiedad(es) '${loosing.join(', ')}' no existen en el esquema`)

        const sentence = this.db.prepare(`SELECT * FROM ${this.nombre} WHERE ${BusquedaProps.values.join(', ')} LIMIT 1`).get()

        if (!sentence) return undefined;

        return new Documento(sentence, this)
    }

    /**
     * Busca varios documentos a la vez
     * @param {object|undefined} Busqueda - Los datos que tiene que tener el documento para obtenerlo (como un buscarUno), si no se pone se daran todos los docs de toda la tabla
     * @param {number} limite - El limite de documentos que quieres obtener, si no se pone nada te dara todos los docs con esa busqueda
     * @returns {Documento[]}
     */
    buscar(Busqueda, limite) {
        if (limite && typeof limite !== 'number') throw new uwuDBError(`Necesitas poner un limite valido, se recibio '${typeof limite}'`)
        if (!Busqueda) {
            const alldata = this.db.prepare(`SELECT ALL * FROM ${this.nombre}${limite ? ` LIMIT ${limite}` : ''}`).all()
            const documents = alldata.map(x => new Documento(x, this))

            return documents
        }
        if (typeof Busqueda !== 'object') throw new uwuDBError(`Debes de poner un objeto valido, se recibio '${typeof Busqueda}'`)

        const BusquedaProps = Utils.objProps(Busqueda)
        if (!BusquedaProps.properties.length) throw new uwuDBError('No pusiste ninguna propiedad a buscar')

        const loosing = BusquedaProps.properties.filter(item => !(this.Esquema.properties.includes(item)))

        if (loosing.some((item) => !this.Esquema.properties.includes(item))) throw new uwuDBError(`La(s) propiedad(es) '${loosing.join(', ')}' no existen en el esquema`)

        const alldata = this.db.prepare(`SELECT * FROM ${this.nombre} WHERE ${BusquedaProps.values.join(', ')}${limite ? ` LIMIT ${limite}` : ''}`).all()
        const documents = alldata.length ? alldata.map(x => new Documento(x, this)) : []

        return documents;
    }

    /**
     * Actualiza **un** documento
     * @param {object} Busqueda - El filtro para encontrar el documento a actulizar
     * @param {object} obj - Los nuevos datos de el documento
     * @returns {Documento} - El documento actualizado
     */
    actualizarUno(Busqueda, obj) {
        const Doc = this.buscarUno(Busqueda)
        if (!Doc) throw new uwuDBError('No existe el documento a actualizar')

        const BusquedaProps = Utils.objProps(Busqueda)
        const UpdateProps = Utils.objProps(obj)
        const loosing = UpdateProps.properties.filter(item => !(this.Esquema.properties.includes(item)))
        if (loosing.some((item) => !this.Esquema.properties.includes(item))) throw new uwuDBError(`La(s) propiedad(es) '${loosing.join(', ')}' no existen en el esquema`)
        if (UpdateProps.properties.includes('_id')) {
            const Index = UpdateProps.properties.indexOf('_id')
            if (UpdateProps.values[Index].replace(/_id='/, '').replace(/'/, '') === Doc._id) {
                UpdateProps.properties.splice(Index, 1)
                UpdateProps.values.splice(Index, 1)
            }
        }

        this.db.prepare(`UPDATE ${this.nombre} SET ${UpdateProps.values.join(', ')} WHERE ${BusquedaProps.values.join(', ')} LIMIT 1`).run()

        const _id = UpdateProps.properties.includes('_id') ? UpdateProps.values[UpdateProps.properties.indexOf('_id')].replace(/_id='/, '').replace(/'/, '') : Doc._id
        return this.buscarUno({ _id })
    }

    /**
     * Elimina un documento
     * @param {object} Filtro - El filtro para eliminar los documentos
     * @returns {{ok: boolean, documentos: number}}
     */
    eliminarUno(Filtro) {
        const Doc = this.buscarUno(Filtro)
        if (!Doc) throw new uwuDBError('No existe ese documento a eliminar')

        const FiltroProps = Utils.objProps(Filtro)

        const run = this.db.prepare(`DELETE FROM ${this.nombre} WHERE ${FiltroProps.values.join(', ')} LIMIT 1`).run()

        return { ok: true, cambios: run.changes }
    }

    /**
     * Elimina varios documentos con el mismo filtro
     * @param {object} Filtro - El filtro para eliminar varios documentos, dejalo vacio para eliminar todos los documentos de esta DB
     * @returns {{ok: boolean, documentos: number}}
     */
    eliminarVarios(Filtro) {
        if (!Filtro) {
            const run = this.db.prepare(`TRUNCATE TABLE ${this.nombre}`).run()

            return { ok: true, documentos: run.changes }
        }

        const Docs = this.buscar(Filtro)
        if (!Docs.length) throw new uwuDBError('No hay ningun documento con ese filtro')

        const FiltroProps = Utils.objProps(Filtro)
        const run = this.db.prepare(`DELETE FROM ${this.nombre} WHERE ${FiltroProps.values.join(', ')}`).run()

        return { ok: true, documentos: run.changes }
    }

    /**
     * Elimar un documento por su _id
     * @param {string} _id La ID de un documento
     * @returns {Promise<{ok: boolean, documentos: number}>} - Los documentos cambiados y si salio bien la operacion
     */
    eliminarPorId(_id) {
        return new Promise((res, rej) => {
            if (!_id) rej(new uwuDBError('Necesitas poner una ID'))
            if (!validarID(_id)) rej(new uwuDBError('Debes de poner una ID valida'))

            const datos = this.buscarUno({ _id })

            if (!datos) rej(new uwuDBError(`No se encontro ningun documento con la id: ${_id}`))
            const run = this.db.prepare(`DELETE FROM ${this.nombre} WHERE _id = '${_id}' LIMIT 1`).run()

            res({ ok: true, cambios: run.changes })
        })
    }

    /**
     * @private
     */
    _buildStatement(obj, tree) {
        const columns = []
        const values = []

        for (const prop in obj) {
            const path = tree + (tree ? '.' : '') + prop

            if (typeof obj[prop] !== 'object' && obj[prop] !== null && !Array.isArray(obj[prop])) {
                columns.push(prop)
                values.push(obj[prop])
            } else {
                const recursive = this._buildStatement(obj[prop], path)
                columns.push(...recursive.columns)
                values.push(...recursive.values)
            }
        }

        return {
            columns,
            values
        }
    }

    /**
     * @private
     */
    _checkAll(types, obj, rawObj) {
        for (const type in types) {
            const value = types[type]

            if (value.required && !obj.includes(type)) throw new uwuDBError(`La propiedad '${type}' es requerida pero no se esta ingresando`)
            else if (value.default && !obj.includes(type)) {
                this._setDefaults(type, value.default, rawObj)
            }
        }

        for (const prop in rawObj) {
            const type = types[prop]
            const value = rawObj[prop]

            if (typeof value !== type.type) throw new uwuDBError(`El tipo de la propiedad '${prop}' es incorrecto, se recibio '${typeof value}' y deberia ser '${type.type}'`)
        }
    }

    /**
     * @private
     */
    _setDefaults(name, defaultVal, data) {
        const parseobj = {}

        Utils.parseObj(parseobj, Utils.parseKey(name), defaultVal)

        Object.assign(data, parseobj)
    }
}

module.exports = uwuDB