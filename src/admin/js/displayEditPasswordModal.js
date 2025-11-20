export function displayEditPasswordModal(btn)
{
    var passwordModal = document.getElementById('edit-password-modal');

    var span = document.getElementById('edit-password-close');

    btn.onclick = function()
    {
        var userID = this.getAttribute("data-value");

        document.getElementById('hiddenValue').value = userID;

        var passwordField = document.getElementById('edit-password-field');
        passwordField.value = '';

        passwordModal.style.display = 'block';
    };

    span.onclick = function()
    {
        passwordModal.style.display = 'none';
    }

    window.onclick = function(event)
    {
        if (event.target === passwordModal)
        {
            passwordModal.style.display = 'none';
        }
    }
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.displayEditPasswordModal = displayEditPasswordModal;