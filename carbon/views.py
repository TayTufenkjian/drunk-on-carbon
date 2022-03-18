import json
import requests
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

import os
from dotenv import load_dotenv
load_dotenv()

# Get the Climatiq API key from the environment variables
CLIMATIQ_API_KEY= str(os.getenv("CLIMATIQ_API_KEY"))


def index(request):
    return render(request, "index.html")


def estimate(request, miles):
    api_url = "https://beta3.api.climatiq.io/estimate"
    headers = {
            "Authorization": f"Bearer {CLIMATIQ_API_KEY}"
    }

    # Request body for car travel      
    body = {
            "emission_factor": "passenger_vehicle-vehicle_type_car-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na",
            "parameters":
                {
                "distance": miles,
                "distance_unit": "mi"
                }
    }
    
    # Send the POST request to Climatiq and store the response object
    response = requests.post(api_url, json=body, headers=headers)

    # Return the text of the response (which is already JSON encoded)
    return HttpResponse(response.text)
