export function setDefaultStates()
{
    // Select radio buttons
    const nrlButton = document.getElementById('none-nrl');
    const aflButton = document.getElementById('none-afl');

    nrlButton.checked = true;
    aflButton.checked = true;
}