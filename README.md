# Drunk on Carbon

## Description
Drunk on Carbon is a project that visualizes carbon dioxide equivalents as bottles of wine.

Why wine bottles? Carbon dioxide equivalents (CO<sub>2</sub>e) are typically measured in kilograms, and one bottle of wine weighs about one kilogram.

### My goals for this project
* Visualize some of the impacts of climate change, which often seems too big to comprehend.
* Practice building a web app with Django and Javascript.
* Learn how to integrate with multiple APIs.
* Build a final project for the course [CS50's Web Programming with Python and JavaScript.](https://www.edx.org/course/cs50s-web-programming-with-python-and-javascript)

I used Django and Javascript because that was a requirement for the final project. Additionally, Python and Javascript are the two languages I'm most familiar with.

To keep the scope manageable, I limited the project to estimate CO<sub>2</sub>e for travel in the United States by car, rail, and air. There are many more activities and regions for which you could estimate CO<sub>2</sub>e.

### What can you do with this app?
* Get CO<sub>2</sub>e estimates for different travel methods for trips in the United States
* Create a user account
* Save estimates
* Delete saved estimates

<hr>

## Demo
This application is deployed on Heroku: 

https://drunk-on-carbon.herokuapp.com/

<hr>

## Technologies
The requirements.txt file has the complete list of packages and libraries, but here are the highlights:

* Python 3.9.10 
* Django 4.0.3
* JavaScript (vanilla, no frameworks)
* JavaScript Fetch API
* Bootstrap 5.1.3

Some requirements are specifically for deploying on Heroku:
* Gunicorn 20.1.0 (web server for Python)
* Psycopg2-binary 2.9.3 (PostgreSQL driver for Python)
* Whitenoise 6.0.0 (serves Django static files in production)

<hr>

## Set up and run the application
First, install the required packages listed in the requirements.txt file.
<br>Using pip, you can do this in the terminal by running:

<code>pip install -r requirements.txt</code>

You'll also need to create a .env file in the project directory (at the same level as the manage.py file).
<br>The .env file should contain values for the Django secret key as well as two API keys.
<br>These values are sensitive (which is why they're in an environment file that is not on GitHub), so don't share them.

Example of the .env file contents:

<code>

DEV_SECRET_KEY = 'yourDjangoSecretKey123goeshere'

CLIMATIQ_API_KEY = 'yourClimatiqAPIKey456goeshere'

GOOGLE_MAPS_API_KEY = 'yourGoogleMapsAPIKey789goeshere'

</code>

The DEV_SECRET_KEY is the secret key Django uses to provide cryptographic signing.
<br>It should be set to a unique, unpredictable value.
<br>To generate a secret key, you can enter the following in your terminal:

<code>

python
<br>>>> from django.core.management import utils
<br>>>> print(utils.get_random_secret_key())

</code>

For the CLIMATIQ_API_KEY and the GOOGLE_MAPS_API_KEY, see the links to the documentation in the Third-Party APIs section below.

After obtaining your keys and configuring your .env file, you can run the application locally with:

<code>python manage.py runserver</code>

<hr>

## Third-Party APIs
The app uses three third-party APIs:
* [Climatiq API](https://www.climatiq.io/docs)
* [Google Maps Places API](https://developers.google.com/maps/documentation/places/web-service)
* [Google Maps Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix)

To set up your own version of the app, you would need one API key from Climatiq and one API key from Google Maps (the same key works for both Google Maps APIs). The documentation at the links above has instructions for how to obtain these keys.

<hr>

## How the app uses those APIs to calculate estimates
Climatiq allows us to access a database of up-to-date and scientifically vetted emission factors.

We use Climatiq to get emission factors such as the kg of CO<sub>2</sub>e generated when one person travels one mile by car in the United States.

The user can enter either a number of miles OR an origin and destination.

If the user enters a number of miles, we multiply that number of miles by the emission factor provided by Climatiq. Then we display the number of wine bottles to make that estimate more visual.

If the user enters an origin and destination, then we need to calculate the number of miles before we can estimate the CO<sub>2</sub>e and display those wine bottles.

That's where the Google Maps APIs come in.

We pass the origin and destination submitted by the user to the Places API, which returns unique Google Place IDs that match those user submissions.

Then we pass those Place IDs to the Distance Matrix API, which returns the number of meters between the two places. We convert the meters to miles. Then we can calculate the CO<sub>2</sub>e estimates based on the emission factors provided by Climatiq.

<hr>

## File Contents

### carbon/views.py
This file contains all the Python functions required to:
* load each web page 
* generate CO<sub>2</sub>e estimates by accepting user input, calling third-party APIs, parsing the API responses, running the calculation, and returning the results as JSON
* create a user account, log in, log out, and change password
* save estimates and delete saved estimates

### carbon/urls.py
This file contains the URL patterns that call the views and that allow JavaScript to interact with the Python functions via the Fetch API.

### carbon/models.py
This file contains two models: User and SavedEstimate. The approach here was to store as little data as possible. Submitting an estimate can be handled entirely programatically by calling the third-party APIs; only when the user wants to save an estimate do we need to store any data.

### carbon/static/carbon.js
This file handles AJAX requests and the behavior of page elements in the browser. None of the HTML forms are ever actually submitted. When the form submit button is clicked, the click triggers AJAX requests via the Fetch API that call Python functions to calculate the estimate and update the page content. The display of the estimates for different travel modes and the corresponding wine bottles are dynamically generated without reloading the page.

### carbon/static/styles.css
Most of the styles come from Bootstrap. This file overrides some of those styles as needed. It also contains some simple animation for smoother page loads.

### drunk_on_carbon/settings/base.py
Instead of having one settings file for the entire project, there are several settings files that allow for different environment configurations. This base file stores the settings that are common to development and production. The dev and prod settings files import this base file and build upon it.

### drunk_on_carbon/settings/dev.py
This file imports the base settings and adds additional settings that apply only to the development environment.

### drunk_on_carbon/settings/prod.py
This file imports the base settings and adds additional settings that apply only to the production environment.

<hr>

## Distinctiveness and Complexity
(This section only applies to the CS50 web programming course.)

This project satifies the distinctiveness and complexity requirements in three ways:
1. **The concept bears no resemblance to the earlier course projects.** This project is decidedly NOT a wiki, ecommerce, email, or social network application. The only similarity really is that it allows the user to create an account, log in, and save certain elements; however, this type of general functionality is found in most web apps.
2. **The project uses multiple third-party APIs.** Integrating those web services involved obtaining API keys, scouring the documentation about each web service, and working with Postman to troubleshoot API calls.
3. **The project is [deployed on Heroku](https://drunk-on-carbon.herokuapp.com/).** To the surprise of absolutely no one, getting the application to work on my local was one thing; getting it to work on a live production server was another. This involved configuring different settings for different environments, installing additional packages just for the Heroku configuration, and figuring out how to serve static files in production (which is not something Django handles out of the box, interestingly enough). Hopefully this makes the grading process easier though! :blush: