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

            // Qui si potrebbe aggiungere la logica per inviare i dati al backend
            alert('Login tentato con Email: ' + email);
        });
    }
});