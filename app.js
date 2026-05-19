// ==========================
// IMPORT
// ==========================
const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const mysql = require("mysql2")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const path = require("path")
const client = require("prom-client")

// ==========================
// APP CONFIG
// ==========================
const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(bodyParser.json())

// ==========================
// PROMETHEUS METRICS
// ==========================
const register = new client.Registry()
client.collectDefaultMetrics({ register })

// ==========================
// ENV / CONFIG
// ==========================
const DB_HOST = process.env.DB_HOST || "127.0.0.1"
const DB_USER = process.env.DB_USER || "root"
const DB_PASS = process.env.DB_PASS || "Rooting!123"
const DB_NAME = process.env.DB_NAME || "tubes_devsecop"
const JWT_SECRET = process.env.JWT_SECRET || "secret123"

// ==========================
// DATABASE
// ==========================
const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME
})

db.connect(err => {
  if (err) {
    console.error("DB ERROR:", err)
    return
  }
  console.log("MySQL Connected!")
})

// ==========================
// LOGGER
// ==========================
app.use((req, res, next) => {
  console.log(`REQ: ${req.method} ${req.url}`)
  next()
})

// ==========================
// AUTH MIDDLEWARE
// ==========================
function auth(req, res, next) {
  const header = req.headers.authorization
  if (!header) return res.status(401).send("No token")

  const token = header.split(" ")[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).send("Invalid token")
  }
}

// ==========================
// REGISTER
// ==========================
app.post("/register", async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).send("Email & password wajib")
  }

  try {
    const hashed = await bcrypt.hash(password, 10)

    db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashed],
      (err) => {
        if (err) return res.status(500).send("Register gagal")
        res.send("Register berhasil")
      }
    )
  } catch {
    res.status(500).send("Server error")
  }
})

// ==========================
// LOGIN
// ==========================
app.post("/login", (req, res) => {
  const { email, password } = req.body

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {

      if (err) {
        console.log(err)
        return res.status(500).send("Database error")
      }

      if (!results || results.length === 0) {
        return res.status(401).send("Login gagal")
      }

      const user = results[0]

      const match = await bcrypt.compare(password, user.password)

      if (!match) {
        return res.status(401).send("Login gagal")
      }

      const token = jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: "1h" }
      )

      res.json({ token })
    }
  )
})

// ==========================
// CREATE TASK
// ==========================
app.post("/tasks", auth, (req, res) => {

  const { title, description, date, start, end } = req.body

  db.query(
    "INSERT INTO tasks (title, description, date, start, end, user_id) VALUES (?, ?, ?, ?, ?, ?)",
    [title, description, date, start, end, req.user.id],
    (err, result) => {

      if (err) {
        console.log(err)
        return res.status(500).send("Database Error")
      }

      res.send("Task berhasil dibuat")

    }
  )
})

// ==========================
// GET TASKS
// ==========================
app.get("/tasks", auth, (req, res) => {
  db.query(
    `SELECT id, title, description, date, start, end, status
     FROM tasks WHERE user_id = ? ORDER BY id DESC`,
    [req.user.id],
    (err, results) => res.json(results)
  )
})

// ==========================
// EDIT TASK
// ==========================
app.put("/tasks/:id", auth, (req, res) => {
  const { title, description, date, start, end } = req.body

  db.query(
    `UPDATE tasks 
     SET title=?, description=?, date=?, start=?, end=? 
     WHERE id=? AND user_id=?`,
    [title, description, date, start, end, req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).send("Update gagal")
      res.send("Task diupdate")
    }
  )
})

// ==========================
// DELETE TASK
// ==========================
app.delete("/tasks/:id", auth, (req, res) => {
  db.query(
    "DELETE FROM tasks WHERE id=? AND user_id=?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).send("Delete gagal")
      res.send("Task dihapus")
    }
  )
})

// ==========================
// DONE TASK
// ==========================
app.put("/tasks/:id/done", auth, (req, res) => {
  db.query(
    "UPDATE tasks SET status='done' WHERE id=? AND user_id=?",
    [req.params.id, req.user.id],
    (err) => {
      if (err) return res.status(500).send("Gagal update status")
      res.send("Task selesai")
    }
  )
})

// ==========================
// METRICS
// ==========================
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType)
  res.end(await register.metrics())
})

// ==========================
// STATIC
// ==========================
app.use(express.static(path.join(__dirname, "public")))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

// ==========================
// SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`Server jalan di ${PORT}`)
})