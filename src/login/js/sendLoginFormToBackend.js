function sendLoginFormToBackend()
{
    const form = document.getElementById('wf-form-Password');

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Send data to the backend
        console.table(data) // Output form data to console
    })
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.sendLoginFormToBackend = sendLoginFormToBackend;