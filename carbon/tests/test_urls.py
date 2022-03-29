from django.test import Client, TestCase

def test_page_load(url):
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
        test_page_load(url)

    def test_simple_estimate(self):
        """USA simple estimate page loads"""
        url = "/usa_simple"
        test_page_load(url)

    def test_advanced_page(self):
        """USA advanced estimate page loads"""
        url = "/usa_advanced"
        test_page_load(url)