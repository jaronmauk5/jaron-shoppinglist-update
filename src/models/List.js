var mongoose = require('mongoose');

var ListSchema = new mongoose.Schema({
    title: { type: String, required: true },
    items: [
        {
            name:{ type: String, required: true},
            completed: Boolean
        }
        ]
});

var List = mongoose.model('List', ListSchema);

module.exports = List;