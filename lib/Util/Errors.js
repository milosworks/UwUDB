class uwuDBError extends Error {
	constructor(message) {
		super()

		this.message = message
		this.name = 'uwuDBError'
	}
}

module.exports = uwuDBError