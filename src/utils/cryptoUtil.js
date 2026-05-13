const bcrypt = require('bcrypt');
const crypto = require('crypto');

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

const generateToken = () => {
    return crypto.randomBytes(64).toString('hex');
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken
};
