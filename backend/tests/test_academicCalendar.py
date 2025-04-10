import unittest
import requests
import sys
import os
import time


script_dir = os.path.dirname(__file__)  # Directory of the test script itself

scraper_path = os.path.abspath(os.path.join(script_dir, '..', 'webscraping'))
sys.path.insert(0, scraper_path)

try:
   
    from academic_calendar import default as scrape_academic_calendar
    
    from academic_calendar import BASE
except ImportError as e:
    print(f"Error importing scraper: {e}")
    print(f"Please ensure 'academic_calendar.py' exists in '{scraper_path}'")
    sys.exit(1) # Exit if scraper can't be imported

# --- Test Class ---

class TestAcademicScraperAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Optional: Run once before all tests in the class."""
        print("--- Starting Academic Calendar Scraper API Tests ---")
        # Check if the API server is running
        try:
            # Use a known endpoint like the list endpoint, or just the base
            response = requests.get(BASE + "academiccalendar_list", timeout=3)
            # Allow 404 if list is just empty, but not server errors (5xx) or connection errors
            if response.status_code >= 500:
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
        print("\nClearing Academic Calendar events before test...")
        delete_response = requests.delete(BASE + "academiccalendar_delete_all") # Use correct endpoint
        # Check if deletion worked (200 OK) or if the table was already empty (404 Not Found)
        self.assertIn(delete_response.status_code, [200, 404],
                      f"Failed to clear previous Academic Calendar events: {delete_response.text}")
        print("Previous Academic Calendar events cleared (or table was empty).")
        time.sleep(0.5) # Give server a tiny bit of time


    def test_scrape_and_add_events(self):
        """
        Test scraping Academic Calendar and adding events via the API.
        Verifies events are retrievable afterwards.
        """
        print("Running Academic Calendar scraper and adding to database via API...")
        try:
            scrape_academic_calendar() # This calls the scraper's default()
            print("Scraping and PUT requests completed.")
        except Exception as e:
            # If the scraper itself throws an error during the test
            self.fail(f"Scraping function 'academic_calendar.default()' failed with an exception: {e}")

        time.sleep(1) # Give server time to process database commits

        # Now check if events were added by retrieving the list
        print("Retrieving event list from API to verify additions...")
        response = requests.get(BASE + "academiccalendar_list") # Use correct endpoint

        self.assertEqual(response.status_code, 200,
                         f"Failed to get Academic Calendar list after scraping: {response.text}")

        retrieved_data = response.json()
        self.assertIsInstance(retrieved_data, list, "API did not return a list for Academic Calendar events.")
        self.assertGreater(len(retrieved_data), 0,
                           "Scraping ran, but no Academic Calendar events were found in the API list.")

        print(f"✅ Found {len(retrieved_data)} Academic Calendar events in API after scraping.")

        # Verify the structure of the first retrieved event
        first_event = retrieved_data[0]
        print(f"Verifying structure of first event: {first_event.get('name')}")
        self.assertIn("id", first_event)
        self.assertIn("name", first_event)
        self.assertIn("date", first_event) # API returns date as string
        self.assertIn("time", first_event) # Can be None
        self.assertIn("location", first_event) # Can be None

        
        event_id_to_get = first_event['id']
        print(f"Attempting to retrieve event ID {event_id_to_get} specifically...")
        indiv_response = requests.get(BASE + f"academiccalendar_id/{event_id_to_get}") # Use correct endpoint
        self.assertEqual(indiv_response.status_code, 200,
                         f"Failed to get Academic Calendar event ID {event_id_to_get}: {indiv_response.text}")
        indiv_data = indiv_response.json()
        self.assertEqual(indiv_data['name'], first_event['name']) # Check name matches

        print(f"✅ Scraped Academic Calendar events successfully added and verified via API.")


    def test_get_events_after_adding(self):
        """
        Test retrieving the Academic Calendar event list after adding data.
        Ensures the list endpoint works correctly when data exists.
        """
        # Add data first by running the scraper
        print("Pre-populating Academic Calendar data for GET list test...")
        try:
            scrape_academic_calendar()
        except Exception as e:
             self.fail(f"Scraping function failed during setup for GET list test: {e}")
        time.sleep(0.5)

        print("Retrieving full Academic Calendar list...")
        response = requests.get(BASE + "academiccalendar_list") # Use correct endpoint

        self.assertEqual(response.status_code, 200, f"Failed to get Academic Calendar event list: {response.text}")

        retrieved_data = response.json()
        self.assertIsInstance(retrieved_data, list)
        self.assertGreater(len(retrieved_data), 0, "Academic Calendar list endpoint returned empty after data should have been added.")
        print(f"✅ Retrieved {len(retrieved_data)} Academic Calendar events successfully.")

        # Verify structure again for an item in the list
        event = retrieved_data[0]
        self.assertIn("name", event)
        self.assertIn("date", event)
        self.assertIn("time", event)
        self.assertIn("location", event)
        print("✅ Event structure in list verified.")


    @classmethod
    def tearDownClass(cls):
        """Optional: Run once after all tests in the class."""
        print("\n--- Finished Academic Calendar Scraper API Tests ---")
        


if __name__ == '__main__':
    # Ensure the script using this test class is run directly
    unittest.main()

