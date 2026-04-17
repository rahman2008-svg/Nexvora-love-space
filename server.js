const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

/* ===== DATABASE SETUP ===== */

const DB_FILE = "database.json";
let useMongo = true;

/* JSON DB INIT */
if(!fs.existsSync(DB_FILE)){
fs.writeFileSync(DB_FILE, JSON.stringify({pages:[]},null,2));
}

function readJSON(){
return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeJSON(data){
fs.writeFileSync(DB_FILE, JSON.stringify(data,null,2));
}

/* ===== MONGODB CONNECT ===== */

mongoose.connect(
"mongodb+srv://freelancerar21_db_user:r86jvZpgak7yVYRt@cluster0.83cvgdl.mongodb.net/nexvora?retryWrites=true&w=majority",
{
useNewUrlParser:true,
useUnifiedTopology:true
}
)
.then(()=>console.log("✅ MongoDB Connected"))
.catch(err=>{
console.log("❌ Mongo Failed → Using JSON DB");
useMongo = false;
});

/* MODEL */
const Page = mongoose.model("Page",{
id:String,
title:String,
content:String,
category:String,
sender:String,
createdAt:String
});

/* HEALTH */
app.get("/health",(req,res)=>res.send("OK"));

/* ===== CREATE ===== */
app.post("/api/create", async (req,res)=>{

const {title,content,category,sender} = req.body;
const id = nanoid(7);

const page = {
id,
title,
content,
category,
sender,
createdAt:new Date().toISOString()
};

if(useMongo){
await new Page(page).save();
}else{
const db = readJSON();
db.pages.push(page);
writeJSON(db);
}

const host=req.get("host");

res.json({
success:true,
link:`${req.protocol}://${host}/p/${id}`
});

});

/* ===== VIEW PAGE ===== */
app.get("/p/:id", async (req,res)=>{

let page;

if(useMongo){
page = await Page.findOne({id:req.params.id});
}else{
const db = readJSON();
page = db.pages.find(p=>p.id===req.params.id);
}

if(!page){
return res.send("<h1>Page Not Found</h1>");
}

res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${page.title}</title>

<style>
body{
margin:0;
font-family:sans-serif;
background:linear-gradient(135deg,#ff4d6d,#ff99b6,#ffd6e0);
display:flex;
justify-content:center;
align-items:center;
height:100vh;
color:white;
}

.card{
width:90%;
max-width:420px;
background:rgba(255,255,255,0.15);
backdrop-filter:blur(20px);
padding:20px;
border-radius:20px;
text-align:center;
animation:pop .5s ease;
}

@keyframes pop{
from{transform:scale(.5);opacity:0}
to{transform:scale(1);opacity:1}
}

button{
margin-top:10px;
padding:10px;
width:100%;
border:none;
border-radius:10px;
background:#ff4d6d;
color:white;
}

footer{
position:fixed;
bottom:10px;
width:100%;
text-align:center;
font-size:12px;
}
</style>
</head>

<body>

<div class="card">

<h2>💖 Nexvora Love Space</h2>

<h1>${page.title}</h1>

<p><b>From:</b> ${page.sender || "Anonymous"}</p>

<p>${page.content}</p>

<p>📌 ${page.category}</p>

<button onclick="copy()">📋 Copy Link</button>

</div>

<footer>
Abdur Rahman | Nexvora Lab's Ofc
</footer>

<script>
function copy(){
navigator.clipboard.writeText(window.location.href);
alert("Link Copied ✔");
}
</script>

</body>
</html>
`);
});

app.listen(PORT,()=>{
console.log("🚀 Nexvora Love Space running on http://localhost:"+PORT);
});
