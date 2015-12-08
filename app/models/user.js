//Load package
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

//Define the schema
var userSchema = mongoose.Schema({
  local : {
    email     : String,
    password  : String,
  },
  facebook : {
    id        : String,
    token     : String,
    email     : String,
    name      : String
  },
  twitter : {
    id        : String,
    token     : String,
    displayName : String,
    username  : String
  },
  google : {
    id        : String,
    token     : String,
    email     : String,
    name      : String
  }
});

//Methods
//Generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//Check if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('User', userSchema);
