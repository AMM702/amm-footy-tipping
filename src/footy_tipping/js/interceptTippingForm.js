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
            if (!data.hasOwnProperty(key)) continue;

            let value = data[key];

            if (key != 'comp')
            {
                jsonData.games[key] = value;
            }
        }

        // Convert jsonData into a string that can be sent to the backend
        const jsonString = JSON.stringify(jsonData);

        console.log(jsonData);
        console.log(jsonString);
        
    });
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.interceptTippingForm = interceptTippingForm;