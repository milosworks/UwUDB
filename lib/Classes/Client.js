const OmegaDBError = require('../Util/Errors')
const Utils = require('../Util/Utils')
const Esquema = require('./Esquema')
const DB = require('./DB')

class OmegaClient {
	constructor(OpcionesCliente = { dir: undefined, nombre: undefined, WAL: false, verbose: undefined }) {
		if (!OpcionesCliente.dir) throw new OmegaDBError('Debes de poner un directorio donde la DB se creara!')
		if (!OpcionesCliente.nombre) throw new OmegaDBError('Debes de poner el nombre de la db!')

		this.OpcionesCliente = OpcionesCliente
		this.Databases = []

		Utils.createPath(this.OpcionesCliente, this)
	}

	crearDB(nombre, esquema) {
		if (!nombre) throw new OmegaDBError('Debes de poner el nombre de la DB')
		if (typeof nombre !== 'string') throw new OmegaDBError(`El nombre de la DB debe ser una string, se recivio: ${typeof nombre}`)
		if (!esquema) throw new OmegaDBError('Debes de poner un esquema para crear la DB')
		if (!(esquema instanceof Esquema)) throw new OmegaDBError('Debes de poner un esquema valido')

		const db = new DB(nombre, esquema, this)
		this.Databases.push(db)

		return db
	}
}

module.exports = OmegaClient