function sendLoginFormToBackend()
{
    const form = document.getElementById('wf-form-Password');

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Send data to the backend
        console.table(data) // DEBUG: Output form data to console
        const statusCode = 200
        const JWT = 'header.payload.signature'

        // Log the user in if successful response returned
        if (statusCode == 200)
        {
            sessionStorage.setItem("jwt", JWT);
            window.location.href = '/tipping';
        }
    })
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.sendLoginFormToBackend = sendLoginFormToBackend;