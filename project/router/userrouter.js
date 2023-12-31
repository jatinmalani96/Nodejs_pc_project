const router = require("express").Router()
const User = require("../modal/user_reg")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const category = require("../modal/categorys")
const u_auth = require("../middleware/user_auth")
const Product = require("../modal/product")


router.get("/",async(req,resp)=>{
    try {
        const prodata = await Product.find()
        // console.log(prodata);
        resp.render("index",{prodata:prodata})
    } catch (error) {
        console.log(error);
    }
})

// -----------------------------------------------login/reg----------------------------------------------------

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
    resp.redirect("/")
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

//---------------------------------------------------------------------------------------------------------
// -----------------------------------------------other----------------------------------------------------

router.get("/category",u_auth,async(req,resp)=>{
   try {
    const catdata = await category.find(req.body)
    const prodata = await Product.find()
    // console.log(catdata);
    
    resp.render("category",{catdata : catdata,prodata:prodata})
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

// -----------------------------------------------carts----------------------------------------------------

const Cart = require("../modal/carts")

router.get("/add_cart",u_auth,async(req,resp)=>{
    const uid = req.user._id
    const pid = req.query.pid
    // console.log(pid);
    try {
        const cartdata = await Cart.findOne({$and:[{pid:pid},{uid:uid}]})
        const pdata = await Product.findOne({_id:pid})
        if (cartdata) {
            var qty = cartdata.qty
            qty++;
            const price = qty * pdata.price
            // console.log(price);
            await Cart.findByIdAndUpdate(cartdata._id,{qty:qty,total:price})
            resp.send("Product add into cart.....")
        } else {
        
        const cart = new Cart({uid:uid,pid:pid,price:pdata.price,qty:1,total :pdata.price})    
        await cart.save()
        resp.send("Product add into cart....")
        }
    } catch (error) {
        console.log(error);
    }  
})

router.get("/cart",u_auth,async(req,resp)=>{
    const user = req.user
    // console.log(user);
    try {
        const cartdata = await Cart.aggregate([{$match:{uid:user._id}},{$lookup:{from:"products",localField:"pid",foreignField:"_id",as:"product"}}])
        // console.log(cartdata);
        var sum = 0;
        for (let i = 0; i < cartdata.length; i++) {
            // console.log(cartdata[i].total);
            sum = sum + cartdata[i].total
        }
        // console.log(sum);        
        resp.render("cart",{cartdata:cartdata,sum:sum})
    } catch (error) {
        console.log(error);
    }
})

router.get("/remove_cart",u_auth,async(req,resp)=>{
    try {
        const pid = req.query.pid
        await Cart.findByIdAndDelete(pid)
        resp.send()
    } catch (error) {
        console.log(error);
    }
})

router.get("/changeQty",async(req,resp)=>{
    try {
        const cartid = req.query.cartid
        const value = req.query.value

        const cartdata = await Cart.findOne({_id:cartid})
        // console.log(cartdata);
        const pdata = await Product.findOne({_id:cartdata.pid})
        var qty = cartdata.qty+Number(value)
        if(qty == 0 ){
            await Cart.findByIdAndDelete(cartid)
            resp.send("updated")
        }else{
        var total = qty*pdata.price
        await Cart.findByIdAndUpdate(cartid,{qty:qty,total:total})
        resp.send("updated")
        // console.log(cartid);
        }

    } catch (error) {
        console.log(error);
    }
})

//------------------------------------------------ Payment / Email ---------------------------------------//
const Order = require("../modal/orders")
var nodemailer = require('nodemailer');
const Razorpay = require("razorpay")
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jpatel.j17@gmail.com',
      pass: 'mnfonatsbdquzqpl'
    }
  });

router.get("/payment",(req,resp)=>{

    const amt = req.query.amt
    var instance = new Razorpay({
        key_id: 'rzp_test_SfX01IJ3wLwTsZ',
        key_secret: 'pxOiUrLB1atPzNP1nsiaLCEy',
      });
// console.log(amt);
      var options = {
        amount: Number(amt)*100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11"
      };
      instance.orders.create(options, function(err, order) {
        resp.send(order)
      });
})

router.get("/confirmorder",u_auth,async(req,resp)=>{
    try {
        const payid = req.query.pid
        const uid = req.user._id
        
        // var productlist = []
        var alltotal = 0;
        var row = 0
        const cartProd = await Cart.find({uid:uid})

        for (let i = 0; i < cartProd.length; i++) {
            const prod = await Product.findOne({_id:cartProd[i].pid})
            
            var pname = prod.pname
            var price = prod.price
            var qty = cartProd[i].qty
            var total = Number(price)*Number(qty)
            
           var productlist=[{
                pname : pname,
                price : price,
                qty : qty,
                total : total
            }]
            alltotal = alltotal+total
            row = row+"<tr><td>"+pname+"</td><td>"+price+"</td><td>"+qty+"</td><td>"+total+"</td></tr>"
        }
        // console.log(productlist);
        const order = new Order({
            uid : uid,
            payid : payid,
            product : productlist,
            total : alltotal
        })
        // console.log(order);
        await order.save()
        

        var mailOptions = {
            from: 'jpatel.j17@gmail.com',
            to: req.user.email,
            subject: 'Sending Email using Node.js',
            html : "<table border='1'><tr<th>Product Name</th><th>Price</th><th>qty</th><th>Total</th></tr>"+row+"<tr><td>AllTotal</td><td>"+alltotal+"</td></tr></table>"
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
                resp.send("Order confirmed......")
            }
          });

    } catch (error) {
        console.log(error);
    }
})

module.exports=router