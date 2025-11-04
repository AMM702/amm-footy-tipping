function displayAddUserModal()
{
    var userModal = document.getElementById('new-user-modal');

    var span = document.getElementById('new-user-close');

    var btn = document.getElementById('add-new-user-btn');

    var newUserForm = document.getElementById('new-user-form');

    btn.onclick = function()
    {
        userModal.style.display = 'block';
    };

    span.onclick = function()
    {
        userModal.style.display = 'none';
    };

    window.onclick = function(event)
    {
        if (event.target === userModal)
        {
            userModal.style.display = 'none';
        }
    };
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.displayAddUserModal = displayAddUserModal;