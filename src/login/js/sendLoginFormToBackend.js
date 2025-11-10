function sendLoginFormToBackend()
{
    const form = document.getElementById('user-login-form');

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Send data to the backend
        console.table(data) // Output form data to console
    })
}