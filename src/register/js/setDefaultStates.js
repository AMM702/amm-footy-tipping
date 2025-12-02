export function setDefaultStates()
{
    // Select NRL Radio Buttons
    const nrlButtons = [document.getElementById('QLD-register'), document.getElementById('NSW-register')];
    const aflButtons = [document.getElementById('VIC-register'), document.getElementById('WA-register')];
    
    // Select event divs
    nrlDiv = document.getElementById('nrl-comp-div');
    aflDiv = document.getElementById('afl-comp-div');
    
    // Add hidden input
    addRadioButtonListeners(nrlButtons, 'nrlComp', nrlDiv);
    addRadioButtonListeners(aflButtons, 'aflComp', aflDiv);
}

function addRadioButtonListeners(buttonsArray, groupName, div)
{
    // Create hidden input
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = groupName;
    hiddenInput.value = 'none';
    hiddenInput.id = `hidden_${groupName}`;
    div.appendChild(hiddenInput);

    // Add event listener
    buttonsArray.forEach(radio => {
        radio.addEventListener('click', () => {
            if (radio.previousChecked)
            {
                radio.checked = false;
                radio.previousChecked = false;
                hiddenInput.value = 'none';
            }
            else 
            {
                document.querySelectorAll(`input[name="${groupName}"]`).forEach(r => r.previousChecked = false)
                radio.previousChecked = true;
                hiddenInput.value = radio.value;
            }
        });
    });
}