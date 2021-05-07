// eslint-disable-next-line
const BetterSqlite3 = require('better-sqlite3')
const uwuDBError = require('../Util/Errors')

class Documento {
    constructor(data, db) {
        if (!data) throw new uwuDBError('Necesitas poner los datos del documento')
        if (!db) throw new uwuDBError('Debes de poner una db')

        Object.defineProperty(this, '__db', {
            value: db,
            writable: true
        })
        Object.assign(this, data)
    }

    /**
     * Elimina el documento actual
     * @returns {BetterSqlite3.RunResult}
     */
    eliminar() {
        return this.__db.eliminarPorId(this._id)
    }
}

module.exports = Documento