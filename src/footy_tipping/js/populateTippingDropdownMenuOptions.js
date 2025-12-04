export function populateTippingDropdownMenuOptions(jsonData, state)
{
    if (!jsonData) throw Error("Game data was not defined.");

    // Select elements to modify
    const dropdownOptions = document.getElementById('tippingRoundListOptions');
    const dropdownLabel = document.getElementById('tippingRoundDisplayText');
    const tippingForm = document.getElementById('tipping-form');
    const leagueLabel = document.getElementById('league-table-heading');
   

    const slug = s => s.toLowerCase().trim().replace(/[\s\W]+/g, '-');

    // Clear existing items
    dropdownOptions.innerHTML = '';

    // Add options to menu
    jsonData.forEach(roundData => {
        const roundName = `Round ${roundData.round}`

        // Create drop down menu option
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'w-dropdown-link username_display';
        a.textContent = roundName;
        a.id = `${slug(roundName)}`;

        // Add event listener
        a.addEventListener('click', function (event)
            {
                event.preventDefault();

                // Add games to form
                populateGameData(roundData, tippingForm, dropdownLabel, leagueLabel, roundName, state)

                // Display round scores
                displayLeagueTable(roundData);
            });
        dropdownOptions.appendChild(a);
    });

    // Auto select a round
    let hasSwitch = false;
    for (let i = 0; i < jsonData.length; i++)
    {
        const roundData = jsonData[i];
        if (roundData.isRoundOn)
        {
            const name = `Round ${roundData.round}`
            populateGameData(roundData, tippingForm, dropdownLabel, leagueLabel, name, state);
            displayLeagueTable(roundData);
            hasSwitch = true;
            break;
        }
    };

    // Default to the first round if no round is switched on
    if (!hasSwitch)
    {
        populateGameData(jsonData[0], tippingForm, dropdownLabel, leagueLabel, `Round ${jsonData[0].round}`, state);
        displayLeagueTable(jsonData[0])
    }
};

function populateGameData(roundData, formID, labelID, leagueLabelID, roundName, state)
{
    // Update dropdown menu label
    labelID.textContent = roundName;

    // Update league label text
    leagueLabelID.textContent = `League Table (${roundName})`;

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

    // Create comp identifier input
    const compIdentity = document.createElement('input');
    compIdentity.type = 'hidden';
    compIdentity.name = 'comp';
    compIdentity.value = state;
    formID.appendChild(compIdentity);
};

function displayHomeAwayHeader()
{
    const gridParent = document.getElementById('tipping-form')
    const tippingSubmitDiv = document.getElementById('tipping-submit-div');

    // Create grid
    const gridDiv = document.createElement('div');
    gridDiv.classList.add('game-details-div');
    gridDiv.style.marginTop = '0px';

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
    awayLabel.style.marginLeft = '50px';

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