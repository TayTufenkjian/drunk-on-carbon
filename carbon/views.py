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
            "emission_factor": "electricity-energy_source_grid_mix",
            "parameters":
                {
                "energy": 4200,
                "energy_unit": "kWh"
                }
        }
    
    response = requests.post(api_url, json=body, headers=headers)
    response_json = response.json()
    response_status = response.status_code


    return render(request, "index.html", {
        "response_json": response_json,
        "response_status": response_status
        })
