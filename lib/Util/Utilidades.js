const path = require('path')
const fs = require('fs')
const uwuDBError = require('./Errors.js')
const BetterSqlite3 = require('better-sqlite3')

class Utilidades {
    constructor() {
        throw new Error('Esta clase no debe ser instanciada')
    }

    /**
     * @returns {{properties: string[], values: string[]}}
     */
    static objProps(obj, tree = '') {
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

    static replaceAll(string, a, e) {
        return string.split(a).join(e);
    }

    static chooseID(db, db_name) {
        const statement = `SELECT * FROM ${db_name} WHERE _id=?`
        let ID = this.generateID()
        let run = db.prepare(statement).get(ID)

        while (run) {
            ID = this.generateID()
            run = db.prepare(statement).get(ID)
        }

        return ID
    }

    static parseObj(obj = {}, props, value = null) {
        if (props.length === 0) {
            return value;
        }

        props.reduce((acc, prop, index) => {
            if (acc == undefined) return undefined;
            if (acc[prop] === undefined) {
                acc[prop] = {};
            }

            if (index === props.length - 1) {
                acc[prop] = value;
            }

            return acc[prop];
        }, obj);

        return obj;
    }

    static parseKey(key) {
        if (typeof key !== 'string') {
            throw new uwuDBError('key debe ser una string')
        } else if (key.match(/\.{2,}|^\.|\.$/) || key === '') {
            throw new uwuDBError('key no es valida')
        }

        return key.split(/\.|\[(\d)\]/).filter(k => k)
    }

    static generateID() {
        const opciones = 'abcdefghjkm1234567890'
        let id = ''

        opciones.split('').forEach(() => {
            const random = opciones.charAt(Math.floor(Math.random() * opciones.length))
            const mayus = Math.floor(Math.random() * 2)
            id += mayus === 0 ? random.toUpperCase() : random
        })

        return id
    }

    static parseTypes(type) {
        let finaltype

        switch (type) {
            case 'number': {
                finaltype = 'INTEGER'
                break;
            }
            case 'string': {
                finaltype = 'TEXT'
                break;
            }
            case 'boolean': {
                finaltype = 'BOOLEAN'
                break;
            }
        }

        return finaltype
    }

    static reverseParseType(type) {
        let finaltype

        switch (type) {
            case 'INTEGER': {
                finaltype = 'number'
                break;
            }
            case 'TEXT': {
                finaltype = 'string'
                break;
            }
            case 'BOOLEAN': {
                finaltype = 'boolean'
                break;
            }
        }

        return finaltype
    }

    static realPath(main_path) {
        return path.join(path.dirname(require.main.filename), main_path)
    }

    static createSqlite(path, Opciones) {
        fs.writeFileSync(path.join(path, `${Opciones.nombre}.sqlite`), '')
    }

    static createPath(Opciones, Class) {
        const ruta = this.realPath(Opciones.dir)

        if (!fs.existsSync(ruta)) throw new uwuDBError('No existe ese directorio!')

        try {
            if (!fs.existsSync(path.join(ruta, `${Opciones.nombre}.sqlite`))) this.createSqlite(ruta, Opciones)

            Class.db = new BetterSqlite3(path.join(ruta, `${Opciones.nombre}.sqlite`), {
                verbose: Opciones.verbose
            })

            if (Opciones.WAL === true) Class.db.pragma('journal_mode = WAL')
        } catch (e) {
            throw new uwuDBError(e)
        }
    }
}

module.exports = Utilidades