export function adminDisplayUserDetails(userData)
{
    // Select table div and clear existing elements
    const usersDiv = document.getElementById('users-display-div');
    usersDiv.innerHTML = '';

    if (userData.length === 0)
    {
        const missingText = document.createElement('p');
        missingText.textContent = 'No data available';
        usersDiv.appendChild(missingText);
        return;
    }

    // Create table 
    const table = document.createElement('table');    
    table.classList.add('custom-table');

    // Create header row
    const tableHeaders = ['First Name', 'Surname', 'Email', 'Username', 'Actions'];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    tableHeaders.forEach(header => {
        const headerElement = document.createElement('th');
        headerElement.textContent = header;
        headerElement.classList.add('custom-cell');
        headerRow.appendChild(headerElement);
    });

    // Display data
    userData.forEach(user => {
        const row = table.insertRow();

        Object.keys(user).forEach(key => {
            if (key !== 'userID')
            {
                const cell = row.insertCell();
                cell.textContent = user[key];
                cell.classList.add('custom-cell')
            }
        });

        // Create action cell
        const actionCell = row.insertCell();
        actionCell.classList.add('custom-cell');

        // Edit Password button - Logic not added yet
        const editPasswordButton = document.createElement('button');
        editPasswordButton.textContent = 'Edit Password';
        editPasswordButton.setAttribute("data-value", `${user["userID"]}`);
        editPasswordButton.classList.add('user-button');
        displayEditPasswordModal(editPasswordButton);
        actionCell.appendChild(editPasswordButton);

        // Login as User button - Logic not added yet
        const loginAsUserButton = document.createElement('button');
        loginAsUserButton.textContent = 'Login as User';
        loginAsUserButton.setAttribute("data-value", `${user["userID"]}`);
        loginAsUserButton.classList.add('user-button');
        addLoginAsUserButtonListener(loginAsUserButton);
        actionCell.appendChild(loginAsUserButton);

        // Delete button - Logic not added yet
        const deleteUserButton = document.createElement('button');
        deleteUserButton.textContent = 'Delete User';
        deleteUserButton.classList.add('user-button');
        deleteUserButton.classList.add('delete-button');
        addDeleteButtonListener(deleteUserButton, user['userID'], user['userName']);
        actionCell.appendChild(deleteUserButton);
    });

    // Append table to div
    usersDiv.appendChild(table);
};

function addLoginAsUserButtonListener(btn)
{
    btn.addEventListener("click", function() {
        alert('Logging in as user')
    });
}

function deleteUser(userID, userName)
{
    let hasApproved = confirm(`Are you sure you want to delete the user ${userName}?`);
    if (hasApproved)
    {
        alert('User deleted.');
    }
}

function addDeleteButtonListener(btn, userID, userName)
{
    btn.addEventListener("click", function() {
        deleteUser(userID, userName);
    });
}

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.adminDisplayUserDetails = adminDisplayUserDetails;