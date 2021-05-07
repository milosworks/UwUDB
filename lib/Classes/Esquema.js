const uwuDBError = require('../Util/Errors')
const Utils = require('../Util/Utils')

const VALID_TYPES = ['number', 'string', 'boolean']

class Esquema {
    constructor(obj) {
        if (!obj) throw new uwuDBError('Debes poner el esquema de la db')
        if (typeof obj !== 'object') throw new uwuDBError('Debes de poner un objeto valido')

        this.rawModel = obj;

        this.properties = ['_id']
        this.values = this._scrapProps(obj)
        this.types = {}

        for (const value of this.values) {
            const values = value.split(/ /)

            const final = this.types[Utils.replaceAll(values[0], '\'', '')] = {
                type: Utils.reverseParseType(values[1]),
                required: values[2] === 'NOT' ? true : false
            }

            if (final.required === true && values[4] === 'DEFAULT') final.default = Utils.replaceAll(values.slice(5).join(' '), '\'', '')
        }

        this.sentence = `CREATE TABLE IF NOT EXISTS ? (_id TEXT, ${this.values.join(', ')})`;
    }

    /**
     * @private
     */
    _scrapProps(obj, tree = '') {
        const props = []

        for (const prop in obj) {
            const path = tree + (tree ? '.' : '') + prop
            const format = this._formatType(obj[prop], path)

            if (format) {
                props.push(format)
                this.properties.push(path)
            } else {
                props.push(...this._scrapProps(obj[prop], path))
            }
        }

        return props
    }

    /**
     * @private
     */
    _formatType(value, name) {
        if (!value) throw new uwuDBError('Debes ingresar el tipo de la propiedad')
        const keys = Object.keys(value)

        if (VALID_TYPES.includes(value)) {
            return `'${name}' ${Utils.parseTypes(value)}`
        } else if (keys.length && (keys.includes('type') || keys.includes('required') || keys.includes('default'))) {
            let string = `'${name}' ${Utils.parseTypes(value.type)}`
            if (keys.includes('required')) string += ' NOT NULL'
            if (keys.includes('default')) {
                if (typeof value.default !== value.type) throw new uwuDBError(`El tipo del valor default debe ser al mismo tipo de la propiedad, se recivio '${typeof value.default}' y deberia ser '${value.type}'`)
                string += ` DEFAULT '${value.default}'`
            }
            return string
        } else {
            return undefined
        }
    }
}

module.exports = Esquema