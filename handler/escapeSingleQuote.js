function escapeSingleQuote(text) {
    return text.replace('\'', '\\\'');
}

module.exports = escapeSingleQuote;