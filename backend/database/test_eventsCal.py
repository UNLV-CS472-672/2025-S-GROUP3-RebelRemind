import requests
import unittest
import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'webscraping')))
from unlv_calendar import default


BASE = "http://127.0.0.1:5050/"  # Your Flask API base URL

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

        # Now check if events are in the API
        event_id = 1
        while True:
            # Try to retrieve the event from the API
            response = requests.get(BASE + f"unlvcalendar_id/{event_id}")
            
            if response.status_code == 404:  # No more events in the database
                break
            
            # Check if event is successfully added
            self.assertEqual(response.status_code, 200, f"Failed to get event {event_id}: {response.text}")
            event_data = response.json()

            # Verify the expected fields are returned
            self.assertIn("name", event_data)
            self.assertIn("date", event_data)
            self.assertIn("time", event_data)
            self.assertIn("location", event_data)

            print(f"✅ Event {event_id} successfully added and retrieved!")
            event_id += 1  # Increment event ID for next loop

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

        # Optionally, verify event details (you could compare this with your own expected structure if needed)
        for event in retrieved_data:
            self.assertIn("name", event)
            self.assertIn("date", event)
            self.assertIn("time", event)
            self.assertIn("location", event)

        print("✅ All events retrieved successfully!")

if __name__ == '__main__':
    unittest.main()
