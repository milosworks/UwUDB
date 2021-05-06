const DB = require('./DB')
const OmegaDBError = require('../Util/Errors')

class Documento {
    constructor(data, db) {
        if (!data) throw new OmegaDBError('Necesitas poner los datos del documento')
        if (!db) throw new OmegaDBError('Debes de poner una db')
        if (!(db instanceof DB)) throw new OmegaDBError('Esa no es una db valida')

        Object.assign(this, data)
    }

    eliminar() {

    }
}

module.exports = Documento