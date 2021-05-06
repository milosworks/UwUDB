const path = require('path')
const fs = require('fs')
const OmegaDBError = require('../Util/Errors.js')
const BetterSqlite3 = require('better-sqlite3')

class Utils {
    constructor() {
        throw new Error('Esta clase no debe ser instanciada')
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

    static realPath(main_path) {
        return path.join(path.dirname(require.main.filename), main_path)
    }

    static createSqlite(path, Opciones) {
        fs.writeFileSync(`${path}/${Opciones.nombre}.sqlite`, '')
    }

    static createPath(Opciones, Class) {
        const ruta = this.realPath(Opciones.dir)

        if (!fs.existsSync(ruta)) throw new OmegaDBError('No existe ese directorio!')

        try {
            if (!fs.existsSync(`${ruta}/${Opciones.nombre}.sqlite`)) this.createSqlite(ruta, Opciones)

            Class.db = new BetterSqlite3(`${ruta}/${Opciones.nombre}.sqlite`, {
                verbose: Opciones.verbose
            })

            if (Opciones.WAL === true) Class.db.pragma('journal_mode = WAL')
        } catch (e) {
            throw new OmegaDBError(e)
        }
    }
}

module.exports = Utils