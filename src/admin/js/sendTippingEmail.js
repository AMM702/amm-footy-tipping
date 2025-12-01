export function sendTippingEmail()
{
    const form = document.getElementById('email-users-form')
    
    // Default to ALL recipients
    const defaultRadioButton = document.querySelector('input[name="Recipient"][value="All"]');
    if (defaultRadioButton) defaultRadioButton.checked = true;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        // Get email list
        const recipient = form.querySelector("input[name='Recipient']:checked")?.value;
        if (!recipient)
        {
            alert("Select a recipient");
            return
        }

        // Get data from backend
        data = ['user1@email.com','user2@email.com','user3@email.com']; // Example data. Replace with call to backend API

        bccList = data.join(",");

        const mailto = `mailto:?bcc=${bccList}`;
        window.open(mailto);
    });
}

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.sendTippingEmail = sendTippingEmail;