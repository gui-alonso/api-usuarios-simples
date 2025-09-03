const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db/database"); // Conexão MySQL

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const SALT_ROUNDS = 10;

//--- ROTAS DE USUÁRIOS ---

// Criar usuário
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Nome, email e senha são obrigatórios." });
    }

    const emailLowerCase = email.toLowerCase();

    // Verifica se o usuário já existe
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
      emailLowerCase,
    ]);
    if (rows.length > 0)
      return res.status(409).json({ error: "Email já cadastrado." });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const id = uuidv4();
    const createdAt = new Date();

    await db.query(
      "INSERT INTO usuarios (id, name, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)",
      [id, name, emailLowerCase, passwordHash, createdAt]
    );

    res.status(201).json({ id, name, email: emailLowerCase, createdAt });
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    res.status(500).json({ error: "Erro interno ao criar usuário." });
  }
});

// Listar usuários
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, email, createdAt FROM usuarios"
    );
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar usuários:", err);
    res.status(500).json({ error: "Erro ao buscar usuários." });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLowerCase = email.toLowerCase();

    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
      emailLowerCase,
    ]);
    if (rows.length === 0)
      return res.status(401).json({ error: "Credenciais inválidas." });

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword)
      return res.status(401).json({ error: "Credenciais inválidas." });

    res.json({
      message: "Login realizado com sucesso.",
      userId: user.id,
      passwordHash: user.passwordHash, // Apenas para demonstração
    });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(500).json({ error: "Erro interno no login." });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
