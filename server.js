const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const { nanoid } = require("nanoid");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

const DB_FILE = "./database.json";

/* INIT DB */
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ pages: [] }, null, 2));
}

const readDB = () => JSON.parse(fs.readFileSync(DB_FILE));
const writeDB = (data) =>
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

/* HEALTH (FOR 24/7 PING) */
app.get("/health", (req, res) => {
  res.send("OK");
});

/* CREATE PAGE */
app.post("/api/create", (req, res) => {
  const { title, content, category, sender } = req.body;

  const db = readDB();

  const id = nanoid(10);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const page = {
    id,
    slug,
    title,
    content,
    category,
    sender,
    createdAt: new Date()
  };

  db.pages.push(page);
  writeDB(db);

  res.json({
    success: true,
    link: `${req.protocol}://${req.get("host")}/${slug}-${id}`
  });
});

/* VIEW PAGE */
app.get("/:slug-:id", (req, res) => {
  const db = readDB();

  const page = db.pages.find(
    (p) => p.slug === req.params.slug && p.id === req.params.id
  );

  if (!page) return res.send("Page Not Found");

  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${page.title}</title>

<style>
body{
margin:0;
font-family:Poppins,sans-serif;
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
box-shadow:0 10px 30px rgba(0,0,0,0.2);
}

button{
margin-top:10px;
padding:10px;
width:100%;
border:none;
border-radius:10px;
background:#ff4d6d;
color:white;
cursor:pointer;
}
</style>

</head>

<body>

<div class="card">
<h2>💖 Nexvora Love Space</h2>
<h1>${page.title}</h1>
<p><b>Category:</b> ${page.category}</p>
<p>${page.content}</p>
<p><b>From:</b> ${page.sender}</p>

<button onclick="copy()">📋 Copy Link</button>
</div>

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

app.listen(PORT, () => {
  console.log("🚀 Nexvora running on " + PORT);
});
