document.addEventListener('DOMContentLoaded', function() {

    // If there is an estimate form on the page
    if (document.querySelector('.estimate-form') !== null)
    {
        // Listen for the submission of the estimate forms
        document.querySelector('.estimate-form').onsubmit = () => {

            // Disable the submit button to prevent duplicate form submissions
            document.querySelector('.btn').disabled = true;

            // Clear any previous estimates
            document.querySelector('#options').innerHTML = '';
            document.querySelector('#inputs').innerHTML = '';
            document.querySelector('#estimate-description').innerHTML = '';
            document.querySelector('#estimates').innerHTML = '';

            // Hide the form
            document.querySelector('.estimate-form').style.display = 'none';

            // If using the simple form, use that input as the number of miles
            if (document.querySelector('#miles') !== null)
            {
                // Get and display the miles used to calculate the estimates
                miles = document.querySelector('#miles').value;
                show_inputs(miles);
                
                // Display the relevant estimates
                show_estimates(miles);

                // If user is authenticated, display the save link
                if (document.querySelector('#user') !== null)
                {
                    show_save_link(miles);
                }

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

                    // Get miles 
                    miles = data.miles;

                    // Display the miles, origin, and destination used to calculate the estimates
                    show_inputs(miles, data.origin_address, data.destination_address);

                    // Display the relevant estimates and save link
                    show_estimates(miles);

                    // If user is authenticated, display the save link
                    if (document.querySelector('#user') !== null)
                    {
                        show_save_link(`${miles}&${origin}&${destination}`);
                    }
                })
            }
            
            // Stop form from actually submitting
            return false;
        }
    }

    // If there are saved estimates on the page
    if (document.querySelector('.saved-estimate') !== null)
    {
        saved_estimate = document.querySelector('.saved-estimate');

        // Hide description
        document.querySelector('#estimate-description').style.display = 'none';

        // Listen for a hover(mouseover) on the saved estimates
        document.querySelectorAll('.saved-estimate').forEach(item => {
            item.addEventListener('mouseover', event => {
                // Show the delete button for that saved estimate
                delete_button = item.querySelector('button');
                delete_button.style.display = 'block';

            })
            item.addEventListener('mouseout', event => {
                // Hide the delete button
                delete_button.style.display = 'none';
            })
        })

        // Listen for a click on the saved estimates
        document.querySelectorAll('.saved-estimate').forEach(item => {
            item.addEventListener('click', event => {

                // Find the target of the click event
                let target = event.target;

                // If the delete button was clicked, delete the saved estimate
                if (target.classList.contains('delete'))
                {
                    id = item.id;
                    fetch(`delete/${id}`)
                    .then(item.remove())
                    
                } else {  // Show the details for the saved estimate

                    // Hide all the saved estimates
                    document.querySelector('#saved-estimates').style.display = 'none';

                    // Display the relevant estimate with wine bottles
                    show_estimates(item.querySelector('#miles').value);

                    // Display the link for all saved estimates
                    show_saved_estimates_link();
                }
            })
        })       
    }
});

function show_inputs(miles, origin_address='', destination_address='') {

    // Select the div that will contain the inputs
    inputs_div = document.querySelector('#inputs');

    // Create and populate the miles header
    miles_header = document.createElement('h3');
    miles_header.innerHTML = `${miles} miles`;

    // Create and populate the "from" section
    from = document.createElement('div');
    from.innerHTML = `from: ${origin_address}`;

    // Create and populate the "to" section
    to = document.createElement('div');
    to.innerHTML = `to: ${destination_address}`;

    // Populate the inputs section depending on the inputs submitted
    if (origin_address == '')
    {
        inputs_div.append(miles_header);
    } else {
        inputs_div.append(miles_header, from, to);
    }
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
        document.querySelector('#estimate-description').innerHTML = 'CO2e emitted when traveling by...';

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
    save_estimate.classList = "btn btn-success";
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