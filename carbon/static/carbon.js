document.addEventListener('DOMContentLoaded', function() {

    // Hide description
    document.querySelector('#estimate-description').style.display = 'none';

    // Listen for the submission of the miles estimate form
    document.querySelector('#miles-estimate').onsubmit = () => {

        // Clear any previous estimates
        estimates_div = document.querySelector('#estimates');
        estimates_div.innerHTML = '';

        // Get the number of miles from the form
        let miles = document.querySelector('#miles').value;
        
        // Send the number of miles to Climatiq for estimation, via views.py
        fetch(`/estimate/${miles}`, {
            method: 'POST',
            headers: {'X-CSRFToken': csrftoken},
            mode: 'same-origin'
        })
        .then(response => response.json())
        .then(estimates => {

            // For each mode of travel, get the object containing kg estimate and wine bottle images
            car = wine_bottles("Car", estimates.car);
            rail = wine_bottles("Rail", estimates.rail);
            air = wine_bottles("Air", estimates.air);

            // Show description 
            document.querySelector('#estimate-description').style.display = 'block';

            // Update the page to display all estimates
            travel_modes = document.createElement('div');
            travel_modes.classList.add('travel-modes', 'row');
            travel_modes.append(car.text, rail.text, air.text);

            all_bottles = document.createElement('div');
            all_bottles.classList.add('all-bottles', 'row');
            all_bottles.append(car.bottles, rail.bottles, air.bottles);

            estimates_div.append(travel_modes, all_bottles);
        })

        // Stop form from submitting
        return false;
    }
});


function wine_bottles(travel_mode, kg) {

    // Create a div to hold the wine bottle images
    let bottles = document.createElement('div');
    bottles.classList.add('bottles', 'col');

    // Append the relevant number of wine bottle images
    for (let i = 0; i < kg; i++) {
        let wine_bottle = document.createElement('img');
        wine_bottle.src = 'static/images/wine-bottle.svg';
        bottles.append(wine_bottle);
    }

    // Create a parent div containing the kg estimate and the images
    let text = document.createElement('div');
    text.id = `${travel_mode}`;
    text.classList.add('col');
    text.innerHTML = `<h3>${travel_mode} - ${kg} kg</h3>`;

    // Return an object containing the estimate text and bottle images
    return {'text': text, 'bottles': bottles};
};


// Get the CSRF token
// Copied and pasted from the Django documentation https://docs.djangoproject.com/en/4.0/ref/csrf/
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie('csrftoken');