function populateScoreDropdownMenu(gameData, scoreForm, scoreLabel, scoreOptions)
{
    // Select existing DOM elements
    const formElement = document.getElementById(scoreForm);
    const roundLabel = document.getElementById(scoreLabel);
    const roundOptions = document.getElementById(scoreOptions);

    // Add options to menu
    gameData.rounds.forEach(round => {
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'w-dropdown-link username_display';
        a.textContent = `Round ${round.round}`;
        
        // Add event listener
        a.addEventListener('click', function(event)
            {
                event.preventDefault();

                // Change menu label
                roundLabel.textContent = `Round ${round.round}`;

                // Clear existing form elements
                formElement.innerHTML = '';

                // Display round data
                formElement.appendChild(displayScoreData(round));
            });
        roundOptions.appendChild(a);
    });
};

function displayScoreData(roundData)
{
    // Create table 
    const table = document.createElement('table');
    table.classList.add('custom-table');

    // Create header row 
    const tableHeaders = ['Date','Game','Result'];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    tableHeaders.forEach(header => {
        const headerElement = document.createElement('th');
        headerElement.textContent = header;
        headerElement.classList.add('custom-cell');
        headerRow.appendChild(headerElement);
    });

    // Display data
    roundData.matches.forEach(match => {
        const row = table.insertRow();

        // Date cell
        const dateCell = row.insertCell();
        dateCell.textContent = match.date;
        dateCell.classList.add('custom-cell');

        // Game cell
        const gameCell = row.insertCell();
        gameCell.textContent = `${match.homeTeam} vs ${match.awayTeam}`;
        gameCell.classList.add('custom-cell');

        // Result cell
        const gameResult = createSelectFormMenu(match);
        const resultCell = row.insertCell();
        resultCell.appendChild(gameResult);
        resultCell.classList.add('custom-cell');
    });

    return table;
};

function createSelectFormMenu(matchData)
{
    const select = document.createElement('select');
    select.name = `${matchData.gameID}`;
    select.required = true;

    // Create default option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'null';
    defaultOption.textContent = 'No result';
    select.appendChild(defaultOption);

    // Create home team winner options 
    const homeOption = document.createElement('option');
    homeOption.value = 1;
    homeOption.textContent = matchData.homeTeam;
    select.appendChild(homeOption);

    // Create away team winner options
    const awayOption = document.createElement('option');
    awayOption.value = 2;
    awayOption.textContent = matchData.awayTeam;
    select.appendChild(awayOption);

    // Auto select an option
    if (matchData.result === 1) // Home team
    {
        homeOption.selected = true;
    }
    else if (matchData.result === 2) // Away team
    {
        awayOption.selected = true;
    }
    else // No result
    {
        defaultOption.selected = true;
    };

    return select;
}