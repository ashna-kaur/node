# EventHub API - Documentazione Completa

EventHub è una piattaforma completa per la gestione di eventi che permette agli utenti di creare, gestire e partecipare a eventi, con funzionalità di chat in tempo reale e notifiche.

## 🚀 Funzionalità

### Utenti
- ✅ Registrazione con verifica email
- ✅ Login con JWT
- ✅ Autenticazione Google OAuth 2.0
- ✅ Recupero password via email
- ✅ Gestione profilo utente

### Eventi
- ✅ Creazione e modifica eventi
- ✅ Upload immagini eventi (Cloudinary o storage locale)
- ✅ Iscrizione/Disiscrizione a eventi
- ✅ Filtri per categoria, data e luogo
- ✅ Paginazione risultati
- ✅ Ricerca testuale

### Chat e Notifiche
- ✅ Chat in tempo reale per ogni evento (Socket.IO)
- ✅ Notifiche push in tempo reale
- ✅ Email di conferma iscrizione
- ✅ Notifiche agli organizzatori

### Amministrazione
- ✅ Pannello admin completo
- ✅ Gestione utenti (blocco/sblocco)
- ✅ Moderazione eventi (approvazione/rifiuto)
- ✅ Sistema di segnalazioni
- ✅ Dashboard con statistiche

### Sicurezza
- ✅ Rate limiting su tutte le API
- ✅ Helmet per headers sicuri
- ✅ Validazione input
- ✅ CORS configurato
- ✅ Hashing password con bcrypt

## 📋 Requisiti

- Node.js >= 16.x
- MongoDB >= 5.x (o MongoDB Atlas)
- npm o yarn

## 🛠️ Installazione

### 1. Clona il repository
```bash
git clone <REPOSITORY_URL>
cd EventHub
```

### 2. Installa le dipendenze
```bash
npm install
```

### 3. Configura le variabili d'ambiente
Copia il file `.env.example` in `.env` e configura le tue variabili:

```bash
cp .env.example .env
```

Modifica `.env` con i tuoi valori:
```env
# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Database
MONGO_URI=mongodb://localhost:27017/eventhub

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Google OAuth (opzionale)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (Gmail esempio)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@eventhub.com

# Cloudinary (opzionale)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Crea le cartelle necessarie
```bash
mkdir -p uploads/events
```

### 5. Avvia il server
```bash
# Sviluppo
npm run dev

# Produzione
npm start
```

Il server sarà disponibile su `http://localhost:5000`

## 📚 API Endpoints

### Autenticazione

| Metodo | Endpoint | Descrizione | Accesso |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Registrazione nuovo utente | Pubblico |
| POST | `/api/auth/login` | Login utente | Pubblico |
| GET | `/api/auth/google` | Login con Google | Pubblico |
| GET | `/api/auth/verify-email/:token` | Verifica email | Pubblico |
| POST | `/api/auth/forgot-password` | Richiesta reset password | Pubblico |
| POST | `/api/auth/reset-password/:token` | Reset password | Pubblico |

### Eventi

| Metodo | Endpoint | Descrizione | Accesso |
|--------|----------|-------------|---------|
| POST | `/api/events` | Crea nuovo evento | Privato |
| GET | `/api/events` | Lista eventi pubblici | Pubblico |
| GET | `/api/events/:id` | Dettaglio evento | Pubblico |
| GET | `/api/events/dashboard` | Eventi utente | Privato |
| PUT | `/api/events/:id` | Modifica evento | Privato |
| DELETE | `/api/events/:id` | Elimina evento | Privato |
| PUT | `/api/events/register/:id` | Iscriviti a evento | Privato |
| PUT | `/api/events/unregister/:id` | Disiscrivi da evento | Privato |

### Chat

| Metodo | Endpoint | Descrizione | Accesso |
|--------|----------|-------------|---------|
| GET | `/api/events/:eventId/messages` | Messaggi evento | Privato |
| POST | `/api/events/:eventId/messages` | Invia messaggio | Privato |
| PUT | `/api/events/:eventId/messages/read` | Segna come letti | Privato |

### Notifiche

| Metodo | Endpoint | Descrizione | Accesso |
|--------|----------|-------------|---------|
| GET | `/api/notifications` | Lista notifiche | Privato |
| PUT | `/api/notifications/:id/read` | Segna come letta | Privato |

### Segnalazioni

| Metodo | Endpoint | Descrizione | Accesso |
|--------|----------|-------------|---------|
| POST | `/api/reports` | Crea segnalazione | Privato |
| GET | `/api/reports/my-reports` | Mie segnalazioni | Privato |
| GET | `/api/reports` | Tutte le segnalazioni | Admin |
| PUT | `/api/reports/:id` | Aggiorna segnalazione | Admin |
| DELETE | `/api/reports/:id` | Elimina segnalazione | Admin |

