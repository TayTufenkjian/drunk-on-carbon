document.addEventListener('DOMContentLoaded', function() {

    // Listen for the submission of the miles estimate form
    document.querySelector('#miles-estimate').onsubmit = () => {

        // Get the number of miles from the form
        let miles = document.querySelector('#miles').value;
        
        // Send the number of miles to Climatiq for estimation, via views.py
        fetch(`/estimate/${miles}`, {
            method: 'POST',
            headers: {'X-CSRFToken': csrftoken},
            mode: 'same-origin'
        })
        .then(response => response.json())
        .then(result => {
            // Print result
            console.log(result);

            // Update the page to display the co2e kg estimate
            const div = document.createElement('div');
            div.innerHTML = `${result.co2e} ${result.co2e_unit}`;
            document.querySelector('.container').append(div);
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