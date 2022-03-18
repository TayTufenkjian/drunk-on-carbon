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
            // Print result
            console.log(estimates);

            // Update the page to display the co2e kg estimates
            estimates_div.innerHTML = `<div>Car: ${estimates.car} kg</div><div>Rail: ${estimates.rail} kg</div><div>Air: ${estimates.air} kg</div>`;
        })

        // Stop form from submitting
        return false;
    }
});


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