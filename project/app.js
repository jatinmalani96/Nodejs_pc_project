const express = require("express")
const app = express()
const mongoose = require("mongoose")
require("dotenv").config()
const PORT = process.env.PORT
const DB_URL = process.env.DB_URL
const hbs = require("hbs")
const path = require("path")
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser')
var cors = require('cors')


const publicPath = path.join(__dirname,"./public")
const viewPath = path.join(__dirname,"./temp/views")
const partialPath = path.join(__dirname,"./temp/partials")

app.use(cors())
app.set("view engine","hbs")
app.set("views",viewPath)
hbs.registerPartials(partialPath)
app.use(express.static(publicPath))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())


mongoose.connect(DB_URL).then(result=>{
    console.log("DB connected....");
}).catch(err=>{
    console.log(err);
})




app.use("/",require("./router/userrouter"))
app.use("/",require("./router/adminrouter"))



app.listen(PORT,()=>{
    console.log("server running on PORT : "+PORT);
})