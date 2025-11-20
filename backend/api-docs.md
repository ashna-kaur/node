# Documentazione API EventHub Backend

Questo documento descrive gli endpoint API REST disponibili per l'applicazione EventHub.

## Autenticazione

Le API protette richiedono un JSON Web Token (JWT) valido nell'header `Authorization` con il formato `Bearer <token>`.

---

## Endpoint: `/api/register`

Registra un nuovo utente nel sistema. Dopo la registrazione, verrà inviata un'email di verifica all'indirizzo fornito.

- **URL**: `/api/register`
- **Metodo**: `POST`
- **Corpo della Richiesta (JSON)**:
  ```json
  {
    "username": "string",
    "email": "string (formato email valido)",
    "password": "string (min. 6 caratteri raccomandato)"
  }
  ```
- **Risposte**:
  - `201 Created`: Registrazione avvenuta con successo. Controlla la tua email per verificare l'account.
    ```json
    {
      "message": "Registrazione avvenuta con successo! Controlla la tua email per verificare l'account.",
      "user": {
        "id": "number",
        "username": "string",
        "email": "string",
        "role": "string",
        "isVerified": "boolean"
      }
    }
    ```
  - `400 Bad Request`: Campi mancanti o formato email non valido.
    ```json
    {
      "message": "Tutti i campi sono obbligatori." o "Formato email non valido."
    }
    ```
  - `409 Conflict`: L'email è già registrata.
    ```json
    {
      "message": "L'utente con questa email esiste già."
    }
    ```
  - `500 Internal Server Error`: Errore del server.

---

## Endpoint: `/api/login`

Autentica un utente e restituisce un token JWT.

- **URL**: `/api/login`
- **Metodo**: `POST`
- **Corpo della Richiesta (JSON)**:
  ```json
  {
    "email": "string (formato email)",
    "password": "string"
  }
  ```
- **Risposte**:
  - `200 OK`: Login avvenuto con successo.
    ```json
    {
      "message": "Login avvenuto con successo!",
      "token": "string (JWT)"
    }
    ```
  - `400 Bad Request`: Campi mancanti.
    ```json
    {
      "message": "Email e password sono obbligatori."
    }
    ```
  - `401 Unauthorized`: Credenziali non valide o account non verificato.
    ```json
    {
      "message": "Credenziali non valide." o "Account non verificato. Controlla la tua email per il link di verifica."
    }
    ```
  - `500 Internal Server Error`: Errore del server.

---

## Endpoint: `/api/protected`

Un endpoint di esempio che richiede autenticazione.

- **URL**: `/api/protected`
- **Metodo**: `GET`
- **Header richiesto**: `Authorization: Bearer <token>`
- **Risposte**:
  - `200 OK`: Accesso consentito.
    ```json
    {
      "message": "Benvenuto <email_utente>! Questo è un contenuto protetto. Il tuo ruolo è: <ruolo_utente>"
    }
    ```
  - `401 Unauthorized`: Nessun token fornito.
  - `403 Forbidden`: Token non valido o scaduto.

---

## Endpoint: `/api/verify-email`

Verifica l'account di un utente utilizzando un token di verifica inviato via email.

- **URL**: `/api/verify-email?token=<verification_token>`
- **Metodo**: `GET`
- **Parametri della Query**:
  - `token`: `string` (Il token di verifica univoco ricevuto via email).
- **Risposte**:
  - `200 OK`: Account verificato con successo.
    ```json
    {
      "message": "Account verificato con successo! Ora puoi effettuare il login."
    }
    ```
  - `200 OK`: L'account è già stato verificato.
    ```json
    {
      "message": "Il tuo account è già stato verificato."
    }
    ```
  - `400 Bad Request`: Token di verifica mancante.
    ```json
    {
      "message": "Token di verifica mancante."
    }
    ```
  - `404 Not Found`: Token di verifica non valido o scaduto.
    ```json
    {
      "message": "Token di verifica non valido o scaduto."
    }
    ```

---

**Nota**: La gestione degli utenti è attualmente in memoria (`users` array in `server.js`) e non persistente. Per un'applicazione in produzione, sarebbe necessario un database.