function populateLeaderboardDropdownOptions(leaderboardData)
{
    // Select dropdown menu elements
    const dropdownOptions = document.getElementById('leaderboard-dropdown-options');
    const dropdownLabel = document.getElementById('leaderboard-dropdown-text');

    // Define array of states
    const states = ['QLD','NSW','VIC','WA'];

    // Clear existing elements
    dropdownOptions.innerHTML = '';
    
    // Add options to the menu
    states.forEach(state => {
        // Create option
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'w-dropdown-link username_display';
        a.textContent = state;
        a.id = state;

        // Select data
        const stateData = leaderboardData[state];

        // Add event listener
        a.addEventListener('click', function (event)
            {
                event.preventDefault();

                // Change menu label
                dropdownLabel.textContent = state;

                // Change displayed table
                createLeaderboardTable(stateData);
            });
        dropdownOptions.appendChild(a);
    });

    // Default to QLD
    createLeaderboardTable(leaderboardData['QLD']);
};

function createLeaderboardTable(stateData)
{
    const leaderboardDiv = document.getElementById('leaderboard-table-div');

    if (stateData.users.length === 0)
    {
        const label = document.createElement('p');
        label.textContent = 'No data available';
        leaderboardDiv.appendChild(label);
        return;
    }

    // Create table
    const table = document.createElement('table');
    table.classList.add('custom-table');

    // Create header row 
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    const tipperHeader = document.createElement('th');
    tipperHeader.textContent = 'Tipper';
    tipperHeader.classList.add('custom-cell');
    tipperHeader.appendChild(headerElement);

    for (let i = 0; i < stateData.totalRounds; i++)
    {
        const headerElement = document.createElement('th');
        headerElement.textContent = `${i++}`;
        headerElement.classList.add('custom-cell');
        headerRow.appendChild(headerElement);
    };

    const totalScoreHeader = document.createElement('th');
    totalScoreHeader.textContent = 'Total Score';
    totalScoreHeader.classList.add('custom-cell');
    headerRow.appendChild(totalScoreHeader);

    // Display user data
    stateData.users.forEach(user => {
        const row = table.insertRow();

        // Username cell
        const userCell = row.insertCell();
        userCell.textContent = user.userName;
        userCell.classList.add('custom-cell');

        // Round scores
        user.scores.forEach(score => {
            const roundCell = row.insertCell();
            if (score === 0)
            {
                roundCell.textContent = '-';
            }
            else 
            {
                roundCell.textContent = score;
            }
            roundCell.classList.add('custom-cell');
        });

        // Total Score
        const totalCell = row.insertCell();
        totalCell.textContent = user.total;
        totalCell.classList.add('custom-cell');
    });

    leaderboardDiv.appendChild(table);
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.populateLeaderboardDropdownOptions = populateLeaderboardDropdownOptions;