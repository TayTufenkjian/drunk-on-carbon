document.addEventListener('DOMContentLoaded', function() {

    // If there is an estimate form on the page
    if (document.querySelector('.estimate-form') !== null)
    {
        // Select the estimate form 
        let estimate_form = document.querySelector('.estimate-form');

        // Listen for the submission of the estimate forms
        estimate_form.onsubmit = () => {

            // Disable the submit button to prevent duplicate form submissions
            document.querySelector('.btn').disabled = true;

            // Clear any previous estimates
            document.querySelector('#options').innerHTML = '';
            document.querySelector('#inputs').innerHTML = '';
            document.querySelector('#estimate-description').innerHTML = '';
            document.querySelector('#estimates').innerHTML = '';

            // Hide the form
            estimate_form.style.display = 'none';

            // Show loading spinner
            document.querySelector('#loading').style.display = 'block';

            // If using the simple form, use that input as the number of miles
            if (document.querySelector('#miles') !== null)
            {
                // Get and display the miles used to calculate the estimates
                let miles = document.querySelector('#miles').value;
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
                let origin_city = document.querySelector('#origin_city').value;
                let origin_state = document.querySelector('#origin_state').value;
                let destination_city = document.querySelector('#destination_city').value;
                let destination_state = document.querySelector('#destination_state').value;

                let origin = `${origin_city}, ${origin_state}`;
                let destination = `${destination_city}, ${destination_state}`;
                

                fetch(`/request_distance/${origin}&${destination}`, {
                    method: 'POST',
                    headers: {'X-CSRFToken': csrftoken},
                    mode: 'same-origin'
                })
                .then(response => response.json())
                .then(data => {

                    // If there was an error, log the error and display the error message
                    if (data.error) {
                        console.log(data.error);

                        let message = document.createElement('div');
                        message.classList = ('mb-4');
                        message.innerHTML = data.message;

                        let action = document.createElement('button');
                        action.classList = ('btn btn-primary');
                        action.innerHTML = 'Try again';
                        action.onclick = (function() {window.location.reload()});

                        document.querySelector('#estimates').append(message, action);     
                        
                        // Hide loading spinner
                        document.querySelector('#loading').style.display = 'none';

                    } else {
                        // Get miles and formatted addresses
                        let miles = data.miles;
                        let origin_formatted = data.origin_address;
                        let destination_formatted = data.destination_address;

                        // Display the miles, origin, and destination used to calculate the estimates
                        show_inputs(miles, origin_formatted, destination_formatted);

                        // Display the relevant estimates and save link
                        show_estimates(miles);

                        // If user is authenticated, display the save link
                        if (document.querySelector('#user') !== null)
                        {
                            show_save_link(`${miles}&${origin}&${destination}&${origin_formatted}&${destination_formatted}`);
                        }
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
        // Select all saved estimates
        let saved_estimates = document.querySelectorAll('.saved-estimate');

        // Listen for a hover(mouseover) on the saved estimates if user is not on a mobile device
        saved_estimates.forEach(item => {

            if (!is_mobile()) {
                let delete_button = item.querySelector('button');
                item.addEventListener('mouseover', event => {
                    // Show the delete button for that saved estimate       
                    delete_button.style.display = 'block';

                })
                item.addEventListener('mouseout', event => {
                    // Hide the delete button
                    delete_button.style.display = 'none';
                })
            }
        });

        // Listen for a click on the saved estimates
        saved_estimates.forEach(item => {
            item.addEventListener('click', event => {

                // Find the target of the click event
                let target = event.target;

                // If the delete button was clicked, delete the saved estimate
                if (target.classList.contains('delete'))
                {
                    let id = item.id;
                    fetch(`delete/${id}`)
                    .then(item.remove())
                    
                } else {  // Show the details for the saved estimate

                    // Hide all the saved estimates
                    saved_estimates = document.querySelector('#saved-estimates');
                    saved_estimates.style.display = 'none';

                    // Show loading spinner
                    document.querySelector('#loading').style.display = 'block';

                    // Get saved estimate data
                    let id = item.id;
                    fetch(`load/${id}`)
                    .then(response => response.json())
                    .then(saved_estimate => {

                        // Display the miles, origin, and destination used to calculate the saved estimate
                        show_inputs(saved_estimate.miles, saved_estimate.origin_formatted, saved_estimate.destination_formatted);

                        // Display the relevant estimate with wine bottles
                        show_estimates(saved_estimate.miles);

                        // Display the delete button
                        let delete_button = document.querySelector('#options .delete');
                        delete_button.style.display = 'block';

                        // Listen for a click on the delete button
                        delete_button.addEventListener('click', event => {
                            
                            fetch(`delete/${id}`)  // Delete the saved estimate
                            .then(() => {
                                window.location.reload();  // Then reload the saved estimates page
                            })  
                            
                        })
                    })
                }
            })
        })       
    }
});


function show_inputs(miles, origin_address='', destination_address='') {

    // Select the div that will contain the inputs
    let inputs_div = document.querySelector('#inputs'); 

    // Create and populate the miles header
    let miles_header = document.createElement('h3');
    miles_header.innerHTML = `${miles} miles`;

    // Create and populate the "from" section
    let from = document.createElement('div');
    from.innerHTML = `from: ${origin_address}`;

    // Create and populate the "to" section
    let to = document.createElement('div');
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
        let car = wine_bottles('Car', estimates.car);
        let rail = wine_bottles('Rail', estimates.rail);
        let air = wine_bottles('Air', estimates.air);

        // Show description 
        let description = document.createElement('h4');
        description.innerHTML = 'CO<sub>2</sub>e emitted when traveling by...';
        document.querySelector('#estimate-description').append(description);

        // Update the page to display all estimates
        let travel_modes = document.createElement('div');
        travel_modes.classList.add('travel-modes', 'row');
        travel_modes.append(car.text, rail.text, air.text);

        let all_bottles = document.createElement('div');
        all_bottles.classList.add('all-bottles', 'row');
        all_bottles.append(car.bottles, rail.bottles, air.bottles);

        document.querySelector('#estimates').append(travel_modes, all_bottles);

        // Hide loading spinner
        document.querySelector('#loading').style.display = 'none';
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
    text.innerHTML = `<h4>${travel_mode} - ${kg} kg</h4>`;

    // Return an object containing the estimate text and bottle images
    return {'text': text, 'bottles': bottles};
};


function show_save_link(params) {

    // Create and display the link to save an estimate
    let save_estimate = document.createElement('a');
    save_estimate.classList = 'btn btn-success';
    save_estimate.innerHTML = 'Save this estimate';
    save_estimate.href = `/save_estimate/${params}`;
    document.querySelector('#options').append(save_estimate);

    // Re-enable the form submit button
    document.querySelector('.btn').disabled = false;
}


function is_mobile() {
    return navigator.userAgent.toLowerCase().match(/mobile/i)
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