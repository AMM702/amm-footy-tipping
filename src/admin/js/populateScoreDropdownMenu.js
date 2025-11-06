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

                // Display round data
                displayScoreData(round);
            });
        roundOptions.appendChild(a);
    });
};

function displayScoreData(roundData)
{

}