(function() {

    const form = document.getElementById('login-form');
    
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const data = {
                username,
                password
            };

            fetch('php/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(res => res.json())
            .then(response => {
                if (response.status === 'SUCCESS') {
                    window.location.href = 'home.html';
                } else {
                    console.error('Login failed:', response.message);
                    alert(response.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred while processing your request.');
            });
        });
    } else {
        console.error('Form element not found.');
    }
    
    })();