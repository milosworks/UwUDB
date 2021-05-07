const VALID_ID = /((a|b|c|d|e|f|g|h|j|k|m)|[0-9]){21}/i

function validarID(_id) {
    if (typeof _id !== 'string') return false

    const check = VALID_ID.test(_id)

    return check
}


module.exports = {
    validarID
}