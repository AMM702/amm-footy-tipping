function createGameFormElements(gameDetails) {
	// Extract variables 
	const homeTeamName = gameDetails.teams.home;
	const awayTeamName = gameDetails.teams.away;
	const gameNumber = gameDetails.gameNumber;
	const gameID = gameDetails.gameID;

	// Select the submit button div
	const tippingSubmitDiv = document.getElementById('tipping-submit-div');
	  
    // Select the tipping-form div
    const tippingFormDiv = document.getElementById('tipping-form');
    
    // Create a new div to hold the grid layout
    const gridDiv = document.createElement('div');
	gridDiv.id = `game-${gameDetails.gameID}`;
	gridDiv.classList.add('game-details-div');

	// Create hidden input 
	const hiddenInput = document.createElement('input');
	hiddenInput.type = 'hidden';
	hiddenInput.name = `${gameID}`;
	hiddenInput.value = 'none';
	hiddenInput.id = `hidden_${gameID}`;

    // Create the first radio button and label for Home Team 
	const homeTeamDiv = document.createElement('div');
	homeTeamDiv.style.display = 'flex';
	homeTeamDiv.style.justifySelf = 'start';
	  
    const homeTeamLabel = document.createElement('label');
	homeTeamLabel.className = 'gameTippingCursor';
	homeTeamLabel.style.paddingLeft = '5px';
	homeTeamLabel.style.paddingTop = '10px';
	  
    const homeTeamRadio = document.createElement('input');
    homeTeamRadio.type = 'radio';
    homeTeamRadio.name = `${gameID}`;
	homeTeamRadio.value = 'home';
    homeTeamRadio.id = `${homeTeamName}_${gameNumber}`; // Unique ID for the home team radio button
	homeTeamRadio.style.marginTop = '3px';
	  
    homeTeamLabel.setAttribute('for', `${homeTeamName}_${gameNumber}`); // Link label to radio button
	homeTeamLabel.textContent = homeTeamName;
	  
	homeTeamDiv.appendChild(homeTeamRadio);
	homeTeamDiv.appendChild(homeTeamLabel);

    // Create the text for the second column
    const matchInfo = document.createElement('span');
    matchInfo.textContent = `Game ${gameNumber} @ ${gameDetails.ground} (${gameDetails.time} ${gameDetails.date})`

	// Append the result of the game if it is available
	if (gameDetails.userTip === 1)
	{
		if (gameDetails.result === 1)
		{
			matchInfo.textContent += ' ✅';
		}
		else if (gameDetails.result === 2)
		{
			matchInfo.textContent += ' ❌';
		}
	}
	else if (gameDetails.userTip === 2)
	{
		if (gameDetails.result === 2)
		{
			matchInfo.textContent += ' ✅';
		}
		else if (gameDetails.result === 1)
		{
			matchInfo.textContent += ' ❌';
		}
	}

	// Style the text
	matchInfo.style.paddingTop = '3px';
	matchInfo.style.justifySelf = 'center';
	matchInfo.style.fontWeight = 'bold';

    // Create the second radio button and label for Away Team 
	const awayTeamDiv = document.createElement('div');
	awayTeamDiv.style.display = 'flex';
	awayTeamDiv.style.justifySelf = 'start';
    awayTeamDiv.style.marginLeft = '50px';
	  
    const awayTeamLabel = document.createElement('label');
	awayTeamLabel.className = 'gameTippingCursor';
	awayTeamLabel.style.paddingLeft = '5px';
	awayTeamLabel.style.paddingTop = '10px';
	  
    const awayTeamRadio = document.createElement('input');
    awayTeamRadio.type = 'radio';
    awayTeamRadio.name = `${gameID}`;
	awayTeamRadio.value = 'away';
    awayTeamRadio.id = `${awayTeamName}_${gameNumber}`; // Unique ID for the away team radio button
	awayTeamRadio.style.marginTop = '3px';
	  
    awayTeamLabel.setAttribute('for', `${awayTeamName}_${gameNumber}`); // Link label to radio button
	awayTeamLabel.textContent = awayTeamName;
	  
	awayTeamDiv.appendChild(awayTeamRadio);
	awayTeamDiv.appendChild(awayTeamLabel);

    // Append the content to the grid div
    gridDiv.appendChild(homeTeamDiv);
    gridDiv.appendChild(matchInfo);
    gridDiv.appendChild(awayTeamDiv);

    // Append the grid div to the tipping-form div
	if (tippingSubmitDiv)
	{
		tippingFormDiv.insertBefore(gridDiv, tippingSubmitDiv);
	}
	else 
	{
		tippingFormDiv.appendChild(gridDiv);
	}
	
	// Check if the user has already tipped a team
	if (gameDetails.userTip === 1) {
		homeTeamRadio.checked = true;
	}
	else if (gameDetails.userTip === 2) {
		awayTeamRadio.checked = true;
	}

	// Disable tipping for games where tipping is closed
	if (!gameDetails.isTippable)
	{
		homeTeamRadio.disabled = true; 
		awayTeamRadio.disabled = true;
	}

	[homeTeamRadio, awayTeamRadio].forEach(radio => {
		radio.addEventListener('click', () => {
			const hidden = document.getElementById(`hidden_${gameID}`);
			if (radio.previousChecked)
			{
				radio.checked = false;
				radio.previousChecked = false;
				hidden.value = "none";
			}
			else 
			{
				document.querySelectorAll(`input[name="${gameID}"]`).forEach(r => r.previousChecked = false);
				radio.previousChecked = true;
				hidden.value = radio.value;
			}
		});
	});
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.createGameFormElements = createGameFormElements;