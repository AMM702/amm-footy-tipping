function populateLeagueTable(roundData)
{
    // Define element ID constants
    
    const roundResultsDiv = document.getElementById('round-results-div');

    // Create table
    const table = document.createElement('table');
    table.classList.add('custom-table');

    // Create header row 
    const headerRow = table.insertRow();
    const headerUsername = headerRow.insertCell();
    headerUsername.textContent = 'Username';
    headerUsername.classList.add('custom-cell');

    const headerScore = headerRow.insertCell();
    headerScore.textContent = 'Score';
    headerScore.classList.add('custom-cell');

    // Insert data
    const data = roundData.scores;
    data.forEach(item => {
        const row = table.insertRow();
        row.classList.add('custom-row');

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