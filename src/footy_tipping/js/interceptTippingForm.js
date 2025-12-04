export function interceptTippingForm()
{
    const tippingFormID = document.getElementById('tipping-form');

    tippingFormID.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(tippingFormID);
        formData.delete("cf-turnstile-response");
        const data = Object.fromEntries(formData.entries());

        let jsonData = {
            comp: data.comp,
            games: {}
        }

        for (let key in data)
        {
            let value = data[key];
            if (key != 'comp')
            {
                jsonData.games[key] = value;
            }
        }

        console.table(data);
        console.log(data);
        console.log(jsonData)
    });
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.interceptTippingForm = interceptTippingForm;