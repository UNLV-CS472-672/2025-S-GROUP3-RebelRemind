import requests
import unittest
from http import HTTPStatus
import time
from webscraping.organizations import default
from database import BASE

# --- Test Class ---
class TestFlaskAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Optional: Run once before all tests in the class."""
        print("--- Starting Organizations Scraper API Tests ---")
        # Check if the API server is running
        try:
            # Use a known endpoint like the list endpoint, or just the base
            response = requests.get(BASE + "organizations_list", timeout=3)
            # Allow 404 if list is just empty, but not server errors (5xx) or connection errors
            if response.status_code >= HTTPStatus.INTERNAL_SERVER_ERROR:
                 raise ConnectionError(f"API Server returned status {response.status_code}")
            print(f"API Server connection check status: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"\nFATAL: Cannot connect to API Server at {BASE}. Ensure it's running.")
            print(f"Error details: {e}")
            # Stop tests if API isn't running
            raise ConnectionError(f"API Server at {BASE} not reachable.") from e

    def setUp(self):
        """Run before each test method."""
        # Clean the specific table before each test to ensure independence
        print("\nClearing organizations before test...")
        delete_response = requests.delete(BASE + "organizations_delete_all") # Use correct endpoint
        # Check if deletion worked or if the table was already empty (200 OK)
        self.assertEqual(delete_response.status_code, HTTPStatus.OK,
                      f"Failed to clear previous organizations: {delete_response.text}")
        print("Previous organizations cleared (or table was empty).")
        time.sleep(0.5) # Give server a tiny bit of time

    def test_scrape_and_add_orgs(self):
        """
        Test scraping organizations and adding them via the API.
        Verifies organizations are retrievable afterwards.
        """
        print("Running organizations scraper and adding to database via API...")
        try:
            default()
            print("Scraping and PUT requests completed.")
        except Exception as e:
            # If the scraper itself throws an error during the test
            self.fail(f"Scraping function 'organizations.default()' failed with an exception: {e}")

        time.sleep(1) # Give server time to process database commits

        # Now check if organizations were added by retrieving the list
        print("Retrieving organization list from API to verify additions...")
        response = requests.get(BASE + "organizations_list") # Use correct endpoint

        self.assertEqual(response.status_code, HTTPStatus.OK,
                         f"Failed to get organizations list after scraping: {response.text}")

        retrieved_data = response.json()
        self.assertIsInstance(retrieved_data, list, "API did not return a list for organizations.")
        self.assertGreater(len(retrieved_data), 0,
                           "Scraping ran, but no organizations were found in the API list.")

        print(f"✅ Found {len(retrieved_data)} organizations in API after scraping.")

        # Verify the structure of the first retrieved organization
        first_org = retrieved_data[0]
        print(f"Verifying structure of first organization: {first_org.get('name')}")
        self.assertIn("id", first_org)
        self.assertIn("name", first_org)
        
        org_id_to_get = first_org['id']
        print(f"Attempting to retrieve organization ID {org_id_to_get} specifically...")
        indiv_response = requests.get(BASE + f"organization_id/{org_id_to_get}") # Use correct endpoint
        self.assertEqual(indiv_response.status_code, HTTPStatus.OK,
                         f"Failed to get organization ID {org_id_to_get}: {indiv_response.text}")
        indiv_data = indiv_response.json()
        self.assertEqual(indiv_data['name'], first_org['name']) # Check name matches

        print(f"✅ Scraped organizations successfully added and verified via API.")


    def test_get_orgs_after_adding(self):
        """
        Test retrieving the organization list after adding data.
        Ensures the list endpoint works correctly when data exists.
        """
        # Add data first by running the scraper
        print("Pre-populating organization data for GET list test...")
        try:
            default()
        except Exception as e:
             self.fail(f"Scraping function failed during setup for GET list test: {e}")
        time.sleep(0.5)

        print("Retrieving full organization list...")
        response = requests.get(BASE + "academiccalendar_list") # Use correct endpoint

        self.assertEqual(response.status_code, HTTPStatus.OK, f"Failed to get organization list: {response.text}")

        retrieved_data = response.json()
        self.assertIsInstance(retrieved_data, list)
        self.assertGreater(len(retrieved_data), 0, "Organization list endpoint returned empty after data should have been added.")
        print(f"✅ Retrieved {len(retrieved_data)} organizations successfully.")

        # Verify structure again for an item in the list
        event = retrieved_data[0]
        self.assertIn("name", event)
        self.assertIn("startDate", event)
        self.assertIn("startTime", event)
        self.assertIn("endDate", event)
        self.assertIn("endTime", event)
        print("✅ Organization structure in list verified.")
        
    @classmethod
    def tearDownClass(cls):
        """Optional: Run once after all tests in the class."""
        print("\n--- Finished Organizations Scraper API Tests ---")

if __name__ == '__main__':
    # Ensure the script using this test class is run directly
    unittest.main()
