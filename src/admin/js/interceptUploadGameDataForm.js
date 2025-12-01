export function interceptUploadGameDataForm()
{
    const uploadForm = document.getElementById('uploadGameDataForm');

    uploadForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData(uploadForm);
        formData.delete("cf-turnstile-response");
        const data = Object.fromEntries(formData.entries());

        console.log(data);
    })
}