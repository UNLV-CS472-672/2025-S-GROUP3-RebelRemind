import requests
import unittest
from webscraping.unlv_calendar import default
from database import BASE

class TestFlaskAPI(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        pass

    def test_add_events(self):
        """
        Test adding events to the API via PUT request from the scraper.
        """
        print("Scraping events and adding to database...")
        default()  # This will scrape and add events to the Flask API

        # Try to retrieve the event from the API
        response = requests.get(BASE + f"unlvcalendar_id/1")
        
        # Check if event is successfully added
        self.assertEqual(response.status_code, 200, f"Failed to get event 1: {response.text}")
        event_data = response.json()

        # Verify the expected fields are returned
        self.assertIn("name", event_data)
        self.assertIn("date", event_data)
        self.assertIn("time", event_data)
        self.assertIn("location", event_data)

        print(f"✅ Events successfully added and retrieved!")

    def test_get_events(self):
        """
        Test retrieving all events from the API via GET request.
        """
        # Retrieve all events from the API
        response = requests.get(BASE + "unlvcalendar_list")
        
        # Ensure the status code is 200 (OK)
        self.assertEqual(response.status_code, 200, f"Failed to get events: {response.text}")
        
        # Get the data from the response
        retrieved_data = response.json()

        # Ensure that there are events in the database
        self.assertGreater(len(retrieved_data), 0, "No events found in the database!")
        print(f"✅ Retrieved {len(retrieved_data)} events from the API.")

if __name__ == '__main__':
    unittest.main()
