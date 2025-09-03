const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const SALT_ROUNDS = 10;

// "Banco" em memória
let users = [];

//--- ROTAS DE USUÁRIOS ---

// Criar usuário (POST /api/users)
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
    }

    const emailLowerCase = email.toLowerCase();
    const exists = users.some(u => u.email === emailLowerCase);
    if (exists) {
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = {
      id: uuidv4(),
      name,
      email: emailLowerCase,
      passwordHash,
      createdAt: new Date()
    };

    users.push(newUser);

    // Retorna apenas dados públicos do novo usuário
    const { passwordHash: _, ...publicUserData } = newUser;
    res.status(201).json(publicUserData);
  } catch (err) {
    console.error('Erro ao criar usuário:', err);
    res.status(500).json({ error: 'Erro interno ao criar usuário.' });
  }
});

// Listar todos os usuários (GET /api/users)
app.get('/api/users', (req, res) => {
  // Retorna apenas dados públicos, sem o hash da senha
  const usersWithoutPassword = users.map(user => {
    const { passwordHash, ...publicUserData } = user;
    return publicUserData;
  });
  res.json(usersWithoutPassword);
});

//--- ROTA DE LOGIN ---

// Login (POST /api/login)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailLowerCase = email.toLowerCase();
    const user = users.find(u => u.email === emailLowerCase);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Se o login for bem-sucedido, retorna a senha criptografada conforme solicitado
    // (Apenas para demonstração, na prática, essa abordagem não é recomendada)
    res.json({ 
        message: 'Login realizado com sucesso.', 
        userId: user.id,
        passwordHash: user.passwordHash // Retorno solicitado por você
    });

  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no login.' });
  }
});

//--- INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});