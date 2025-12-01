export function interceptScoreForms()
{
    // Select forms
    const nrlForm = document.getElementById('nrl-score-form-div');
    const aflForm = document.getElementById('afl-score-form-div');

    addScoreEventListeners(nrlForm);
    addScoreEventListeners(aflForm);
}

function addScoreEventListeners(formObj)
{
    formObj.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(formObj);
        formData.delete("cf-turnstile-response");
        const data = Object.fromEntries(formData.entries());

        console.log(data);
    })
}