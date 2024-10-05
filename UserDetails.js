const mongoose = require("mongoose");

const UserDetailsSchema = new mongoose.Schema({
    name: String,
    email: {type:String, unique:true},
    number: String,
    password: String
},{
    collection:"UserInfo"
});
mongoose.model("UserInfo", UserDetailsSchema);