const router = require("express").Router()
const User = require("../modal/user_reg")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const category = require("../modal/caregoty")
const u_auth = require("../middleware/user_auth")
const Product = require("../modal/product")


router.get("/",u_auth,async(req,resp)=>{
    try {
        const prodata = await Product.find()
        // console.log(prodata);
        resp.render("index",{prodata:prodata})
    } catch (error) {
        console.log(error);
    }
})

// ------------------------------login/reg------------------------------------------

router.get("/login",(req,resp)=>{
    resp.render("login")
})

router.post("/do_login",async(req,resp)=>{
    try {
        const user = await User.findOne({uname : req.body.uname})
        // console.log(user);
        const isMach = await bcrypt.compare(req.body.pass,user.pass)
        if(isMach)
        {
            const token  = await jwt.sign({_id:user._id},process.env.U_KEY)
            user.Tokens = user.Tokens.concat({token:token})
            user.save()
            resp.cookie("ujwt",token)
            resp.redirect("/")
        }else{
            resp.render("login",{err:"Plese enter valid username and password"})
        }
        
    } catch (error) {
        resp.render("login",{err:"Plese enter valid username and password"})
    }
})

router.get("/logout",(req,resp)=>{
    resp.clearCookie("ujwt")
    resp.redirect("/",)
})

router.get("/registration",(req,resp)=>{
    resp.render("registration")
})

router.post("/do_ragister",async(req,resp)=>{
    try {
        const user = new User(req.body)
        user.pass = await bcrypt.hash(user.pass,10)
        // console.log(user);
        await user.save()
        resp.render("login")
    } catch (error) {
        resp.send(error)
    }
})

// -----------------------------other-------------------------------------

router.get("/category",u_auth,async(req,resp)=>{
   try {
    const catdata = await category.find(req.body)
    
    resp.render("category",{catdata : catdata})
   } catch (error) {
    
   }
})

router.get("/contact",(req,resp)=>{
    resp.render("contact")
})

router.get("/checkout",u_auth,(req,resp)=>{
    resp.render("checkout")
})

router.get("/confirmation",(req,resp)=>{
    resp.render("confirmation")
})

router.get("/single-product",async(req,resp)=>{
    const pid = req.query.pid
    try {        
        const prodata = await Product.findOne({_id:pid})
        // console.log(prodata); 
        resp.render("single-product",{prodata:prodata,pid:pid})
        
    } catch (error) {
        console.log(error);
    }
})

router.get("/tracking",(req,resp)=>{
    resp.render("tracking")
})

router.get("/blog",(req,resp)=>{
    resp.render("blog")
})

router.get("/single-blog",(req,resp)=>{
    resp.render("single-blog")
})

// --------------------------carts-------------------

const Cart = require("../modal/carts")

// router.get("/cart",(req,resp)=>{
//     resp.render("cart")
// })

router.get("/add_cart",u_auth,async(req,resp)=>{
    const uid = req.user._id
    const pid = req.query.pid
    // console.log(pid);
    try {
        const pdata = await Product.findOne({_id:pid})
        const cart = new Cart({uid:uid,pid:pid,price:pdata.price,qty:1,total :pdata.price})    
        await cart.save()
        resp.send("Product add into cart")
    } catch (error) {
        console.log(error);
    }
    
})

module.exports=router