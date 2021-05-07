const uwuDBError = require('../Util/Errors')
const Utils = require('../Util/Utils')
const Esquema = require('./Esquema')
const DB = require('./DB')

class uwuClient {
	constructor(OpcionesCliente = { dir: undefined, nombre: undefined, WAL: false, verbose: undefined }) {
		if (!OpcionesCliente.dir) throw new uwuDBError('Debes de poner un directorio donde la DB se creara!')
		if (!OpcionesCliente.nombre) throw new uwuDBError('Debes de poner el nombre de la db!')

		this.OpcionesCliente = OpcionesCliente
		this.Databases = []

		Utils.createPath(this.OpcionesCliente, this)
	}

	crearDB(nombre, esquema) {
		if (!nombre) throw new uwuDBError('Debes de poner el nombre de la DB')
		if (typeof nombre !== 'string') throw new uwuDBError(`El nombre de la DB debe ser una string, se recivio: ${typeof nombre}`)
		if (!esquema) throw new uwuDBError('Debes de poner un esquema para crear la DB')
		if (!(esquema instanceof Esquema)) throw new uwuDBError('Debes de poner un esquema valido')

		const db = new DB(nombre, esquema, this)
		this.Databases.push(db)

		return db
	}
}

module.exports = uwuClient