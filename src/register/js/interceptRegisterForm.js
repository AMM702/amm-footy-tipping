export function interceptRegisterForm()
{
    const form = document.getElementById('wf-form-register-user');

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        console.log(data);
    });
}