function populateUserDropdownOptions() 
{
    // Select dropdown menu elements
    const dropdownOptions = document.getElementById('users-dropdown-options');
    const dropdownLabel = document.getElementById('users-dropdown-text');

    // Define array of states
    const states = ['QLD','NSW','VIC','SA'];

    // Clear existing elements
    dropdownOptions.innerHTML = '';
    
    // Add options to the menu
    states.forEach(state => {
        // Create option
        const a = document.createElement('a');
        a.href = '#';
        a.className = 'w-dropdown-link username_display';
        a.textContent = state;
        a.id = state;

        // Add event listener
        a.addEventListener('click', function (event)
            {
                event.preventDefault();

                // Change menu label
                dropdownLabel.textContent = state;

                // Change displayed table
                // Add logic here
            });
        dropdownOptions.appendChild(a);
    });
};

window.CustomLibrary = window.CustomLibrary || {};
window.CustomLibrary.populateUserDropdownOptions = populateUserDropdownOptions;