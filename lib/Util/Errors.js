class OmegaDBError extends Error {
	constructor(message) {
		super()

		this.message = message
		this.name = 'OmegaDBError'
	}
}

module.exports = OmegaDBError