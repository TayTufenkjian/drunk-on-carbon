document.addEventListener('DOMContentLoaded', function() {

    // If there is an estimate form on the page
    if (document.querySelector('.estimate-form') !== null)
    {
        // Hide description
        document.querySelector('#estimate-description').style.display = 'none';

        // Listen for the submission of the estimate forms
        document.querySelector('.estimate-form').onsubmit = () => {

            // Disable the submit button to prevent duplicate form submissions
            document.querySelector('.btn').disabled = true;

            // Clear any previous estimates
            document.querySelector('#estimates').innerHTML = '';

            // If using the simple form, use that input as the number of miles
            if (document.querySelector('#miles') !== null)
            {
                // Get the miles and display the relevant estimates
                miles = document.querySelector('#miles').value;
                show_estimates(miles);
                show_save_link(miles); // Display the link to save the estimate
                

            } else {
                // If using the advanced form, request the distance from Google Maps
                origin_city = document.querySelector('#origin_city').value;
                origin_state = document.querySelector('#origin_state').value;
                destination_city = document.querySelector('#destination_city').value;
                destination_state = document.querySelector('#destination_state').value;

                origin = `${origin_city}, ${origin_state}`;
                destination = `${destination_city}, ${destination_state}`;
                

                fetch(`/request_distance/${origin}&${destination}`, {
                    method: 'POST',
                    headers: {'X-CSRFToken': csrftoken},
                    mode: 'same-origin'
                })
                .then(response => response.json())
                .then(data => {

                    // Display origin and destination
                    show_from_to(data.origin_address, data.destination_address);

                    // Get the miles and display the relevant estimates
                    miles = data.miles;
                    show_estimates(miles);
                    show_save_link(`${miles}&${origin}&${destination}`); // Display the link to save the estimate
                })
            }
            
            // Stop form from actually submitting
            return false;
        }
    }

    // If there are saved estimates on the page
    if (document.querySelector('.saved-estimate') !== null)
    {
        // Hide description
        document.querySelector('#estimate-description').style.display = 'none';

        // Listen for a click on the saved estimates
        document.querySelectorAll('.saved-estimate').forEach(item => {
            item.addEventListener('click', event => {
                // Hide all the saved estimates
                document.querySelector('#saved-estimates').style.display = 'none';

                // Display the relevant estimate with wine bottles
                show_estimates(item.querySelector('#miles').value);

                // Display the link for all saved estimates
                show_saved_estimates_link();
            })
        })       
    }
});

function show_from_to(origin_address, destination_address) {
    from = document.createElement('div');
    from.innerHTML = `From: ${origin_address}`;

    to = document.createElement('div');
    to.innerHTML = `To: ${destination_address}`;

    from_to_div = document.querySelector('#from-to');

    from_to_div.append(from, to);
}


function show_estimates(miles) {

    // Send the number of miles to Climatiq for estimation, via views.py
    fetch(`/estimate/${miles}`)
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

        document.querySelector('#estimates').append(travel_modes, all_bottles);

        // Return the promise that the show links functions are waiting for
        return new Promise((resolve, reject)=>{resolve()});
    })
}


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

    // Create a div containing the kg estimate text
    let text = document.createElement('div');
    text.id = `${travel_mode}`;
    text.classList.add('col');
    text.innerHTML = `<h3>${travel_mode} - ${kg} kg</h3>`;

    // Return an object containing the estimate text and bottle images
    return {'text': text, 'bottles': bottles};
};


function show_save_link(params) {

    // Create and display the link to save an estimate
    save_estimate = document.createElement('a');
    save_estimate.innerHTML = 'Save this estimate';
    save_estimate.href = `/save_estimate/${params}`;
    document.querySelector('#options').append(save_estimate);

    // Re-enable the form submit button
    document.querySelector('.btn').disabled = false;
}


function show_saved_estimates_link() {

    // Create and display the link to see all the saved estimates
    all_estimates = document.createElement('a');
    all_estimates.innerHTML = 'All saved estimates';
    all_estimates.href = '/saved_estimates';
    document.querySelector('#options').append(all_estimates);
}


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