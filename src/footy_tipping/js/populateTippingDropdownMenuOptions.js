function populateTippingDropdownMenuOptions(gameData)
{
    const dropdownOptions = document.getElementById('tippingRoundListOptions');
    const dropdownLabel = document.getElementById('tippingRoundDisplayText');
    const dropdownMenu = document.getElementById('tippingRoundList');
    const tippingForm = document.getElementById('tipping-form');

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

                    // Close the menu
                    dropdownMenu.classList.remove('w--open');

                    // Update the dropdown menu label
                    dropdownLabel.textContent = round.name;

                    // Remove existing games
                    const tippingFormChildren = Array.from(tippingForm.children);
                    for (let i = 0; i < tippingFormChildren.length; i++)
                    {
                        const child = tippingFormChildren[i];

                        if (child.id !== 'tipping-form-submit')
                        {
                            child.remove();
                        }
                    };

                    // Create game elements
                    round.matches.forEach(g => window.CustomLibrary.createGameFormElements(g));
                }
            );
            dropdownOptions.appendChild(a);
        }
    };
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.populateTippingDropdownMenuOptions = populateTippingDropdownMenuOptions;