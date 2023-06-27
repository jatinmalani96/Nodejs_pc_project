const router = require("express").Router()
const admin = require("../modal/admins")
const jwt = require("jsonwebtoken")
const a_auth = require("../middleware/admin_auth")

router.get("/admin_login",(req,resp)=>{
    resp.render("admin_login")
})

router.get("/admin_index",a_auth,(req,resp)=>{
    resp.render("admin_index")
})

router.post("/do_a_login",async(req,resp)=>{
    try {
        const Admin = await admin.findOne({uname:req.body.uname})
       
        if(Admin.pass==req.body.pass)
        {
            const token = await jwt.sign({_id:Admin._id},process.env.A_KEY)
            // console.log(token);
            resp.cookie("ajwt",token)
            resp.redirect("admin_index")
        }else{
            resp.render("admin_login",{err:"invalid username and password...."})
        }

    } catch (error) {
        resp.render("admin_login",{err:"invalid username and password...."})
    }
})

router.get("/admin_logout",(req,resp)=>{
   resp.clearCookie("ajwt")
   resp.render("admin_login")
})

//------------------------------------Categoty-------------------------------
const category  = require("../modal/caregoty")

router.get("/admin_category",a_auth,async(req,resp)=>{
    try {
        const catname = await category.find(req.body)
        // console.log(catname);
        resp.render("admin_category",{catname:catname})
    } catch (error) {
        console.log(error);
    }
})

router.post("/add_category",async(req,resp)=>{
    try {
       const cat = new category(req.body)
    //    console.log(cat);
       await cat.save()
       resp.redirect("admin_category")
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete_category",a_auth,async(req,resp)=>{
    try {
       const id = req.query.uid
    //    console.log(id);
        await category.findByIdAndDelete(id)
        resp.redirect("admin_category")
    } catch (error) {
        console.log(error);
    }
})

router.get("/edit_category",a_auth,async(req,resp)=>{
    try {
        const id = req.query.uid
       const catdata = await category.findOne({_id : id})
       resp.render("admin_edit_category",{catdata:catdata})
    } catch (error) {
        console.log(error);
    }
})

router.post("/update_category",async(req,resp)=>{
    try {
        const id = req.body.id
         
        await category.findByIdAndUpdate(id,req.body)
        resp.redirect("admin_category")
    } catch (error) {
        console.log(error);
    }
})

//------------------------------------Product-------------------------------

const product = require("../modal/product")
const multer = require("multer")
const fs = require("fs") 

const storageEngine = multer.diskStorage({
    destination : "./public/productimg",
    filename : (req,file,cb)=>{
        cb(null,`${Date.now()}--${file.originalname}`)
    }
})

const upload = multer({
    storage : storageEngine
})

router.get("/admin_product",a_auth,async(req,resp)=>{
    try {
        const data = await product.find()
        const catdata = await category.find()
        resp.render("admin_product",{catdata : catdata,pdata:data})
    } catch (error) {
        console.log(error);
    }
})

router.post("/add_product",upload.single("img"),async(req,resp)=>{
    try {
        const pro = new product({catid:req.body.catid,pname:req.body.pname,price:req.body.price,qty:req.body.qty,img:req.file.filename})     
        await pro.save()
        resp.redirect("admin_product")
    } catch (error) {
        console.log(error);
    }
})

router.get("/delete_product",async(req,resp)=>{
    try {
       const id = req.query.pid
       const data = await product.findByIdAndDelete(id)
       fs.unlinkSync("public/productimg/"+data.img)
       resp.redirect("admin_product")
    } catch (error) {
        console.log(error);
    }
})

router.get("/edit_product",async(req,resp)=>{
    try {
        const id = req.query.pid
        const proddata = await product.findOne({_id:id})
        resp.render("admin_edit_product",{proddata : proddata})
       
    } catch (error) {
        console.log(error);
    }
})

// router.post("/update_product",async(req,resp)=>{
//     try {
//         const id = req.body._id
//         console.log(id);
//     } catch (error) {
//         console.log(error);
//     }
// })


module.exports=router