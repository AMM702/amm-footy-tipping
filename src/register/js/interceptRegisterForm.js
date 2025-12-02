export function interceptRegisterForm()
{
    const form = document.getElementById('wf-form-register-user');

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        formData.delete("cf-turnstile-response");
        const data = Object.fromEntries(formData.entries());

        if (data.aflComp == "None" && data.nrlComp == "None")
        {
            alert("You must select a competition.");
            throw new Error("No competition was selected.");
        }

        console.log(data);
    });
}