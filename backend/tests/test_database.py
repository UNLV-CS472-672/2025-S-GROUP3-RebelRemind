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
        # Ensure baseline user exists for tests that need it
        requests.put(BASE + 'user_add', json={
            "first_name": "Marge",
            "last_name": "Simpson",
            "nshe": "2000444999"
        })
        # Ensure baseline events exist for ID=1 fetch tests
        requests.put(BASE + 'academiccalendar_add', json={
            "name": "Spring Break",
            "date": "Monday, March 17, 2025"
        })
        requests.put(BASE + 'involvementcenter_add', json={
            "name": "Info Session",
            "date": "2025-03-25",
            "time": "10:00 AM PDT",
            "location": "SU 200",
            "organization": "UNLV"
        })
        requests.put(BASE + 'rebelcoverage_add', json={
            "name": "Super Bowl",
            "date": "02/25/2026",
            "time": "12:00 PM PST",
            "location": "California"
        })
        requests.put(BASE + 'unlvcalendar_add', json={
            "name": "Info Session",
            "date": "Tuesday, March 25, 2025",
            "time": "10:00 AM PDT",
            "location": "SU 200"
        })

    def test_create_user(self):
        response = requests.put(BASE + 'user_add', json={
            "first_name": "Lisa",
            "last_name": "Simpson",
            "nshe": "2000555999"
        })
        assert response.status_code == HTTPStatus.CREATED
        assert response.json()["first_name"] == "Lisa"

    def test_get_user(self):
        response = requests.get(BASE + 'user_id/2000444999')
        assert response.status_code == HTTPStatus.OK
        assert response.json()["first_name"] == "Marge"

    def test_get_user_list(self):
        response = requests.get(BASE + 'user_list')
        assert response.status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]

    def test_delete_user(self):
        response = requests.delete(BASE + 'user_delete/2000555999')
        assert response.status_code in [HTTPStatus.OK, HTTPStatus.CONFLICT]

    def test_create_ac_event(self):
        response = requests.put(BASE + 'academiccalendar_add', json={
            "name": "Midterms",
            "date": "Wednesday, March 19, 2025"
        })
        assert response.status_code == HTTPStatus.CREATED

    def test_get_ac_event(self):
        response = requests.get(BASE + 'academiccalendar_id/1')
        assert response.status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]

    def test_create_ic_event(self):
        response = requests.put(BASE + 'involvementcenter_add', json={
            "name": "Career Fair",
            "date": "2025-04-10",
            "time": "1:00 PM",
            "location": "SU Ballroom",
            "organization": "Career Center"
        })
        assert response.status_code == HTTPStatus.CREATED

    def test_get_ic_event(self):
        response = requests.get(BASE + 'involvementcenter_id/1')
        assert response.status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]

    def test_create_rc_event(self):
        response = requests.put(BASE + 'rebelcoverage_add', json={
            "name": "Rebel Football",
            "date": "04/20/2026",
            "time": "6:00 PM",
            "location": "Allegiant Stadium"
        })
        assert response.status_code == HTTPStatus.CREATED

    def test_get_rc_event(self):
        response = requests.get(BASE + 'rebelcoverage_id/1')
        assert response.status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]

    def test_create_uc_event(self):
        response = requests.put(BASE + 'unlvcalendar_add', json={
            "name": "Capstone Showcase",
            "date": "Tuesday, May 6, 2025",
            "time": "5:00 PM",
            "location": "CBC A"
        })
        assert response.status_code == HTTPStatus.CREATED

    def test_get_uc_event(self):
        response = requests.get(BASE + 'unlvcalendar_id/1')
        assert response.status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]

    def test_lists(self):
        assert requests.get(BASE + 'academiccalendar_list').status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]
        assert requests.get(BASE + 'involvementcenter_list').status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]
        assert requests.get(BASE + 'rebelcoverage_list').status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]
        assert requests.get(BASE + 'unlvcalendar_list').status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]

    def test_dailies(self):
        assert requests.get(BASE + 'academiccalendar_daily/2025-03-17').status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]
        assert requests.get(BASE + 'involvementcenter_daily/2025-03-25').status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]
        assert requests.get(BASE + 'rebelcoverage_daily/2026-02-25').status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]
        assert requests.get(BASE + 'unlvcalendar_daily/2025-03-25').status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]

    def test_delete_all_and_past(self):
        # You could separate these, but it's fine to batch here
        for endpoint in [
            'academiccalendar_delete_all', 'involvementcenter_delete_all',
            'rebelcoverage_delete_all', 'unlvcalendar_delete_all',
            'academiccalendar_delete_past', 'involvementcenter_delete_past',
            'rebelcoverage_delete_past', 'unlvcalendar_delete_past'
        ]:
            res = requests.delete(BASE + endpoint)
            assert res.status_code in [HTTPStatus.OK, HTTPStatus.NOT_FOUND]

if __name__ == '__main__':
    unittest.main()
