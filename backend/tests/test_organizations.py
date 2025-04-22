import requests
import unittest
from webscraping.organizations import default
from database import BASE

class TestFlaskAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        pass

    def test_add_org(self):
        """
        Test adding organizations to the API via PUT request from the scraper.
        """
        print("Scraping organizations and adding to database...")
        default()  # This will scrape and add organizations to the Flask API

        # Try to retrieve the organization from the API
        response = requests.get(BASE + "organization_id/1")
        
        # Check if organization is successfully added
        self.assertEqual(response.status_code, 200, f"Failed to get organization 1: {response.text}")
        event_data = response.json()

        # Verify the expected fields are returned
        self.assertIn("name", event_data)

        print(f"✅ Organization successfully retrieved!")

    def test_get_orgs(self):
        """
        Test retrieving all organizations from the API via GET request.
        """
        # Retrieve all events from the API
        response = requests.get(BASE + "organization_list")
        
        # Ensure the status code is 200 (OK)
        self.assertEqual(response.status_code, 200, f"Failed to get organizations: {response.text}")
        
        # Get the data from the response
        retrieved_data = response.json()

        # Ensure that there are events in the database
        self.assertGreater(len(retrieved_data), 0, "No organizations found in the database!")
        print(f"✅ Retrieved {len(retrieved_data)} organizations from the API.")

if __name__ == '__main__':
    unittest.main()
