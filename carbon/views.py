import json
import requests
from django.http import HttpResponse
from django.shortcuts import render

import os
from dotenv import load_dotenv
load_dotenv()

CLIMATIQ_API_KEY= str(os.getenv("CLIMATIQ_API_KEY"))

def index(request):
    api_url = "https://beta3.api.climatiq.io/estimate"
    headers = {
            "Authorization": f"Bearer {CLIMATIQ_API_KEY}"
          }
    body = {
            "emission_factor": "consumer_goods-type_clothing",
            "parameters":
                {
                "money": 10,
                "money_unit": "usd"
                }
        }
    
    response = requests.post(api_url, json=body, headers=headers)
    response_status = response.status_code
    dict = response.json()
    
    # Check unit of measurement in the response

    # Round down the co2e units
    wine_bottles = int(dict["co2e"])

    # Get the range to pass to the template
    wine_bottle_range = range(0, wine_bottles)

    return render(request, "index.html", {
        "response_status": response_status,
        "dict": dict,
        "wine_bottle_range": wine_bottle_range
        })
