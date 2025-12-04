export function interceptTippingForm()
{
    const tippingFormID = document.getElementById('tipping-form');

    tippingFormID.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(tippingFormID);
        formData.delete("cf-turnstile-response");
        const data = Object.fromEntries(formData.entries());

        console.table(data);
        console.log(data);
    });
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.interceptTippingForm = interceptTippingForm;