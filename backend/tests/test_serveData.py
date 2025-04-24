import pytest
from datetime import datetime
from http import HTTPStatus
from database.serve_data import (
    app as flask_app, db, User, AcademicCalendar, InvolvementCenter, RebelCoverage,
    UNLVCalendar, DupCheck
)

# ------------------ Fixtures ------------------
@pytest.fixture
def app():
    flask_app.config['TESTING'] = True
    flask_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with flask_app.app_context():
        db.drop_all()
        db.create_all()
    yield flask_app

@pytest.fixture
def client(app):
    with app.test_client() as client:
        yield client

# ------------------ User Tests ------------------
def test_add_user(client):
    res = client.put('/user_add', json={
        "first_name": "Test",
        "last_name": "User",
        "nshe": "123456789"
    })
    assert res.status_code == HTTPStatus.CREATED
    assert res.json['first_name'] == "Test"

def test_get_user(client):
    client.put('/user_add', json={
        "first_name": "Testy",
        "last_name": "McTestface",
        "nshe": "2000444999"
    })
    res = client.get('/user_id/2000444999')
    assert res.status_code == HTTPStatus.OK
    assert res.json['first_name'] == "Testy"

def test_get_user_by_nshe(client):
    client.put('/user_add', json={
        "first_name": "Jane",
        "last_name": "Doe",
        "nshe": "000111222"
    })
    res = client.get('/user_id/000111222')
    assert res.status_code == HTTPStatus.OK
    assert res.json['last_name'] == "Doe"

def test_duplicate_user(client):
    client.put('/user_add', json={
        "first_name": "Test",
        "last_name": "User",
        "nshe": "123456789"
    })
    res = client.put('/user_add', json={
        "first_name": "Test",
        "last_name": "User",
        "nshe": "123456789"
    })
    assert res.status_code == HTTPStatus.CONFLICT

def test_dupcheck_invalid_format_academic(app):
    with app.app_context():
        with pytest.raises(ValueError):
            DupCheck(AcademicCalendar, "03-25-2025", "03-25-2025", "Event Name")

def test_delete_academiccalendar_when_empty(client):
    res = client.delete('/academiccalendar_delete_all')
    assert res.status_code == HTTPStatus.OK
    assert "Academic Calendar table already empty or deletion failed." in res.json['message']

def test_delete_user(client):
    client.put('/user_add', json={
        "first_name": "Delete",
        "last_name": "Me",
        "nshe": "999888777"
    })
    res = client.delete('/user_delete/999888777')
    assert res.status_code == HTTPStatus.OK

def test_get_missing_user(client):
    res = client.get('/user_id/999999999')
    assert res.status_code == HTTPStatus.NOT_FOUND

def test_add_user_missing_field(client):
    res = client.put('/user_add', json={"first_name": "Fail"})
    assert res.status_code == HTTPStatus.BAD_REQUEST

def test_delete_nonexistent_user(client):
    res = client.delete('/user_delete/111111111')
    assert res.status_code in [HTTPStatus.NOT_FOUND, HTTPStatus.CONFLICT]

def test_delete_all_users(client):
    client.put('/user_add', json={
        "first_name": "Wipe",
        "last_name": "Me",
        "nshe": "000000001"
    })
    res = client.delete('/user_delete_all')
    assert res.status_code == HTTPStatus.OK

# ------------------ Academic Calendar Tests ------------------
def test_add_academic_event(client):
    date_str = datetime.now().strftime('%A, %B %d, %Y')
    res = client.put('/academiccalendar_add', json={
        "name": "Test Event",
        "startDate": date_str,
        "startTime": "10:00 AM",
        "endDate": date_str
    })
    assert res.status_code == HTTPStatus.CREATED
    assert res.json['name'] == "Test Event"

def test_duplicate_academic_event(client):
    date_str = datetime.now().strftime('%A, %B %d, %Y')
    data = {
        "name": "Duplicate Event",
        "startDate": date_str,
        "startTime": "10:00 AM",
        "endDate": date_str
    }
    client.put('/academiccalendar_add', json=data)
    res = client.put('/academiccalendar_add', json=data)
    assert res.status_code == HTTPStatus.CONFLICT

