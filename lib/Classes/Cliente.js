const uwuDBError = require('../Util/Errors')
const Utils = require('../Util/Utilidades')
const Esquema = require('./Esquema')
const DB = require('./DB')

class uwuCliente {

	/**
	 * @typedef {object} OpcionesCliente
	 * @property {string} dir
	 * @property {string} nombre
	 * @property {boolean} WAL
	 * @property {any} verbose
	 */

	/**
	 * Crea al cliente de uwudb, en el que puedes crear una db
	 * @param {OpcionesCliente} Opciones - Las opciones del cliente
	 */
	constructor(Opciones) {
		const OpcionesCliente = { dir: undefined, nombre: undefined, WAL: false, verbose: undefined }
		Object.assign(OpcionesCliente, Opciones)

		if (!OpcionesCliente) throw new uwuDBError('Debes ingresar el objeto de OpcionesCliente')
		if (typeof OpcionesCliente !== 'object' || Array.isArray(OpcionesCliente)) throw new uwuDBError(`OpcionesCliente debe ser un objeto, se recibió ${typeof OpcionesCliente}`)
		if (!OpcionesCliente.dir) throw new uwuDBError('Debes de poner un directorio donde la DB se creara!')
		if (typeof OpcionesCliente.dir !== 'string') throw new uwuDBError(`OpcionesCliente.dir debe ser una string, se recibió '${typeof OpcionesCliente.dir}'`)
		if (!OpcionesCliente.nombre) throw new uwuDBError('Debes de poner el nombre de el archivo de la db!')
		if (typeof OpcionesCliente.nombre !== 'string') throw new uwuDBError(`OpcionesCliente.nombre debe ser un string, se recibió '${typeof OpcionesCliente.nombre}'`)
		if (typeof OpcionesCliente.WAL !== 'boolean') throw new uwuDBError(`OpcionesCliente.WAL debe ser un booleano, se recibió '${typeof OpcionesCliente.WAL}'`)

		/**
		   * Las opciones del cliente ingresadas en el constructor
		   * @type {OpcionesCliente}
		  */
		this.OpcionesCliente = OpcionesCliente

		/**
		   * Todas las dbs creadas en un array
		   * @type {Map<string, DB>}
		  */
		this.Databases = new Map()

		Utils.createPath(this.OpcionesCliente, this)
	}

	/**
	 * Crea una nueva db
	 * @param {string} nombre - El nombre de la nueva db
	 * @param {Esquema} esquema - El esquema de la db
	 */
	crearDB(nombre, esquema) {
		if (!nombre) throw new uwuDBError('Debes de poner el nombre de la DB')
		if (typeof nombre !== 'string') throw new uwuDBError(`El nombre de la DB debe ser una string, se recibió: ${typeof nombre}`)
		if (!esquema) throw new uwuDBError('Debes de poner un esquema para crear la DB')
		if (!(esquema instanceof Esquema)) throw new uwuDBError('Debes de poner un esquema valido')

		const db = new DB(nombre, esquema, this)
		this.Databases.set(nombre, db)

		return db
	}

	/**
	 * Elimina una DB (Tabla) de uwudb
	 * @param {string} nombre - El nombre de la base de datos a borrar
	 * @returns {boolean}
	 */
	eliminarDB(nombre) {
		if (!nombre) throw new uwuDBError('Debes de poner el nombre de la DB')
		if (typeof nombre !== 'string') throw new uwuDBError(`El nombre de la DB debe ser una string, se recibió: ${typeof nombre}`)

		const exist = this.db.prepare('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=?').get(nombre)
		if (!exist) throw new uwuDBError('No existe esa DB')

		this.db.prepare(`DROP TABLE ${nombre}`).run()

		return true
	}
}

module.exports = uwuCliente