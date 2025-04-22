import requests
import unittest
from webscraping.rebel_coverage import default
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

        response = requests.get(BASE + "rebelcoverage_list")
        #print(f'len of response: {len(response.json())}')
        #print(f'reponse last item: {response.json()[-1]["id"]}')

        # Now check if events are in the API
        event_id = 1
        while True:
            # Try to retrieve the event from the API
            response = requests.get(BASE + f"rebelcoverage_id/{event_id}")
            
            if response.status_code == 404:  # No more events in the database
                break
            
            # Check if event is successfully added
            self.assertEqual(response.status_code, 200, f"Failed to get event {event_id}: {response.text}")
            event_data = response.json()

            # Verify the expected fields are returned
            self.assertIn("name", event_data)
            self.assertIn("startDate", event_data)
            self.assertIn("startTime", event_data)
            self.assertIn("endDate", event_data)
            self.assertIn("endTime", event_data)
            self.assertIn("sport", event_data)
            self.assertIn("link", event_data)

            print(f"✅ Event {event_id} successfully added and retrieved!")
            event_id += 1  # Increment event ID for next loop

    def test_get_events(self):
        """
        Test retrieving all events from the API via GET request.
        """
        # Retrieve all events from the API
        response = requests.get(BASE + "rebelcoverage_list")
        
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
            self.assertIn("startDate", event)
            self.assertIn("startTime", event)
            self.assertIn("endDate", event)
            self.assertIn("endTime", event)
            self.assertIn("sport", event)
            self.assertIn("link", event)

        print("✅ All events retrieved successfully!")

if __name__ == '__main__':
    unittest.main()
