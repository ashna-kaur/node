
# EventHub API

Welcome to the EventHub API documentation! This project provides a RESTful API for managing events, including user authentication and notification handling.

## Installation

To set up the project locally, follow these steps:

1.  Clone the repository:
    ```bash
    git clone <REPOSITORY_URL>
    cd EventHub
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory of the project and configure the following environment variables:
    ```
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/eventhub 
    JWT_SECRET=f1056f6484c2f79b9344e66033a43973363ad60c266da3aad0fb4576a84b1af8 
    ```
    *Replace placeholders with your actual values.*

### Google OAuth Configuration

To enable Google login, you need to obtain `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` from the Google Cloud Console. Follow these steps:

1.  **Go to Google Cloud Console:** Visit [console.cloud.google.com](https://console.cloud.google.com/) and log in with your Google account.
2.  **Create a new project** (if you don't have one).
3.  **Enable Google People API:** Navigate to "APIs & Services" > "Library", search for "Google People API", and enable it.
4.  **Configure OAuth Consent Screen:**
    *   Go to "APIs & Services" > "OAuth consent screen".
    *   Choose "External" for User Type.
    *   Fill in the required application information (e.g., Application name: "EventHub", User support email, Developer contact information).
    *   Save and continue.
5.  **Create OAuth Client ID:**
    *   Go to "APIs & Services" > "Credentials".
    *   Click "Create Credentials" and select "OAuth client ID".
    *   Choose "Web application" as the Application type.
    *   Give it a name (e.g., "EventHub Web Client").
    *   **Authorized JavaScript origins:** Add `http://localhost:3000`
    *   **Authorized redirect URIs:** Add `http://localhost:3000/api/auth/google/callback`
    *   Click "Create".
6.  **Copy Credentials:** Google will provide you with your `Client ID` and `Client Secret`. Copy these values.
7.  **Update `.env` file:** Paste the copied `Client ID` and `Client Secret` into your `.env` file for `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` respectively.
8.  **Restart the server** to load the new environment variables.


## Project Structure

```
EventHub/
├── config/
│   ├── passport.js
│   └── swagger.js
├── controllers/
│   ├── authController.js
│   ├── eventController.js
│   └── notificationController.js
├── middleware/
│   └── authMiddleware.js
├── models/
│   ├── Event.js
│   ├── Notification.js
│   └── User.js
├── routes/
│   ├── auth.js
│   ├── events.js
│   └── notifications.js
├── utils/
│   ├── email.js
│   └── socket.js
├── .env
├── README..md
├── package-lock.json
├── package.json
└── server.js
```

## Starting the Server

To start the server, run the following command:

```bash
node server.js
```

The server will be available at `http://localhost:3000`

## API Endpoints

Below are the available endpoints in the EventHub API.

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint                               | Description                                    | Access   |
| :----- | :------------------------------------- | :--------------------------------------------- | :------- |
| `POST` | `/api/auth/register`                   | Register a new user                            | Public   |
| `POST` | `/api/auth/login`                      | Authenticate user and get token                | Public   |
| `GET`  | `/api/auth/google`                     | Initiate Google authentication process         | Public   |
| `GET`  | `/api/auth/google/callback`            | Callback for Google authentication             | Public   |
| `GET`  | `/api/auth/verify-email/:token`        | Verify user email                              | Public   |

### Event Endpoints (`/api/events`)

| Method | Endpoint                               | Description                                    | Access   |
| :----- | :------------------------------------- | :--------------------------------------------- | :-------- |
| `POST` | `/api/events`                          | Create a new event                             | Private  |
| `GET`  | `/api/events`                          | Get all public events with optional filters    | Public   |
| `GET`  | `/api/events/dashboard`                | Get user's created and attending events        | Private  |
| `PUT`  | `/api/events/:id`                      | Update a specific event                        | Private  |
| `DELETE` | `/api/events/:id`                    | Delete a specific event                        | Private  |
| `PUT`  | `/api/events/register/:id`             | Register for an event                          | Private  |
| `PUT`  | `/api/events/unregister/:id`           | Unregister from an event                       | Private  |

### Other Endpoints

| Method | Endpoint      | Description                                | Access   |
| :----- | :------------ | :----------------------------------------- | :------- |
| `GET`  | `/`           | Welcome page of the API                    | Public   |
| `GET`  | `/api-docs`   | Swagger UI for API documentation           | Public   |