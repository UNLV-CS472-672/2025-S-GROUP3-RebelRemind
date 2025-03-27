import unittest
from unittest.mock import patch, mock_open
from database.events_api import app, parse_date, format_week_range, format_day
from datetime import datetime
from collections import defaultdict

class TestEventsAPI(unittest.TestCase):
    def setUp(self):
        # Set up the Flask test client
        self.app = app.test_client()
        self.app.testing = True

    # --- Test Utility Functions ---
    def test_parse_date(self):
        self.assertEqual(parse_date("2025-03-25"), datetime(2025, 3, 25))
        self.assertEqual(parse_date("Tuesday, March 25, 2025"), datetime(2025, 3, 25))
        self.assertIsNone(parse_date("Invalid Date"))

    def test_format_week_range(self):
        date_obj = datetime(2025, 3, 25)  # A Tuesday
        self.assertEqual(format_week_range(date_obj), "Mar 24 – 30, 2025")

    def test_format_day(self):
        date_obj = datetime(2025, 3, 25)
        self.assertEqual(format_day(date_obj), "2025-03-25")

    # --- Test API Endpoints ---
    @patch("builtins.open", new_callable=mock_open, read_data='[{"Date": "2025-03-25", "Event": "Test Event"}]')
    @patch("json.load", return_value=[{"Date": "2025-03-25", "Event": "Test Event"}])
    def test_get_combined_events(self, mock_json_load, mock_file):
        response = self.app.get('/calendar-events')
        self.assertEqual(response.status_code, 200)
        self.assertIn("weekly", response.json)
        self.assertIn("daily", response.json)

    @patch("builtins.open", new_callable=mock_open, read_data='[{"Date": "2025-03-25", "Event": "Test Event"}]')
    @patch("json.load", return_value=[{"Date": "2025-03-25", "Event": "Test Event"}])
    def test_get_events_by_week(self, mock_json_load, mock_file):
        response = self.app.get('/calendar-events/by-week', query_string={"start-date": "2025-03-25"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("Mar 24 – 30, 2025", response.json)

    @patch("builtins.open", new_callable=mock_open, read_data='[{"Date": "2025-03-25", "Event": "Test Event"}]')
    @patch("json.load", return_value=[{"Date": "2025-03-25", "Event": "Test Event"}])
    def test_get_events_by_day(self, mock_json_load, mock_file):
        response = self.app.get('/calendar-events/by-day', query_string={"date": "2025-03-25"})
        self.assertEqual(response.status_code, 200)
        self.assertIn("2025-03-25", response.json)

    # --- Test Error Handling ---
    @patch("builtins.open", side_effect=FileNotFoundError)
    def test_file_not_found_error(self, mock_file):
        response = self.app.get('/calendar-events')
        self.assertEqual(response.status_code, 500)
        self.assertIn("error", response.json)

    @patch("json.load", side_effect=ValueError)
    def test_json_decode_error(self, mock_json_load):
        response = self.app.get('/calendar-events')
        self.assertEqual(response.status_code, 500)
        self.assertIn("error", response.json)

if __name__ == '__main__':
    unittest.main()