"""
Test Cases for User and Event Web Service
"""
import unittest
import requests
from database import BASE
from http import HTTPStatus

class TestEndpoints(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        pass
    
    """Test cases for User API"""

    def test_delete_user(self):
        # Test GET request to retrieve the  user
        response = requests.delete(BASE + 'user_delete/2000444999')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.CONFLICT
        else:
            assert response.status_code == HTTPStatus.OK

    def test_create_user(self):
        # Test PUT request to create a user
        response = requests.put(BASE + 'user_add', json={
            "first_name": "Marge",
            "last_name": "Simpson",
            "nshe": "2000444999"
        })
        assert response.status_code == HTTPStatus.CREATED
        assert response.json()["first_name"] == "Marge"

    def test_get_user(self):
        # Test GET request to retrieve the  user
        response = requests.get(BASE + 'user_id/2000444999')
        assert response.status_code == HTTPStatus.OK
        assert response.json()["first_name"] == "Marge"

    def test_get_user_list(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.get(BASE + 'user_list')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    """Test cases for Academic Calendar API"""
    
    def test_create_ac_event(self):
        # Test PUT request to create an academic calendar event
        response = requests.put(BASE + 'academiccalendar_add', json={
            "name": "Spring Break",
            "date": "Monday, March 17, 2025"
        })
        assert response.status_code == HTTPStatus.CREATED
        assert response.json()["name"] == "Spring Break"

    def test_get_ac_event(self):
        # Test GET request to retrieve the academic calendar event
        response = requests.get(BASE + 'academiccalendar_id/1')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    """Test cases for Involvement Center API"""

    def test_create_ic_event(self):
        # Test PUT request to create an involvement center event
        response = requests.put(BASE + 'involvementcenter_add', json={
            "name": "Info Session",
            "date": "2025-03-25",
            "time": "10:00 AM PDT",
            "location": "SU 200",
            "organization": "UNLV"
        })
        assert response.status_code == HTTPStatus.CREATED
        assert response.json()["name"] == "Info Session"

    def test_get_ic_event(self):
        # Test GET request to retrieve the involvement center event
        response = requests.get(BASE + 'involvementcenter_id/1')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    """Test cases for Rebel Coverage API"""

    def test_create_rc_event(self):
        # Test PUT request to create a rebel coverage event
        response = requests.put(BASE + 'rebelcoverage_add', json={
            "name": "Super Bowl",
            "date": "02/25/2026",
            "time": "12:00 PM PST",
            "location": "California"
        })
        assert response.status_code == HTTPStatus.CREATED
        assert response.json()["name"] == "Super Bowl"

    def test_get_rc_event(self):
        # Test GET request to retrieve the rebel coverage event
        response = requests.get(BASE + 'rebelcoverage_id/1')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    """Test cases for UNLV Calendar API"""

    def test_create_uc_event(self):
        # Test PUT request to create a unlv calendar event
        response = requests.put(BASE + 'unlvcalendar_add', json={
            "name": "Info Session",
            "date": "Tuesday, March 25, 2025",
            "time": "10:00 AM PDT",
            "location": "SU 200"
        })
        assert response.status_code == HTTPStatus.CREATED
        assert response.json()["name"] == "Info Session"

    def test_get_uc_event(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.get(BASE + 'unlvcalendar_id/1')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    """Test cases for List commands"""

    def test_get_ac_list(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.get(BASE + 'academiccalendar_list')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_get_ic_list(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.get(BASE + 'involvementcenter_list')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_get_rc_list(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.get(BASE + 'rebelcoverage_list')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_get_uc_list(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.get(BASE + 'unlvcalendar_list')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    """Test cases for Daily commands"""

    def test_get_ac_daily(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.get(BASE + 'academiccalendar_daily/2025-03-17')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_get_ic_daily(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.get(BASE + 'involvementcenter_daily/2025-03-25')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_get_rc_daily(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.get(BASE + 'rebelcoverage_daily/2026-02-25')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_get_uc_daily(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.get(BASE + 'unlvcalendar_daily/2025-03-25')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    """Test cases for Delete commands"""

    def test_ac_delete_past(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.delete(BASE + 'academiccalendar_delete_past')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_ic_delete_past(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.delete(BASE + 'involvementcenter_delete_past')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_rc_delete_past(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.delete(BASE + 'rebelcoverage_delete_past')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_uc_delete_past(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.delete(BASE + 'unlvcalendar_delete_past')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_ac_delete_all(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.delete(BASE + 'academiccalendar_delete_all')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_ic_delete_all(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.delete(BASE + 'involvementcenter_delete_all')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_rc_delete_all(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.delete(BASE + 'rebelcoverage_delete_all')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

    def test_uc_delete_all(self):
        # Test GET request to retrieve the unlv calendar event
        response = requests.delete(BASE + 'unlvcalendar_delete_all')
        if "message" in response.json():
            assert response.status_code == HTTPStatus.NOT_FOUND
        else:
            assert response.status_code == HTTPStatus.OK

if __name__ == '__main__':
    unittest.main()
