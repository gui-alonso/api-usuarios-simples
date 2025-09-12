const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const db = require("../db/database"); // Importa conexão com MySQL

const app = express();
app.use(cors()); // Libera acesso de outras origens (CORS)
app.use(express.json()); // Permite receber JSON no corpo das requisições

const PORT = 3000;
const SALT_ROUNDS = 10; // Número de "rodadas" para criptografia da senha

//--- ROTAS DE USUÁRIOS ---

// Criar usuário (POST)
app.post("/api/users", async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        // Validação de campos obrigatórios
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ error: "Nome, email e senha são obrigatórios." });
        }

        const emailLowerCase = email.toLowerCase();

        // Verifica se o email já existe
        const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
            emailLowerCase,
        ]);
        if (rows.length > 0)
            return res.status(409).json({ error: "Email já cadastrado." });

        // Criptografa a senha
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insere o novo usuário no banco com o campo 'role'
        const [result] = await db.query(
            "INSERT INTO usuarios (name, email, passwordHash, role) VALUES (?, ?, ?, ?)",
            [name, emailLowerCase, passwordHash, role]
        );

        const id = result.insertId;

        res.status(201).json({ id, name, email: emailLowerCase, role });
    } catch (err) {
        console.error("Erro ao criar usuário:", err);
        res.status(500).json({ error: "Erro interno ao criar usuário." });
    }
});

// Listar todos os usuários (GET)
app.get("/api/users", async (req, res) => {
    try {
        // Retorna apenas dados básicos dos usuários
        const [rows] = await db.query(
            "SELECT id, name, email, role, createdAt FROM usuarios"
        );
        res.json(rows);
    } catch (err) {
        console.error("Erro ao buscar usuários:", err);
        res.status(500).json({ error: "Erro ao buscar usuários." });
    }
});

// Buscar usuário por ID (GET)
app.get("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Busca usuário pelo ID
        const [rows] = await db.query(
            "SELECT id, name, email, role, createdAt FROM usuarios WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        const user = rows[0];
        res.json(user);
    } catch (err) {
        console.error("Erro ao buscar usuário por ID:", err);
        res.status(500).json({ error: "Erro interno ao buscar usuário." });
    }
});

// Atualizar usuário (PUT)
app.put("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        // Verifica se o usuário existe
        const [rows] = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);
        if (rows.length === 0)
            return res.status(404).json({ error: "Usuário não encontrado." });

        const user = rows[0];

        // Define os novos valores (ou mantém os antigos)
        const updatedName = name || user.name;
        const updatedEmail = email ? email.toLowerCase() : user.email;
        const updatedRole = role || user.role;
        const updatedPasswordHash = password
            ? await bcrypt.hash(password, SALT_ROUNDS)
            : user.passwordHash;

        // Atualiza no banco
        await db.query(
            "UPDATE usuarios SET name = ?, email = ?, passwordHash = ?, role = ? WHERE id = ?",
            [updatedName, updatedEmail, updatedPasswordHash, updatedRole, id]
        );

        res.json({
            message: "Usuário atualizado com sucesso.",
            id: parseInt(id),
            name: updatedName,
            email: updatedEmail,
            role: updatedRole,
        });
    } catch (err) {
        console.error("Erro ao atualizar usuário:", err);
        res.status(500).json({ error: "Erro interno ao atualizar usuário." });
    }
});

// Deletar usuário (DELETE)
app.delete("/api/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Verifica se o usuário existe
        const [rows] = await db.query("SELECT * FROM usuarios WHERE id = ?", [id]);
        if (rows.length === 0)
            return res.status(404).json({ error: "Usuário não encontrado." });

        // Exclui do banco
        await db.query("DELETE FROM usuarios WHERE id = ?", [id]);

        res.json({ message: "Usuário deletado com sucesso.", id: parseInt(id) });
    } catch (err) {
        console.error("Erro ao deletar usuário:", err);
        res.status(500).json({ error: "Erro interno ao deletar usuário." });
    }
});

//--- ROTAS DE AUTENTICAÇÃO ---

// Login
app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const emailLowerCase = email.toLowerCase();

        // Busca usuário pelo email
        const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
            emailLowerCase,
        ]);
        if (rows.length === 0)
            return res.status(401).json({ error: "Email ou senha inválidos." });

        const user = rows[0];

        // Compara senha informada com a armazenada
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword)
            return res.status(401).json({ error: "Email ou senha inválidos." });

        // Retorna o usuário logado (sem a senha)
        const { passwordHash, ...userResponse } = user;
        res.json(userResponse);
    } catch (err) {
        console.error("Erro no login:", err);
        res.status(500).json({ error: "Erro interno no login." });
    }
});


// Inicia servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});