const jwt = require("jsonwebtoken")
const admin = require("../modal/admins")

const admin_auth =async (req,resp,next)=>{
    const token = req.cookies.ajwt
   try {  
    const data = await jwt.verify(token,process.env.A_KEY)
    if(data){
        const Admin = await admin.findOne({_id : data._id})
        req.Admin = Admin
        req.token = token
        next()
    }
    else{
        resp.render("admin_login",{err : "Plsese Login First ???"})
    }
    
    
   } catch (error) {
    resp.render("admin_login",{err : "Plsese Login First ???"})
   }

}





module.exports=admin_auth