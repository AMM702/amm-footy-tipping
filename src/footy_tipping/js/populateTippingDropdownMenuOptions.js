function populateTippingDropdownMenuOptions(gameData)
{
    // Select elements to modify
    const dropdownOptions = document.getElementById('tippingRoundListOptions');
    const dropdownLabel = document.getElementById('tippingRoundDisplayText');
    const dropdownMenu = document.getElementById('tippingRoundList');
    const tippingForm = document.getElementById('tipping-form');
    const leagueLabel = document.getElementById('league-table-heading');
   

    const slug = s => s.toLowerCase().trim().replace(/[\s\W]+/g, '-');

    // Clear existing items
    dropdownOptions.innerHTML = '';

    // Add options to menu
    for (const key in gameData)
    {
        if (gameData.hasOwnProperty(key)) 
        {
            const round = gameData[key];
            
            // Create drop down menu option
            // Create drop down menu option
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'w-dropdown-link username_display';
            a.textContent = round.name;
            a.id = `${slug(round.name)}`;

            // Add event listener
            a.addEventListener('click', function (event)
                {
                    event.preventDefault();

                    // Add games to form
                    populateGameData(round, tippingForm, dropdownLabel, leagueLabel);

                    // Display round scores
                    displayLeagueTable(round);
                }
            );
            dropdownOptions.appendChild(a);
        }
    };

    // Auto select a round
    let hasSwitch = false;
    for (const key in gameData)
    {
        if (gameData.hasOwnProperty(key))
        {
            const round = gameData[key];
            if (round.isRoundOn)
            {
                populateGameData(round, tippingForm, dropdownLabel, leagueLabel);
                displayLeagueTable(round);
                hasSwitch = true;
                break;
            }
        }
    };

    // Default to the first round if no round is switched on
    if (!hasSwitch)
    {
        const keys = Object.keys(gameData);
        const round = gameData[keys[0]];

        populateGameData(round, tippingForm, dropdownLabel);
        displayLeagueTable(round);
    }
};

function populateGameData(roundData, formID, labelID, leagueLabelID)
{
    // Update dropdown menu label
    labelID.textContent = roundData.name;

    // Update league label text
    leagueLabelID.textContent = `League Table (${roundData.name})`;

    // Remove existing games
    const tippingFormChildren = Array.from(formID.children);
    for (let i = 0; i < tippingFormChildren.length; i++)
    {
        const child = tippingFormChildren[i]
        if (child.id !== 'tipping-submit-div' && child.id !== 'tipping-submit-button')
        {
            child.remove();
        }
    };

    // Create game elements
    displayHomeAwayHeader();
    roundData.matches.forEach(g => window.CustomLibrary.createGameFormElements(g));
};

function displayHomeAwayHeader()
{
    const gridParent = document.getElementById('tipping-form')
    const tippingSubmitDiv = document.getElementById('tipping-submit-div');

    // Create grid
    const gridDiv = document.createElement('div');
    gridDiv.classList.add('game-details-div');

    // Create Home label
    const homeLabel = document.createElement('span');
    homeLabel.textContent = 'Home Team';
    homeLabel.classList.add('game-details-text-header');
    homeLabel.style.justifySelf = 'start';

    // Create Game Label
    const gameLabel = document.createElement('span');
    gameLabel.textContent = 'Game Details';
    gameLabel.classList.add('game-details-text-header');
    gameLabel.style.justifySelf = 'center';

    // Create Away Label
    const awayLabel = document.createElement('span');
    awayLabel.textContent = 'Away Team';
    awayLabel.classList.add('game-details-text-header');
    awayLabel.style.justifySelf = 'start';

    // Add labels to grid
    gridDiv.appendChild(homeLabel);
    gridDiv.appendChild(gameLabel);
    gridDiv.appendChild(awayLabel);

    // Add grid to main form
    if (gridParent)
	{
		gridParent.insertBefore(gridDiv, tippingSubmitDiv);
	}
	else 
	{
		gridParent.appendChild(gridDiv);
	}
}

function displayLeagueTable(roundData)
{
    const hiddenScoreText = document.getElementById('league-table-hidden-score-text');
    const roundResultsDiv = document.getElementById('round-results-div');

    // Display round scores
    const userScores = roundData.scores;
    if (!(userScores.length == 0))
    {
        hiddenScoreText.innerHTML = '';
        roundResultsDiv.innerHTML = '';
        window.CustomLibrary.populateLeagueTable(userScores);
    }
    else if (roundResultsDiv !== '')
    {
        roundResultsDiv.innerHTML = '';
    }
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.populateTippingDropdownMenuOptions = populateTippingDropdownMenuOptions;