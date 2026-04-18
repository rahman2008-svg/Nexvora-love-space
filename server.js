const express = require("express");
const fs = require("fs");
const path = require("path");
const { nanoid } = require("nanoid");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const DB = "database.json";

/* 📦 LOAD DB */
function loadDB(){
try{
return JSON.parse(fs.readFileSync(DB));
}catch{
return {posts:[]};
}
}

/* 💾 SAVE DB */
function saveDB(data){
fs.writeFileSync(DB, JSON.stringify(data,null,2));
}

/* 🚀 CREATE POST */
app.post("/api/post",(req,res)=>{
const db = loadDB();

const id = nanoid(10);

const post = {
id,
title:req.body.title,
content:req.body.content,
sender:req.body.sender,
time:Date.now()
};

db.posts.push(post);
saveDB(db);

res.json({
link:`${req.protocol}://${req.get("host")}/post/${id}`
});
});

/* 💌 POST PAGE (FULL UI + MUSIC + HEARTS) */
app.get("/post/:id",(req,res)=>{
const db = loadDB();
const post = db.posts.find(p=>p.id===req.params.id);

if(!post){
return res.send("❌ Post not found");
}

res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${post.title}</title>

<style>

body{
margin:0;
font-family:sans-serif;
background:linear-gradient(135deg,#0f172a,#1e293b);
color:white;
overflow:hidden;
height:100vh;
display:flex;
justify-content:center;
align-items:center;
}

.bg{
position:absolute;
width:200%;
height:200%;
background:radial-gradient(circle,#ff4d6d33,#38bdf833,#22c55e33);
animation:bg 10s infinite alternate;
}

@keyframes bg{
0%{transform:translate(0,0);}
100%{transform:translate(-10%,-10%);}
}

.card{
position:relative;
z-index:2;
width:92%;
max-width:420px;
padding:20px;
border-radius:20px;
background:rgba(255,255,255,0.06);
backdrop-filter:blur(20px);
text-align:center;
animation:pop 0.8s ease;
}

@keyframes pop{
0%{transform:scale(0.5);opacity:0;}
100%{transform:scale(1);opacity:1;}
}

h2{margin:0;font-size:20px;}
p{font-size:15px;line-height:1.6;}

button{
width:100%;
padding:12px;
margin-top:10px;
border:none;
border-radius:12px;
font-weight:bold;
cursor:pointer;
}

.copy{
background:linear-gradient(45deg,#22c55e,#86efac);
}

.music{
background:linear-gradient(45deg,#ff4d6d,#ffb3c1);
}

/* 💖 HEARTS */
.heart{
position:absolute;
font-size:18px;
animation:floatUp 6s linear infinite;
}

@keyframes floatUp{
0%{transform:translateY(100vh);}
100%{transform:translateY(-10vh);}
}

/* footer */
.footer{
margin-top:10px;
font-size:11px;
opacity:0.6;
}

</style>
</head>

<body>

<div class="bg"></div>

<!-- 🎧 MUSIC (works for all users) -->
<audio id="bgmusic" loop>
  <source src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3">
</audio>

<div class="card">

<h2>💖 ${post.title}</h2>

<p>${post.content}</p>

<p>👤 ${post.sender}</p>

<button class="copy" onclick="copy()">📋 Copy Link</button>
<button class="music" onclick="playMusic()">🎧 Play Music</button>

<div class="footer">
Abdur Rahman | Nexvora Lab's Ofc
</div>

</div>

<script>

/* 📋 COPY */
function copy(){
navigator.clipboard.writeText(window.location.href);
alert("Copied 💖");
}

/* 🎧 MUSIC FIX (ALL DEVICES) */
function playMusic(){
document.getElementById("bgmusic").play();
}

/* 💖 HEART SYSTEM (ALL USERS) */
setInterval(()=>{
let h=document.createElement("div");
h.classList.add("heart");
h.innerHTML="💖";
h.style.left=Math.random()*100+"vw";
document.body.appendChild(h);

setTimeout(()=>h.remove(),6000);
},300);

</script>

</body>
</html>
`);
});

/* 🚀 START SERVER */
app.listen(3000,()=>{
console.log("🚀 Nexvora Love Space running on http://localhost:3000");
});
