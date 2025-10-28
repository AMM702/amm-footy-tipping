function populateTippingDropdownMenuOptions(gameData)
{
    const dropdownOptions = document.getElementById('tippingRoundListOptions');

    const slug = s => s.toLowerCase().trim().replace(/[\s\W]+/g, '-');

    // Clear existing items
    dropdownOptions.innerHTML = '';

    // Add options to menu
    for (const key in gameData)
    {
        if (gameData.hasOwnProperty(key)) 
        {
            const round = gameData[key];
            
            const a = document.createElement('a');
            a.href = '#';
            a.className = 'w-dropdown-link username_display';
            a.textContent = round.name;
            a.id = `${slug(round.name)}`;
            dropdownOptions.appendChild(a);
        }
    };
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.populateTippingDropdownMenuOptions = populateTippingDropdownMenuOptions;