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

            // Send registration data to the backend
            fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Registration failed');
                }
                return response.json();
            })
            .then(data => {
                alert('Registration successful!');
                // Optionally redirect or clear form
                registerForm.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Registration failed. Please try again.');
            });
            
            alert('Registrazione tentata con Username: ' + username + ', Email: ' + email);
        });
    }
});