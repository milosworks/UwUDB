const uwuDBError = require('../Util/Errors')

class Documento {
    constructor(data, db) {
        if (!data) throw new uwuDBError('Necesitas poner los datos del documento')
        if (!db) throw new uwuDBError('Debes de poner una db')

        Object.defineProperty(this, '__db', {
            value: db,
            writable: false
        })
        Object.assign(this, data)
    }

    /**
     * Elimina el documento actual
     * @returns {{ok: boolean, changes: number}}
     */
    eliminar() {
        return this.__db.eliminarPorId(this._id)
    }

    /**
     * Guarda los cambios en el objeto del documento
     * @returns {Documento}
     */
    guardar() {
        return this.__db.actualizarUno({ _id: this._id }, this)
    }
}

module.exports = Documento