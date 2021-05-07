// eslint-disable-next-line
const BetterSqlite3 = require('better-sqlite3')
const uwuDBError = require('../Util/Errors')
const Esquema = require('./Esquema')
const Documento = require('./Documento')
const { validarID } = require('../Util/PublicUtils')
const Utils = require('../Util/Utils')

class uwuDB {
    constructor(nombre, esquema, client) {
        if (!nombre) throw new uwuDBError('Debes de poner el nombre de la DB')
        if (typeof nombre !== 'string') throw new uwuDBError(`El nombre de la DB debe ser una string, se recivio: ${typeof nombre}`)
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

    establecer(obj) {
        if (!obj) throw new uwuDBError('Debes de poner los datos que quieres añadir a la db')
        if (typeof obj !== 'object') throw new uwuDBError(`Debes de poner un objeto valido, se recivio '${typeof obj}'`)

        const objProps = this._objProps(obj)
        const loosing = objProps.properties.filter(item => !(this.Esquema.properties.includes(item)))

        if (loosing.some((item) => !this.Esquema.properties.includes(item))) throw new uwuDBError(`La(s) propiedad(es) '${loosing.join(', ')}' no existen en el esquema`)
        this._checkRequired(this.Esquema.types, objProps.properties)
        this._checkDefaults(this.Esquema.types, objProps.properties, obj)
        this._checkTypes(this.Esquema.types, obj)

        const columnsAndValues = this._buildStatement(obj)
        const _id = Utils.chooseID(this.db, this.nombre)

        const statement = `INSERT INTO ${this.nombre} (_id, ${columnsAndValues.columns.join(', ')}) VALUES (?, ?)`

        return this.db.prepare(statement).run(_id, columnsAndValues.values.join(', '))
    }

    buscarUno(query) {
        if (!query) throw new uwuDBError('Debes de poner una query para buscar')
        if (typeof query !== 'object') throw new uwuDBError(`Debes de poner un objeto valido, se recivio '${typeof query}'`)

        const QueryProps = this._objProps(query)
        const loosing = QueryProps.properties.filter(item => !(this.Esquema.properties.includes(item)))

        if (loosing.some((item) => !this.Esquema.properties.includes(item))) throw new uwuDBError(`La(s) propiedad(es) '${loosing.join(', ')}' no existen en el esquema`)

        const sentence = this.db.prepare(`SELECT * FROM ${this.nombre} WHERE ${QueryProps.values.join(', ')} LIMIT 1`).get()

        if (!sentence) return undefined;

        return new Documento(sentence, this)
    }


    buscar(query, limite) {
        if (!query) throw new uwuDBError('Debes de poner una query para buscar')
        if (limite && typeof limite !== 'number') throw new uwuDBError(`Necesitas poner un limite valido, se recivio '${typeof limite}'`)
        if (typeof query !== 'object') throw new uwuDBError(`Debes de poner un objeto valido, se recivio '${typeof query}'`)

        const QueryProps = this._objProps(query)
        const loosing = QueryProps.properties.filter(item => !(this.Esquema.properties.includes(item)))

        if (loosing.some((item) => !this.Esquema.properties.includes(item))) throw new uwuDBError(`La(s) propiedad(es) '${loosing.join(', ')}' no existen en el esquema`)

        const alldata = this.db.prepare(`SELECT * FROM ${this.nombre} WHERE ${QueryProps.values.join(', ')}${limite ? ` LIMIT ${limite}` : ''}`).get()
        const documents = alldata.map(x => new Documento(x, this))

        return documents;
    }

    eliminarPorId(_id) {
        return new Promise((res, rej) => {
            if (!_id) rej(new uwuDBError('Necesitas poner una ID'))
            if (!validarID(_id)) rej(new uwuDBError('Debes de poner una ID valida'))

            const datos = this.buscarUno({ _id })

            if (!datos) rej(new uwuDBError(`No se encontro ningun documento con la id: ${_id}`))

            res(this.db.prepare(`DELETE FROM ${this.nombre} WHERE _id = '${_id}' LIMIT 1`).run())
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
    _objProps(obj, tree = '') {
        const properties = []
        const values = []

        for (const prop in obj) {
            const path = tree + (tree ? '.' : '') + prop

            if (typeof obj[prop] !== 'object' && obj[prop] !== null && !Array.isArray(obj[prop])) {
                properties.push(path)
                values.push(`${path}='${obj[prop]}'`)
            } else {
                const recursive = this._objProps(obj[prop], path)
                properties.push(...recursive.properties)
                values.push(...recursive.values)
            }
        }

        return {
            properties,
            values
        }
    }

    /**
     * @private
     */
    _checkRequired(types, obj) {
        for (const type in types) {
            if (types[type].required && !obj.includes(type)) throw new uwuDBError(`La propiedad '${type}' es requerida pero no se esta ingresando`)
        }
    }

    /**
     * @private
     */
    _checkDefaults(types, obj, data) {
        for (const type in types) {
            const value = types[type]

            if (value.default && !obj.includes(type)) {
                this._setDefaults(type, value.default, data)
            }
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

    _checkTypes(types, obj) {
        for (const prop in obj) {
            const type = types[prop]
            const value = obj[prop]

            if (typeof value !== type.type) throw new uwuDBError(`El tipo de la propiedad '${prop}' es incorrecto, se recivio '${typeof value}' y deberia ser '${type.type}'`)
        }
    }
}

module.exports = uwuDB