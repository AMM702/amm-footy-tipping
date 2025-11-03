function adminDisplayUserDetails(userData)
{
    // Select table div and clear existing elements
    const usersDiv = document.getElementById('users-display-div');
    usersDiv.innerHTML = '';

    if (!userData)
    {
        const missingText = document.createElement('p');
        missingText.textContent = 'No data available';
        usersDiv.appendChild(missingText);
        return;
    }

    // Create table 
    const table = document.createElement('table');    

    // Create header row
    const tableHeaders = ['First Name', 'Surname', 'Email', 'Username'];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    tableHeaders.forEach(header => {
        const headerElement = document.createElement('th');
        headerElement.textContent = header;
        headerRow.appendChild(headerElement);
    });

    // Display data
    userData.forEach(user => {
        const row = table.insertRow();

        Object.keys(user).forEach(key => {
            if (key !== 'tippingID')
            {
                const cell = row.insertCell();
                cell.textContent = user[key];
            }
        });
    });

    // Append table to div
    usersDiv.appendChild(table);
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.adminDisplayUserDetails = adminDisplayUserDetails;