### Amministrazione

| Metodo | Endpoint | Descrizione | Accesso |
|--------|----------|-------------|---------|
| GET | `/api/admin/users` | Lista utenti | Admin |
| PUT | `/api/admin/users/:id/block` | Blocca/Sblocca utente | Admin |
| GET | `/api/admin/events` | Tutti gli eventi | Admin |
| PUT | `/api/admin/events/:id/approve` | Approva evento | Admin |
| PUT | `/api/admin/events/:id/reject` | Rifiuta evento | Admin |
| DELETE | `/api/admin/events/:id` | Elimina evento | Admin |
| GET | `/api/admin/stats` | Statistiche dashboard | Admin |

## 🔐 Autenticazione

L'API utilizza JWT (JSON Web Tokens) per l'autenticazione. Dopo il login, includi il token nell'header delle richieste:

```
x-auth-token: your_jwt_token_here
```

## 📸 Upload Immagini

### Opzione 1: Cloudinary (Consigliato)
Configura le variabili Cloudinary nel `.env` e le immagini saranno caricate automaticamente sul cloud.

### Opzione 2: Storage Locale
Le immagini saranno salvate nella cartella `uploads/events/`. Assicurati che la cartella abbia i permessi corretti.

## 📧 Configurazione Email

### Gmail
1. Abilita "App meno sicure" o usa una password per app
2. Configura nel `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Altri Provider
Adatta le configurazioni SMTP nel `.env`.

## 🧪 Testing

```bash
# Esegui tutti i test
npm test

# Test con coverage
npm run test:ci
```

## 🚀 Deployment

### Render
1. Crea un nuovo Web Service su Render
2. Collega il repository GitHub
3. Configura le variabili d'ambiente
4. Deploy automatico ad ogni push

### Heroku
```bash
heroku create eventhub-api
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### Railway
1. Collega il repository
2. Configura variabili d'ambiente
3. Deploy automatico

## 📁 Struttura Progetto

```
EventHub/
├── config/
│   ├── cloudinary.js
│   ├── passport.js
│   └── swagger.js
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── chatController.js
│   ├── eventController.js
│   ├── notificationController.js
│   └── reportController.js
├── middleware/
│   ├── adminMiddleware.js
│   ├── authMiddleware.js
│   ├── rateLimiter.js
│   ├── uploadMiddleware.js
│   └── validateInput.js
├── models/
│   ├── Event.js
│   ├── Message.js
│   ├── Notification.js
│   ├── Report.js
│   └── User.js
├── routes/
│   ├── admin.js
│   ├── auth.js
│   ├── events.js
│   ├── notifications.js
│   └── reports.js
├── tests/
│   └── auth.test.js
├── uploads/
│   └── events/
├── utils/
│   ├── email.js
│   └── socket.js
├── .env.example
├── .gitignore
├── package.json
├── Procfile
├── render.yaml
├── README.md
└── server.js
```

## 🔧 Tecnologie Utilizzate

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Autenticazione**: JWT, Passport.js, Google OAuth
- **Real-time**: Socket.IO
- **Upload**: Multer, Cloudinary
- **Email**: Nodemailer
- **Sicurezza**: Helmet, express-rate-limit, bcryptjs
- **Documentazione**: Swagger/OpenAPI
- **Testing**: Jest, Supertest

## 🐛 Troubleshooting

### Problema: "Cannot connect to MongoDB"
**Soluzione**: Verifica che MongoDB sia in esecuzione e che `MONGO_URI` sia corretto.

### Problema: "Email not sending"
**Soluzione**: Verifica le credenziali email nel `.env` e controlla che l'account permetta app di terze parti.

### Problema: "File upload failed"
**Soluzione**: Verifica i permessi della cartella `uploads/` o configura correttamente Cloudinary.

### Problema: "Socket.IO not connecting"
**Soluzione**: Verifica che il CORS sia configurato correttamente e che il client usi il giusto URL.

## 📝 TODO Future Features

- [ ] Integrazione calendario (Google Calendar, iCal)
- [ ] Sistema di pagamento per eventi a pagamento
- [ ] Mappa interattiva per eventi
- [ ] Sistema di recensioni eventi
- [ ] Notifiche push mobile (FCM)
- [ ] Export eventi in PDF
- [ ] Multi-lingua (i18n)

## 🤝 Contributing

Le pull request sono benvenute! Per modifiche importanti, apri prima un issue per discutere cosa vorresti cambiare.

## 📄 Licenza

ISC

## 👨‍💻 Autore

Ashna Kaur - [GitHub](https://github.com/ashna-kaur)

## 🙏 Ringraziamenti

- Anthropic per il supporto nello sviluppo
- Community Node.js
- Tutti i contributori

---

Per maggiori informazioni, consulta la documentazione API su `/api-docs` dopo il deploy.