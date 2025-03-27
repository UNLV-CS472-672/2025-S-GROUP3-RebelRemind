"""
Test Cases for User and Event Web Service
"""
import unittest
import requests
import json
from database import BASE
from database.serve_data import app, db
from http import HTTPStatus

class TestEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with app.app_context():
            db.drop_all()
            db.create_all()
    
    """Test cases for User API"""

    def test_create_user(self):
        # Test PUT request to create a user
        response = requests.get(BASE + '/user_id/1', json={
            "first_name": "Marge",
            "last_name": "Simpson",
            "nshe": "2000444999"
        })
        assert response.status_code == HTTPStatus.CREATED
        assert response.json["first_name"] == "Marge"

    def test_get_user(self):
        # Test GET request to retrieve the  user
        response = requests.get(BASE + '/user_id/1')
        assert response.status_code == HTTPStatus.OK
        assert response.json["first_name"] == "Marge"

    """Test cases for Academic Calendar API"""
    
    def test_create_event(self):
        # Test PUT request to create an academic calendar event
        response = requests.put(BASE + '/academiccalendar_id/1', json={
            "name": "Spring Break",
            "date": "Monday, March 17, 2025"
        })
        assert response.status_code == HTTPStatus.CREATED
        assert response.json["name"] == "Spring Break"

    def test_get_event(self):
        # Test GET request to retrieve the academic calendar event
        response = requests.get(BASE + '/academiccalendar_id/1')
        assert response.status_code == HTTPStatus.OK
        assert response.json["name"] == "Spring Break"

    """Test cases for Involvement Center API"""

    def test_create_event(self):
        # Test PUT request to create an involvement center event
        response = requests.put(BASE + '/involvementcenter_id/1', json={
            "name": "Info Session",
            "date": "Tuesday, March 25, 2025",
            "time": "10:00 AM PDT",
            "location": "SU 200"
        })
        assert response.status_code == HTTPStatus.CREATED
        assert response.json["name"] == "Info Session"

    def test_get_event(self):
        # Test GET request to retrieve the involvement center event
        response = requests.get(BASE + '/involvementcenter_id/1')
        assert response.status_code == HTTPStatus.OK
        assert response.json["name"] == "Info Session"

    """Test cases for Rebel Coverage API"""

    def test_create_event(self):
        # Test PUT request to create a rebel coverage event
        response = requests.put(BASE + '/rebelcoverage_id/1', json={
            "name": "Super Bowl",
            "date": "Tuesday, February 25, 2026",
            "time": "12:00 PM PST",
            "location": "California"
        })
        assert response.status_code == HTTPStatus.CREATED
        assert response.json["name"] == "Super Bowl"

    def test_get_event(self):
        # Test GET request to retrieve the rebel coverage event
        response = requests.get(BASE + '/rebelcoverage_id/1')
        assert response.status_code == HTTPStatus.OK
        assert response.json["name"] == "Super Bowl"

    """Test cases for UNLV Calendar API"""

    def test_create_event(self):
        # Test PUT request to create a unlv calendar event
        response = requests.put(BASE + '/unlvcalendar_id/1', json={
            "name": "Info Session",
            "date": "Tuesday, March 25, 2025",
            "time": "10:00 AM PDT",
            "location": "SU 200"
        })
        assert response.status_code == HTTPStatus.CREATED
        assert response.json["name"] == "Info Session"

    def test_get_event(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.get(BASE + '/unlvcalendar_id/1')
        assert response.status_code == HTTPStatus.OK
        assert response.json["name"] == "Info Session"

    """Test cases for Daily API"""

    def test_create_daily(self):
        # Test PUT request to create a daily
        response = requests.put(BASE + '/daily/Tuesday, March 25, 2025')
        assert response.status_code == HTTPStatus.CREATED
        assert response.json["date"] == "Tuesday, March 25, 2025"

    def test_get_daily(self):
        # Test GET request to retrieve the daily events
        response = requests.get(BASE + '/daily/Tuesday, March 25, 2025')
        assert response.status_code == HTTPStatus.OK
        assert response.json["date"] == "Tuesday, March 25, 2025"

def default():
    # GET daily list
    response = requests.get(BASE + "daily")
    data = response.json()

    with open('output.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

if __name__ == '__main__':
    unittest.main()
