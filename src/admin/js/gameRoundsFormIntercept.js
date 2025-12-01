export function gameRoundsFormIntercept()
{
    // Select round forms
    const nrlRoundForm = document.getElementById('nrl-catchup-form-div');
    const aflRoundForm = document.getElementById('afl-catchup-form-div');

    // Intercept form submissions
    interceptRoundForm(nrlRoundForm);
    interceptRoundForm(aflRoundForm);
}

function interceptRoundForm(formObj)
{
    formObj.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(formObj);
        formData.delete("cf-turnstile-response");
        const data = Object.fromEntries(formData.entries());

        console.log(data);
    })
};