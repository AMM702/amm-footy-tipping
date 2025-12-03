export function createGameTypeButtons(gameData)
{
    // Select button div
    const buttonDiv = document.getElementById('comp-select-div');
    buttonDiv.innerHTML = '';

    // Select game data from sessionStorage
    // Extract keys from data
    const dataKeys = Object.keys(gameData);
    console.log(gameData);
    console.log(dataKeys);

    dataKeys.forEach(key => {
        const state = key.toUpperCase();
        createStateButtons(gameData[key], state, buttonDiv);
    });

    // Default to first data type
    window.CustomLibrary.populateTippingDropdownMenuOptions(gameData[dataKeys[0]]);
}

function createStateButtons(data, state, div)
{
    if (!data) return;

    const button = document.createElement('button');
    button.textContent = state;
    button.classList.add('state-button');

    // Change the colour of the button depending on the state
    switch (state)
    {
        case 'QLD':
            button.classList.add('qld-button');
            break;
        case 'NSW':
            button.classList.add('nsw-button');
            break;
        case 'VIC':
            button.classList.add('vic-button');
            break;
        case 'WA':
            button.classList.add('wa-button');
            break;
        default:
            button.classList.add('unknown-state');
            break;
    };

    // Add event listener to load the game data
    button.addEventListener('click', () => {
        window.CustomLibrary.populateTippingDropdownMenuOptions(data);
    })

    div.appendChild(button);
}

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.createGameTypeButtons = createGameTypeButtons;