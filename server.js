const express = require("express");
const fs = require("fs");
const cors = require("cors");
const { nanoid } = require("nanoid");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

/* 🔥 FRONTEND */
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

/* 📁 DATABASE */
const DB = "database.json";

/* 📥 LOAD */
function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB));
  } catch {
    return { posts: [] };
  }
}

/* 💾 SAVE */
function saveDB(data) {
  try {
    fs.writeFileSync(DB + ".tmp", JSON.stringify(data, null, 2));
    fs.renameSync(DB + ".tmp", DB);
  } catch (e) {
    console.log("Save Error:", e);
  }
}

/* 🚀 CREATE LINK */
app.post("/api/post", (req, res) => {
  const { title, content, category, sender } = req.body;

  if (!title || !content) {
    return res.json({ success: false, msg: "Missing data" });
  }

  const db = loadDB();

  const id = nanoid(10);

  const post = {
    id,
    title,
    content,
    category: category || "Love",
    sender: sender || "Anonymous",
    createdAt: Date.now()
  };

  db.posts.push(post);
  saveDB(db);

  const link = `${req.protocol}://${req.get("host")}/post/${id}`;

  res.json({
    success: true,
    link
  });
});

/* 💌 OPEN MESSAGE PAGE */
app.get("/post/:id", (req, res) => {
  const db = loadDB();
  const post = db.posts.find(p => p.id === req.params.id);

  if (!post) {
    return res.send("❌ Link not found");
  }

  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${post.title}</title>

<meta property="og:title" content="${post.title}">
<meta property="og:description" content="${post.content}">
<meta property="og:type" content="website">

<style>
body{
margin:0;
font-family:sans-serif;
background:linear-gradient(135deg,#0f172a,#1e293b);
color:white;
display:flex;
justify-content:center;
align-items:center;
height:100vh;
overflow:hidden;
}

/* 💖 CARD */
.card{
width:90%;
max-width:420px;
background:#1e293b;
padding:20px;
border-radius:16px;
text-align:center;
animation: openCard 0.8s ease;
}

/* ✨ OPEN ANIMATION */
@keyframes openCard{
from{
opacity:0;
transform:scale(0.8) rotateX(20deg);
}
to{
opacity:1;
transform:scale(1) rotateX(0);
}
}

.tag{
background:#ff4d6d;
padding:5px 10px;
border-radius:10px;
font-size:12px;
}

button{
width:100%;
padding:12px;
margin-top:10px;
border:none;
border-radius:10px;
background:#22c55e;
color:black;
font-weight:bold;
}

/* 📌 FOOTER */
.footer{
margin-top:15px;
font-size:12px;
opacity:0.7;
}
</style>
</head>

<body>

<div class="card">

<h2>💖 ${post.title}</h2>

<span class="tag">${post.category}</span>

<p style="margin-top:15px">${post.content}</p>

<p>👤 ${post.sender}</p>

<button onclick="copy()">📋 Copy Link</button>

<div class="footer">
© 2026 Abdur Rahman | Nexvora Lab's Ofc
</div>

</div>

<script>
function copy(){
navigator.clipboard.writeText(window.location.href);
alert("Link Copied!");
}
</script>

</body>
</html>
  `);
});

/* ❤️ HEALTH CHECK */
app.get("/health", (req, res) => {
  res.send("OK");
});

/* 🚀 START */
app.listen(3000, () => {
  console.log("🚀 Nexvora Love Space running on http://localhost:3000");
});
