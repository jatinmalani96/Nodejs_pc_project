const express = require("express")
const app = express()
const Razorpay = require("razorpay")
var cors = require('cors')

app.use(cors())
app.get("/payment",(req,resp)=>{

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

app.listen(3000)