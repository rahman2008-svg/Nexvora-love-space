const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const { nanoid } = require("nanoid");

const app = express();

const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/music", express.static("public/music"));

const DB_FILE = "database.json";

function readDB(){
return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data){
fs.writeFileSync(DB_FILE, JSON.stringify(data,null,2));
}

/* CREATE */
app.post("/api/create",(req,res)=>{

const {title,content,mode,category} = req.body;

const db = readDB();

const slug = title.toLowerCase().replace(/[^a-z0-9]+/g,'-');

const page = {
id:nanoid(6),
slug,
title,
content,
mode:mode||"love",
category:category||"general",
music:"/music/soft.mp3",
views:0
};

db.pages.push(page);
writeDB(db);

/* 🔥 FIX: REAL HOST DETECT (NO localhost problem) */
const host = req.headers.host;

res.json({
success:true,
link:`http://${host}/${page.slug}-${page.id}`
});
});

/* PAGE */
app.get("/:slug-:id",(req,res)=>{

const db = readDB();

const page = db.pages.find(
p=>p.slug===req.params.slug && p.id===req.params.id
);

if(!page) return res.send("Not Found");

page.views++;
writeDB(db);

res.send(`
<!DOCTYPE html>
<html>
<head>
<title>${page.title}</title>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<style>

/* 🌈 BACKGROUND ANIMATION */
body{
margin:0;
font-family:Arial;
overflow:hidden;
background:linear-gradient(-45deg,#ff758c,#ff99b6,#ffd6e0,#ff4d6d);
background-size:400% 400%;
animation:bg 10s infinite;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
}

@keyframes bg{
0%{background-position:0 50%}
50%{background-position:100% 50%}
100%{background-position:0 50%}
}

/* 💖 FLOAT HEARTS */
.heart{
position:absolute;
color:white;
animation:float 6s linear infinite;
}

@keyframes float{
from{transform:translateY(100vh) scale(0.5);opacity:1}
to{transform:translateY(-10vh) scale(1.5);opacity:0}
}

/* 📦 CARD ANIMATION */
.card{
background:rgba(255,255,255,0.15);
backdrop-filter:blur(15px);
border:1px solid rgba(255,255,255,0.3);
padding:25px;
border-radius:20px;
width:90%;
max-width:420px;
text-align:center;
animation:pop .6s ease;
color:white;
}

@keyframes pop{
from{transform:scale(.3);opacity:0}
to{transform:scale(1);opacity:1}
}

h1{animation:fade 1s ease}
p{animation:fade 2s ease}

@keyframes fade{
from{opacity:0;transform:translateY(20px)}
to{opacity:1;transform:translateY(0)}
}

button{
padding:10px;
border:none;
border-radius:10px;
background:#ff4d6d;
color:white;
margin-top:10px;
width:100%;
cursor:pointer;
transition:0.3s;
}

button:hover{
transform:scale(1.05);
}

audio{
width:100%;
margin-top:10px;
}

footer{
position:fixed;
bottom:10px;
color:white;
font-size:12px;
opacity:0.8;
}
</style>

</head>

<body>

<div class="card">

<h1>💖 ${page.title}</h1>
<p>${page.content}</p>

<audio id="music" controls loop>
<source src="${page.music}">
</audio>

<button onclick="document.getElementById('music').play()">▶ Play Music</button>
<button onclick="copyLink()">📋 Copy Link</button>

</div>

<footer>
© Abdur Rahman | Nexvora Lab's Ofc
</footer>

<script>

/* 💖 HEART ANIMATION */
function createHearts(){
setInterval(()=>{
let heart=document.createElement("div");
heart.innerHTML="💖";
heart.className="heart";
heart.style.left=Math.random()*100+"vw";
heart.style.fontSize=Math.random()*20+10+"px";
document.body.appendChild(heart);

setTimeout(()=>heart.remove(),6000);
},300);
}

createHearts();

/* 📋 COPY LINK FIX */
function copyLink(){
navigator.clipboard.writeText(window.location.href)
.then(()=>alert("Link Copied ✔"))
.catch(()=>prompt("Copy link:",window.location.href));
}

</script>

</body>
</html>
`);
});

app.listen(PORT,()=>{
console.log("🚀 Running on http://"+PORT);
});
