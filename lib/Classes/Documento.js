const uwuDBError = require('../Util/Errors')

class Documento {
    constructor(data, db) {
        if (!data) throw new uwuDBError('Necesitas poner los datos del documento')
        if (!db) throw new uwuDBError('Debes de poner una db')

        Object.defineProperty(this, 'db', db)
        Object.assign(this, data)
    }

    eliminar() {
        return this.db.eliminarPorId(this._id)
    }
}

module.exports = Documento