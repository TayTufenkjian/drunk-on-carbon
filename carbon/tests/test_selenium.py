from chromedriver_py import binary_path
from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium import webdriver


class EstimateFormLoads(StaticLiveServerTestCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.selenium = webdriver.Chrome(binary_path)
        cls.selenium.implicitly_wait(10)
    
    @classmethod
    def tearDownClass(cls):
        cls.selenium.quit()
        super().tearDownClass()
    
    def test_estimate_form_simple(self):

        # Get the URL of the page to test
        self.selenium.get("%s%s" % (self.live_server_url, "/usa_simple"))

        form = self.selenium.find_elements_by_class_name("estimate-form")

        self.assertEqual(len(form), 1)
