function displayCatchUpRounds(catchUpGameData, gameForm)
{
    gameForm = document.getElementById(gameForm);

    // End execution if data is missing
    if (catchUpGameData.rounds.length === 0)
    {
        const missingText = document.createElement('p');
        missingText.textContent = 'No data available';
        gameForm.appendChild(missingText);
        return;
    }

    // Create table
    const table = document.createElement('table');    
    table.classList.add('custom-table');

    // Create header row
    const tableHeaders = ['Round', 'Catch Up Game'];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    tableHeaders.forEach(header => {
        const headerElement = document.createElement('th');
        headerElement.textContent = header;
        headerElement.classList.add('custom-cell');
        headerRow.appendChild(headerElement);
    });
    
    // Create rows for each round
    catchUpGameData.rounds.forEach(round => {
        // Create select menu options
        const selectOption = createSelectMenu(round);

        // Create row and add round label
        const row = table.insertRow();
        const labelCell = row.insertCell();
        labelCell.textContent = round.round;
        labelCell.classList.add('custom-cell');

        // Add select menu
        const selectCell = row.insertCell();
        selectCell.appendChild(selectOption);
        selectCell.classList.add('custom-cell');
    });

    // Append table to form
    gameForm.appendChild(table);
}

function createSelectMenu(roundData)
{
    // Create select element
    const select = document.createElement('select');
    select.name = `${roundData.round}`;
    select.required = true;

    // Create NONE option
    const defaultOption = document.createElement('option');
    defaultOption.value = 'null';
    defaultOption.textContent = 'No catch up';
    select.appendChild(defaultOption);

    // Create match options
    hasCatchUp = false;
    roundData.matches.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.gameID;
        optionElement.textContent = `${option.homeTeam} vs ${option.awayTeam}`;
        if (option.gameID === roundData.catchUpGameID)
        {
            optionElement.selected = true;
            hasCatchUp = true;
        }
        select.appendChild(optionElement);
    });

    if (!hasCatchUp)
    {
        defaultOption.selected = true;
    }

    return select;
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.displayCatchUpRounds = displayCatchUpRounds;