def test_add_academic_event_missing_name(client):
    res = client.put('/academiccalendar_add', json={"startDate": "Monday, March 17, 2025"})
    assert res.status_code == HTTPStatus.BAD_REQUEST

def test_delete_all_academic_events(client):
    date_str = datetime.now().strftime('%A, %B %d, %Y')
    client.put('/academiccalendar_add', json={
        "name": "Clear Event",
        "startDate": date_str,
        "startTime": "5:00 PM",
        "endDate": date_str
    })
    res = client.delete('/academiccalendar_delete_all')
    assert res.status_code == HTTPStatus.OK

# ------------------ Event Fetch Tests ------------------
def test_get_event_by_id(client):
    date_str = datetime.now().strftime('%A, %B %d, %Y')
    post = client.put('/academiccalendar_add', json={
        "name": "Fetchable Event",
        "startDate": date_str,
        "startTime": "11:00 AM",
        "endDate": date_str
    })
    event_id = post.json['id']
    res = client.get(f'/academiccalendar_id/{event_id}')
    assert res.status_code == HTTPStatus.OK
    assert res.json['name'] == "Fetchable Event"

# ------------------ Miscellaneous ------------------
def test_add_involvement_event_with_link(client):
    date_str = datetime.now().isoformat()
    res = client.put('/involvementcenter_add', json={
        "name": "Linked Event",
        "startDate": date_str,
        "startTime": "2:00 PM",
        "endDate": date_str,
        "endTime": "3:00 PM",
        "location": "Online",
        "organization": "Tech Club",
        "link": "https://example.com/event"
    })
    assert res.status_code == HTTPStatus.CREATED
    assert res.json['link'] == "https://example.com/event"

def test_create_organization(client):
    res = client.put('/organization_add', json={
        "name": "Cool Org"
    })
    assert res.status_code == HTTPStatus.CREATED

def test_organization_add_duplicate(client):
    client.put('/organization_add', json={"name": "DupOrg"})
    res = client.put('/organization_add', json={"name": "DupOrg"})
    assert res.status_code == HTTPStatus.CONFLICT

def test_organization_delete_all_empty(client):
    res = client.delete('/organization_delete_all')
    assert res.status_code == HTTPStatus.OK

# ------------------ DupCheck Tests ------------------
@pytest.mark.parametrize("table_cls, startDate, endDate, name, startTime, is_dup", [
    (AcademicCalendar, "Monday, March 17, 2025", "Monday, March 17, 2025", "Spring Break", "", True),
    (AcademicCalendar, "Tuesday, March 18, 2025", "Tuesday, March 18, 2025", "Spring Break", "", False),
    (InvolvementCenter, "2025-04-01", "2025-04-01", "Club Fair", "2:00 PM", True),
    (InvolvementCenter, "2025-04-02", "2025-04-02", "Club Fair", "2:00 PM", False),
    (RebelCoverage, "09/01/2025", "09/01/2025", "Football Game", "6:00 PM", True),
    (RebelCoverage, "09/02/2025", "09/02/2025", "Football Game", "6:00 PM", False),
    (UNLVCalendar, "Friday, August 23, 2024", "Friday, August 23, 2024", "Orientation", "9:00 AM", True),
    (UNLVCalendar, "Saturday, August 24, 2024", "Saturday, August 24, 2024", "Orientation", "9:00 AM", False)
])
def test_dupcheck_variants(app, table_cls, startDate, endDate, name, startTime, is_dup):
    with app.app_context():
        date_obj = {
            AcademicCalendar: datetime.strptime("Monday, March 17, 2025", "%A, %B %d, %Y"),
            InvolvementCenter: datetime.fromisoformat("2025-04-01"),
            RebelCoverage: datetime.strptime("09/01/2025", "%m/%d/%Y"),
            UNLVCalendar: datetime.strptime("Friday, August 23, 2024", "%A, %B %d, %Y")
        }[table_cls]

        if is_dup:
            db.session.add(table_cls(name=name, startDate=date_obj, startTime=startTime, endDate=date_obj))
            db.session.commit()

        result = DupCheck(table_cls, startDate, endDate, name, startTime)
        if is_dup:
            assert result == (False, False)
        else:
            assert isinstance(result, tuple)
