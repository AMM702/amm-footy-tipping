export function createGameTypeButtons(gameData)
{
    // Select button div
    const buttonDiv = document.getElementById('state-buttons');
    const compSelectionDiv = document.getElementById('comp-select-div')
    buttonDiv.innerHTML = '';

    // Select game data from sessionStorage
    // Extract keys from data
    const dataKeys = Object.keys(gameData);
    console.log(gameData);
    console.log(dataKeys);

    if (dataKeys.length > 1) // Only create the buttons if there is more than 1 comp
    {
        dataKeys.forEach(key => {
            const state = key.toUpperCase();
            createStateButtons(gameData[key], state, buttonDiv);
        });
    }
    else compSelectionDiv.innerHTML = '';

    // Default to first data type
    window.CustomLibrary.populateTippingDropdownMenuOptions(gameData[dataKeys[0]]);
}

function createStateButtons(data, state, div)
{
    const gameName = document.getElementById('tippingGameName');
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
        switch (state)
        {
            case 'QLD':
                gameName.textContent = 'NRL - QLD Comp';
                break;
            case 'NSW':
                gameName.textContent = 'NRL - NSW Comp';
                break;
            case 'VIC':
                gameName.textContent = 'AFL - VIC Comp';
                break;
            case 'WA':
                gameName.textContent = 'AFL - WA Comp';
                break;
            default:
                break;
        }
    })

    div.appendChild(button);
}

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.createGameTypeButtons = createGameTypeButtons;