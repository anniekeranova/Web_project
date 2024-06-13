
document.addEventListener('DOMContentLoaded', () => {
    const usernameElement = document.getElementById('username');

    fetch('php/home.php')
        .then(response => {
            if (response.status === 401) {
                window.location.href = 'index.html';
                return;
            }
            return response.text(); 
        })
        .then(username => {
            if (username) {
                usernameElement.textContent = username;
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
        });

    const logoutLink = document.querySelector('a[href="php/logout.php"]');
    logoutLink.addEventListener('click', (event) => {
        if (!confirm("Are you sure you want to logout?")) {
            event.preventDefault();
        }
    });
});

