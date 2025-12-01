export function interceptTippingForm()
{
    const tippingFormID = document.getElementById('tipping-form-block');

    tippingFormID.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new formData(tippingFormID);
        const data = Object.fromEntries(formData.entries());

        console.table(data);
    });
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.interceptTippingForm = interceptTippingForm;