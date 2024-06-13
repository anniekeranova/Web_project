// Ensure DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("JavaScript is loaded and working!");

    // Example of adding a click event listener to nav links (for future enhancements)
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            console.log(`Navigating to ${event.target.href}`);
        });
    });
});
