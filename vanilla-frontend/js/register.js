// Logica JavaScript per la pagina di Registrazione

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Impedisce il ricaricamento della pagina

            const username = registerForm.username.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;

            console.log('Registrazione Tentativo:');
            console.log('Username:', username);
            console.log('Email:', email);
            console.log('Password:', password);

            // Invia i dati al backend
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Registrazione avvenuta con successo!') {
                    alert(data.message);
                    // Reindirizza l'utente alla pagina di login dopo la registrazione
                    window.location.href = 'login.html'; // Esempio di reindirizzamento
                } else {
                    alert(data.message);
                }
            })
            .catch((error) => {
                console.error('Errore:', error);
                alert('Si è verificato un errore durante la registrazione.');
            });
        });
    }
});