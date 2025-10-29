function populateLeagueTable(roundData)
{
    // Define element ID constants
    
    const roundResultsDiv = document.getElementById('round-results-div');

    // Create table
    const table = document.createElement('table');
    table.classList.add('custom-table');

    // Create header row 
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    const headerUsername = document.createElement('th');
    headerUsername.textContent = 'Username';
    headerUsername.classList.add('custom-cell');
    headerRow.appendChild(headerUsername);

    const headerScore = document.createElement('th');
    headerScore.textContent = 'Score';
    headerScore.classList.add('custom-cell');
    headerRow.appendChild(headerScore);

    // Insert data
    roundData.forEach(item => {
        const row = table.insertRow();

        const usernameCell = row.insertCell();
        usernameCell.textContent = item.username;
        usernameCell.classList.add('custom-cell');

        const scoreCell = row.insertCell();
        scoreCell.textContent = item.score;
        scoreCell.classList.add('custom-cell');
    }
    );

    roundResultsDiv.appendChild(table);
}

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.populateLeagueTable = populateLeagueTable;