const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 3000;
const JWT_SECRET = 'supersecretjwtkey'; // Dovrebbe essere una variabile d'ambiente in produzione

app.use(express.json());

// Array per memorizzare temporaneamente gli utenti registrati
const users = [];

// Middleware di autenticazione
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // Nessun token

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token non valido
        req.user = user;
        next();
    });
};

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Endpoint di registrazione
app.post('/api/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Validazione di base
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Tutti i campi sono obbligatori.' });
    }

    // Controlla se l'utente esiste già
    if (users.find(user => user.email === email)) {
        return res.status(409).json({ message: 'L\'utente con questa email esiste già.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { id: users.length + 1, username, email, password: hashedPassword, role: 'user' }; // Aggiunto un ruolo di default
        users.push(newUser);

        console.log('Nuovo utente registrato:', newUser);
        res.status(201).json({ message: 'Registrazione avvenuta con successo!', user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role } });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante la registrazione.' });
    }
});

// Endpoint di login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email e password sono obbligatori.' });
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(401).json({ message: 'Credenziali non valide.' });
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenziali non valide.' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        console.log('Utente loggato:', user.email);
        res.status(200).json({ message: 'Login avvenuto con successo!', token });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante il login.' });
    }
});

// Endpoint protetto di esempio
app.get('/api/protected', authenticateToken, (req, res) => {
    res.json({ message: `Benvenuto ${req.user.email}! Questo è un contenuto protetto. Il tuo ruolo è: ${req.user.role}` });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});