const OmegaDBError = require('../Util/Errors')
const Esquema = require('./Esquema')
const Documento = require('./Documento')
// eslint-disable-next-line
const BetterSqlite3 = require('better-sqlite3')
const { validarID } = require('../Util/PublicUtils')

class OmegaDB {
    constructor(nombre, esquema, client) {
        if (!nombre) throw new OmegaDBError('Debes de poner el nombre de la DB')
        if (typeof nombre !== 'string') throw new OmegaDBError(`El nombre de la DB debe ser una string, se recivio: ${typeof nombre}`)
        if (!esquema) throw new OmegaDBError('Debes de poner un esquema para crear la DB')
        if (!(esquema instanceof Esquema)) throw new OmegaDBError('Debes de poner un esquema valido')

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

    buscarUno(query) {
        if (!query) throw new OmegaDBError('Debes de poner una query para buscar')
        if (typeof query !== 'object') throw new OmegaDBError(`Debes de poner un objeto valido, se recivio '${typeof query}'`)

        const QueryProps = this._queryProps(query)
        const loosing = QueryProps.properties.filter(item => !(this.Esquema.properties.includes(item)))

        if (loosing.some((item) => !this.Esquema.properties.includes(item))) throw new OmegaDBError(`La(s) propiedad(es) '${loosing.join(', ')}' no existen en el esquema`)

        const sentence = this.db.prepare(`SELECT * FROM ${this.nombre} WHERE ${QueryProps.values.join(', ')} LIMIT 1`).get()

        if (!sentence) return undefined;

        return new Documento(sentence)
    }

    eliminarPorId(_id) {
        return new Promise((res, rej) => {
            if (!_id) rej(new OmegaDBError('Necesitas poner una ID'))
            if (!validarID(_id)) rej(new OmegaDBError('Debes de poner una ID valida'))

            const datos = this.buscarUno({ _id })

            if (!datos) rej(new OmegaDBError(`No se encontro ningun documento con la id: ${_id}`))

            this.db.prepare(`DELETE FROM ${this.nombre} WHERE _id = '${_id}' LIMIT 1`).run()
        })
    }

    /**
     * @private
     */
    _queryProps(obj, tree = '') {
        const properties = []
        const values = []

        for (const prop in obj) {
            const path = tree + (tree ? '.' : '') + prop

            if (typeof obj[prop] !== 'object' && obj[prop] !== null && !Array.isArray(obj[prop])) {
                properties.push(path)
                values.push(`${path}='${obj[prop]}'`)
            } else {
                const recursive = this._queryProps(obj[prop], path)
                properties.push(...recursive.properties)
                values.push(...recursive.values)
            }
        }

        return {
            properties,
            values
        }
    }

}

module.exports = OmegaDB