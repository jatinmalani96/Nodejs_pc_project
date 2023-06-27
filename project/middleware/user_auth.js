const jwt = require("jsonwebtoken")
const User = require("../modal/user_reg")

const user_auth =async (req,resp,next)=>{
    const token = req.cookies.ujwt
   try {  
    const data = await jwt.verify(token,process.env.U_KEY)
    // console.log(data);
    if(data){
        const user = await User.findOne({_id : data._id})
  
        req.user = user
        req.token = token
        next()
    }
    else{
        resp.render("login",{err : "Plsese Login First ???"})
    }
    
    
   } catch (error) {
    resp.render("login",{err : "Plsese Login First ???"})
   }

}





module.exports=user_auth