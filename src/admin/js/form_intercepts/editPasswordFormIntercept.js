export function editPasswordFormIntercept()
{
    const form = document.getElementById('edit-password-form');

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        formData.delete("cf-turnstile-response");
        const data = Object.fromEntries(formData.entries());

        console.log(data);
    })
}