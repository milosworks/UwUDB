const OmegaDBError = require('../Util/Errors')
const Utils = require('../Util/Utils')

const VALID_TYPES = ['number', 'string', 'boolean']

class Esquema {
    constructor(obj) {
        if (!obj) throw new OmegaDBError('Debes poner el esquema de la db')

        this.rawModel = obj;

        this.properties = ['_id']
        this.values = this._scrapProps(obj)

        this.sentence = `CREATE TABLE IF NOT EXISTS ? (_id TEXT, ${this.values.join(', ')})`;
    }

    /**
     * @private
     */
    _scrapProps(obj, tree = '') {
        if (typeof obj !== 'object') throw new OmegaDBError('Debes ingresar un objeto valido')
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
        if (!value) throw new OmegaDBError('Debes ingresar el tipo de la propiedad')
        const keys = Object.keys(value)

        if (VALID_TYPES.includes(value)) {
            return `'${name}' ${Utils.parseTypes(value)}`
        } else if (keys.length && (keys.includes('type') && keys.includes('required') && keys.includes('default'))) {
            let string = `'${name}' ${Utils.parseTypes(value.type)}`
            if (keys.includes('required')) string += ' NOT NULL'
            if (keys.includes('default')) string += ` DEFAULT ${value.default}`
            return string
        } else {
            return undefined
        }
    }
}

module.exports = Esquema