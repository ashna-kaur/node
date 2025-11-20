# Documentazione API EventHub Backend

Questo documento descrive gli endpoint API REST disponibili per l'applicazione EventHub.

## Autenticazione

Le API protette richiedono un JSON Web Token (JWT) valido nell'header `Authorization` con il formato `Bearer <token>`.

---

## Endpoint: `/api/register`

Registra un nuovo utente nel sistema.

- **URL**: `/api/register`
- **Metodo**: `POST`
- **Corpo della Richiesta (JSON)**:
  ```json
  {
    "username": "string",
    "email": "string (formato email)",
    "password": "string (min. 6 caratteri raccomandato)"
  }
  ```
- **Risposte**:
  - `201 Created`: Registrazione avvenuta con successo.
    ```json
    {
      "message": "Registrazione avvenuta con successo!",
      "user": {
        "id": "number",
        "username": "string",
        "email": "string",
        "role": "string"
      }
    }
    ```
  - `400 Bad Request`: Campi mancanti.
    ```json
    {
      "message": "Tutti i campi sono obbligatori."
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
  - `401 Unauthorized`: Credenziali non valide.
    ```json
    {
      "message": "Credenziali non valide."
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

**Nota**: La gestione degli utenti è attualmente in memoria (`users` array in `server.js`) e non persistente. Per un'applicazione in produzione, sarebbe necessario un database.