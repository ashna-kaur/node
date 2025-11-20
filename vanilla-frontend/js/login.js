// Logica JavaScript per la pagina di Login

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Impedisce il ricaricamento della pagina

            const email = loginForm.email.value;
            const password = loginForm.password.value;

            console.log('Login Tentativo:');
            console.log('Email:', email);
            console.log('Password:', password);

            // Invia i dati al backend
            fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Login avvenuto con successo!') {
                    alert(data.message);
                    // Reindirizza l'utente o aggiorna l'interfaccia utente
                    window.location.href = 'index.html'; // Esempio di reindirizzamento
                } else {
                    alert(data.message);
                }
            })
            .catch((error) => {
                console.error('Errore:', error);
                alert('Si è verificato un errore durante il login.');
            });
        });
    }
});