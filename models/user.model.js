const mongoose = require("mongoose")


const userSchema =  mongoose.Schema({
        user_id : Number,
        user_name : String,
        bank_accounts:[],
        name : String,
        accounts :[{
            bank:String,
            branch:String,
            address:String,
            city:String,
            district : String,
            state:String,
            bank_code: String,
            
        }],
        weather:{
            temp: {type:Number , default:0},
            humidity:{type :Number , default:0}
        }

});

const User = mongoose.model("User" , userSchema)
module.exports = User