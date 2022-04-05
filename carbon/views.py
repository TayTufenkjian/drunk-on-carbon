import json
import math
import requests
import urllib.parse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.urls import reverse
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render

from .models import SavedEstimate, User

import os
from dotenv import load_dotenv
load_dotenv()

# Get the API keys from the environment variables
CLIMATIQ_API_KEY= str(os.getenv("CLIMATIQ_API_KEY"))
GOOGLE_MAPS_API_KEY = str(os.getenv("GOOGLE_MAPS_API_KEY"))


def index(request):
    return render(request, "index.html")

def usa_simple(request):
    return render(request, "usa_simple.html")

def usa_advanced(request):
    return render(request, "usa_advanced.html")


def create_account(request):

    # If request is POST, create the user account
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "create_account.html", {
                "message": "Passwords must match. Please check your password and confirmation password, then try again."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "create_account.html", {
                "message": "This username is not available. Please enter a different username and try again."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))

    # If request is GET, load the page for creating a user account
    else:
        return render(request, "create_account.html")


def login_view(request):
    
    # If request is POST, log the user in
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "login.html", {
                "message": "Invalid username and/or password."
            })

    # If the request is GET, load the login page
    else:
        return render(request, "login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


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

    # Set URL and headers
    url = "https://beta3.api.climatiq.io/estimate"
    headers = {"Authorization": f"Bearer {CLIMATIQ_API_KEY}"}

    # Send the POST request to Climatiq and store the response object
    response = requests.post(url, json=body, headers=headers)

    # Convert the response object to a dictionary
    dict = response.json()

    # Return kg of co2e, rounded up to the nearest integer
    return math.ceil(dict["co2e"])


def request_distance(request, origin, destination):
   
    # Get the Place ID for the origin
    origin_encoded = urllib.parse.quote(origin)
    origin_dict = request_place(origin_encoded)
    
    # Return an error message if there are no results for the origin
    try:
        origin_id = origin_dict["candidates"][0]["place_id"]
    except IndexError:
        data = {
            "error": "IndexError",
            "message": "We could not find that origin. Please try again."
        } 
        return JsonResponse(data)

    # Get the Place ID for the destination
    destination_encoded = urllib.parse.quote(destination)
    destination_dict = request_place(destination_encoded)

    # Return an error message if there are no results for the destination
    try:
        destination_id = destination_dict["candidates"][0]["place_id"]
    except IndexError:
        data = {
            "error": "IndexError",
            "message": "We could not find that destination. Please try again."
        } 
        return JsonResponse(data)

    # Pass the origin and destination Place IDs to the Distance Matrix API to get the number of miles
    url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins=place_id:{origin_id}&destinations=place_id:{destination_id}&units=imperial&key={GOOGLE_MAPS_API_KEY}"
    payload={}
    headers = {}
    response = requests.request("GET", url, headers=headers, data=payload)

    # Convert the response object to a dictionary
    dict = response.json()

    # Get the distance from the dict, convert to miles, round up 
    # Google's distance value is in meters
    meters = dict["rows"][0]["elements"][0]["distance"]["value"]
    miles = math.ceil(meters / 1609.344)

    # Get the address of the origin and destination for display
    origin_address = origin_dict["candidates"][0]["formatted_address"]
    destination_address = destination_dict["candidates"][0]["formatted_address"]

    # Return the number of miles -- along with the origin and destination addresses -- as JSON
    data = {
        "destination_address": destination_address,
        "miles": miles,
        "origin_address": origin_address
    }
    return JsonResponse(data)


def request_place(input_encoded):
    url = f"https://maps.googleapis.com/maps/api/place/findplacefromtext/json?fields=formatted_address,name,place_id,type&input={input_encoded}&inputtype=textquery&key={GOOGLE_MAPS_API_KEY}"
    payload={}
    headers = {}
    response = requests.request("GET", url, headers=headers, data=payload)

    # Convert the response object to a dictionary containing all the place info
    dict = response.json()

    # Return the dict
    return(dict)


@login_required
def save_estimate(request, miles, origin='', destination='', origin_formatted='', destination_formatted=''):
    
    # Save the estimate for the current user
    saved_estimate = SavedEstimate()
    saved_estimate.user = request.user
    saved_estimate.miles = miles
    saved_estimate.origin = origin
    saved_estimate.destination = destination
    saved_estimate.origin_formatted = origin_formatted
    saved_estimate.destination_formatted = destination_formatted
    saved_estimate.save()

    # Redirect to the user's saved estimates page
    return HttpResponseRedirect(reverse("saved_estimates_view"))


def saved_estimates_view(request):
    saved_estimates = request.user.saved_estimates.all().order_by("-id")
    return render(request, "saved_estimates.html", {
        "saved_estimates": saved_estimates
    })


def delete_saved_estimate(request, id):
    saved_estimate = SavedEstimate.objects.get(id=id)
    saved_estimate.delete()
    return HttpResponse("OK")


def load_saved_estimate(request, id):
    saved_estimate = SavedEstimate.objects.get(id=id)
    return JsonResponse(saved_estimate.serialize())