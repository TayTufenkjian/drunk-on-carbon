document.addEventListener('DOMContentLoaded', function() {

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

            // For each mode of travel, create a div containing kg estimate and wine bottle images
            car_div = wine_bottles("Car", estimates.car);
            rail_div = wine_bottles("Rail", estimates.rail);
            air_div = wine_bottles("Air", estimates.air);

            // Update the page to display all estimates
            estimates_div.append(car_div, rail_div, air_div);
        })

        // Stop form from submitting
        return false;
    }
});


function wine_bottles(travel_mode, kg) {

    // Create a div to hold the wine bottle images
    bottles = document.createElement('div');
    bottles.classList.add('bottles');

    // Append the relevant number of wine bottle images
    for (let i = 0; i < kg; i++) {
        wine_bottle = document.createElement('img');
        wine_bottle.src = 'static/images/wine-bottle.svg';
        bottles.append(wine_bottle);
    }

    // Create a parent div containing the kg estimate and the images
    div = document.createElement('div');
    div.id = `${travel_mode}`;
    div.innerHTML = `<div class="text">${kg} kg of greenhouse gases emitted traveling by ${travel_mode}</div>`;
    div.append(bottles);

    return div;
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