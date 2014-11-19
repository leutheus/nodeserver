var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CalSchema = new Schema({
    name: String,
    start: {type: Date, default: Date.now },
    end: Date,
    location: String
});
var Cal = mongoose.model('Cal', CalSchema);
module.exports = Cal;



