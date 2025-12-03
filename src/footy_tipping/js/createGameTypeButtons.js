import { populateTippingDropdownMenuOptions } from "./populateTippingDropdownMenuOptions";

export function createGameTypeButtons()
{
    // Select button div
    const buttonDiv = document.getElementById('comp-select-div');
    buttonDiv.innerHTML = '';

    // Select game data from sessionStorage
    const rawTippingData = sessionStorage.getItem("tippingData");

    if (!rawTippingData) return;

    const data = JSON.parse(rawTippingData);

    // Extract keys from data
    const dataKeys = Object.keys(data);

    dataKeys.forEach(key => {
        const state = key.toUpperCase();
        createStateButtons(data[key], state);
    });

    // Default to first data type
    populateTippingDropdownMenuOptions(data[0]);
}

function createStateButtons(data, state)
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
        populateTippingDropdownMenuOptions(data);
    })
}