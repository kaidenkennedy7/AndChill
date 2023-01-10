const mongoose = require('mongoose');

const credentialsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'favorite' }]
});

module.exports = mongoose.model('credentials', credentialsSchema);