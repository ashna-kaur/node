const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

// Configurazione Nodemailer per Ethereal (solo per sviluppo/test)
let transporter;

nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }

    console.log('Credentials for Ethereal: %s', account.user);
    console.log('Password for Ethereal: %s', account.pass);

    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });

    console.log('Transporter ready. Preview URL: %s', nodemailer.getTestMessageUrl(account));
});

// Funzione per inviare l'email di verifica
const sendVerificationEmail = async (userEmail, verificationToken) => {
    if (!transporter) {
        console.error('Nodemailer transporter not initialized.');
        return;
    }

    const verificationLink = `http://localhost:${PORT}/api/verify-email?token=${verificationToken}`;

    const mailOptions = {
        from: '"EventHub" <no-reply@eventhub.com>',
        to: userEmail,
        subject: 'Verifica il tuo account EventHub',
        html: `<p>Grazie per esserti registrato a EventHub! Clicca sul link qui sotto per verificare il tuo account:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Email di verifica inviata: %s', info.messageId);
        console.log('URL di anteprima: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Errore durante l\'invio dell\'email di verifica:', error);
    }
};

const PORT = 3000;
 const app = express();
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


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Formato email non valido.' });
    }

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
        const verificationToken = uuidv4();
        const newUser = { id: users.length + 1, username, email, password: hashedPassword, role: 'user', verificationToken, isVerified: false }; // Aggiunto un ruolo di default, token di verifica e stato di verifica
        users.push(newUser);

        // Invia l'email di verifica
        await sendVerificationEmail(newUser.email, newUser.verificationToken);

        console.log('Nuovo utente registrato:', newUser);
        res.status(201).json({ message: 'Registrazione avvenuta con successo! Controlla la tua email per verificare l\'account.', user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role, isVerified: newUser.isVerified } });
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

    if (!user.isVerified) {
        return res.status(401).json({ message: 'Account non verificato. Controlla la tua email per il link di verifica.' });
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

app.get('/api/verify-email', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Token di verifica mancante.' });
    }

    const user = users.find(u => u.verificationToken === token);

    if (!user) {
        return res.status(404).json({ message: 'Token di verifica non valido o scaduto.' });
    }

    if (user.isVerified) {
        return res.status(200).json({ message: 'Il tuo account è già stato verificato.' });
    }

    user.isVerified = true;
    user.verificationToken = null; // Rimuovi il token dopo l'uso per sicurezza

    console.log('Utente verificato:', user.email);
    res.status(200).json({ message: 'Account verificato con successo! Ora puoi effettuare il login.' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});