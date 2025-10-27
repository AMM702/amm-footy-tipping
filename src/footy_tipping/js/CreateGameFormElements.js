function createGameFormElements(gameDetails) {
	// Extract variables 
	const homeTeamName = gameDetails.teams.home;
	const awayTeamName = gameDetails.teams.away;
	const gameNumber = gameDetails.gameNumber;	  
	  
    // Select the email-form div
    const emailFormDiv = document.getElementById('email-form');
    
    // Create a new div to hold the grid layout
    const gridDiv = document.createElement('div');
	gridDiv.id = `game-${gameDetails.gameID}`;

    // Apply grid layout styles to the new div
    gridDiv.style.display = 'grid';
    gridDiv.style.gridTemplateColumns = '200px 500px 200px'; 
    gridDiv.style.gap = '16px'; 
    gridDiv.style.alignItems = 'center'; 
    gridDiv.style.justifyItems = 'center'; 
	gridDiv.style.marginTop = '10px';

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
    homeTeamRadio.name = `${gameNumber}`;
	homeTeamRadio.value = 'home'
    homeTeamRadio.id = `${homeTeamName}_${gameNumber}`; // Unique ID for the home team radio button
	homeTeamRadio.style.marginTop = '3px';
	  
    homeTeamLabel.setAttribute('for', `${homeTeamName}_${gameNumber}`); // Link label to radio button
	homeTeamLabel.textContent = homeTeamName;
	  
	homeTeamDiv.appendChild(homeTeamRadio);
	homeTeamDiv.appendChild(homeTeamLabel);

    // Create the text for the second column
    const matchInfo = document.createElement('span');
    matchInfo.textContent = `Game ${gameNumber} @ ${gameDetails.ground} (${gameDetails.time} ${gameDetails.date})`
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
    awayTeamRadio.name = `${gameNumber}`;
	awayTeamRadio.value = 'away'
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

    // Append the grid div to the email-form div
    emailFormDiv.appendChild(gridDiv);
	
	// Check team if tip exists
	if (gameDetails.userTip === 1) {
		homeTeamRadio.checked = true;
	}
	else if (gameDetails.userTip === 2) {
		awayTeamRadio.checked = true;
	}
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.createGameFormElements = createGameFormElements;