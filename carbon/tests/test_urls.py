
from django.test import Client, TestCase

def test_response_status(url):
    # Set up client to make requests
    c = Client()

    # Send get request to a URL and store response
    response = c.get(url)

    # Check that the status code is 200
    assert response.status_code == 200


class PageLoadTestCase(TestCase):

    def test_index(self):
        """Home page (index) loads"""
        url = ""
        test_response_status(url)

    def test_simple_estimate(self):
        """USA simple estimate page loads"""
        url = "/usa_travel_miles"
        test_response_status(url)

    def test_advanced_page(self):
        """USA advanced estimate page loads"""
        url = "/usa_travel_places"
        test_response_status(url)


class APIRouteTestCase(TestCase):

    def test_estimate(self):
        """Passing miles integer to the estimate route returns a successful response"""
        url = "/estimate/10"
        test_response_status(url)
    
    def test_request_distance(self):
        """Passing origin and destination strings returns a successful response"""
        url = "/request_distance/MiamiFL&SanFranciscoCA"
        test_response_status(url)