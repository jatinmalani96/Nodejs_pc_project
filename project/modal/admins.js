const mongoose = require("mongoose")



const adminSchema =  mongoose.Schema({
    uname : {
        type : String
    },
    pass : {
        type : String
    }
})




module.exports=new mongoose.model("Admins",adminSchema)