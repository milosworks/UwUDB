const uwuDBError = require('./Errors.js')
const Utils = require('./Utilidades')
const VALID_ID = /((a|b|c|d|e|f|g|h|j|k|m)|[0-9]){21}/i

/**
 * Valida una _id, el valor unico para identificar documentos de uwudb
 * @param {string} _id - La _id para validar
 * @returns {boolean}
 */
function validarID(_id) {
    if (typeof _id !== 'string') return false

    const check = VALID_ID.test(_id)

    return check
}

/**
 * Formatea un array en string para convertirlo a un array
 * @param {string} array - El array dentro de una string
 * @returns {any[]}
 */
function formatArray(array) {
    if (typeof array !== 'string') throw new uwuDBError(`El Array debe ser una string, se recivio: ${typeof array}`)

    const finalArray = Utils.replaceAll(array, '\'', '"')

    return JSON.parse(finalArray)
}

module.exports = {
    validarID,
    formatArray
}