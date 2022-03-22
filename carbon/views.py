from email.message import EmailMessage
import json
import requests
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

import os
from dotenv import load_dotenv
load_dotenv()

# Get the Climatiq API key from the environment variables
CLIMATIQ_API_KEY= str(os.getenv("CLIMATIQ_API_KEY"))

# Set URL and headers for calls to the Climatiq API
api_url = "https://beta3.api.climatiq.io/estimate"
headers = {"Authorization": f"Bearer {CLIMATIQ_API_KEY}"}


def index(request):
    return render(request, "index.html")


def usa_simple(request):
    return render(request, "usa_simple.html")


def usa_advanced(request):
    return render(request, "usa_advanced.html")


def estimate(request, miles):

    # Get co2e estimates for each type of travel and store them in a dictionary
    estimates = {
        "car": estimate_car_travel(miles),
        "rail": estimate_rail_travel(miles),
        "air": estimate_air_travel(miles)
    }

    # Return the dictionary values as JSON
    return JsonResponse(estimates)


def estimate_car_travel(miles):
    # Request body    
    body = {
        "emission_factor": "passenger_vehicle-vehicle_type_car-fuel_source_na-engine_size_na-vehicle_age_na-vehicle_weight_na",
        "parameters": {
            "distance": miles,
            "distance_unit": "mi"
        }
    }

    return request_kg(body)


def estimate_rail_travel(miles):
    # Request body assumes one passenger    
    body = {
        "emission_factor": "passenger_train-route_type_intercity-fuel_source_na",
        "parameters": {
            "passengers": 1,
            "distance": miles,
            "distance_unit": "mi"
        }
    }

    return request_kg(body)


def estimate_air_travel(miles):

    # Length of the flight determines the emission factor
    if miles >= 2300:
        # Long-haul flight
        emission_factor = "passenger_flight-route_type_na-aircraft_type_na-distance_gt_2300mi-class_na-rf_na"
    
    elif miles >= 300 and miles < 2300:
        # Medium-haul flight
        emission_factor = "passenger_flight-route_type_na-aircraft_type_na-distance_gt_300mi_lt_2300mi-class_na-rf_na"
    
    else:
        # Short-haul flight
        emission_factor = "passenger_flight-route_type_na-aircraft_type_na-distance_lt_300mi-class_na-rf_na"

    # Request body assumes one passenger   
    body = {
        "emission_factor": emission_factor,
        "parameters": {
            "passengers": 1,
            "distance": miles,
            "distance_unit": "mi"
        }
    }

    return request_kg(body)


def request_kg(body):
    # Send the POST request to Climatiq and store the response object
    response = requests.post(api_url, json=body, headers=headers)

    # Convert the response object to a dictionary
    dict = response.json()

    # Return kg of co2e
    return dict["co2e"]