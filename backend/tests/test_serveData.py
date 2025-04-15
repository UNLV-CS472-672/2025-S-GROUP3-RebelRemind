import pytest
from datetime import datetime
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
    assert res.status_code == 201
    assert res.json['first_name'] == "Test"

def test_get_user(client):
    client.put('/user_add', json={
        "first_name": "Testy",
        "last_name": "McTestface",
        "nshe": "2000444999"
    })
    res = client.get('/user_id/2000444999')
    assert res.status_code == 200
    assert res.json['first_name'] == "Testy"

def test_get_user_by_nshe(client):
    client.put('/user_add', json={
        "first_name": "Jane",
        "last_name": "Doe",
        "nshe": "000111222"
    })
    res = client.get('/user_id/000111222')
    assert res.status_code == 200
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
    assert res.status_code == 409

def test_dupcheck_invalid_format_academic(app):
    with app.app_context():
        with pytest.raises(ValueError):
            DupCheck(AcademicCalendar, "03-25-2025", "Event Name")

def test_delete_academiccalendar_when_empty(client):
    res = client.delete('/academiccalendar_delete_all')
    assert res.status_code == 404
    assert "Nothing to delete" in res.json['message']


def test_delete_user(client):
    client.put('/user_add', json={
        "first_name": "Delete",
        "last_name": "Me",
        "nshe": "999888777"
    })
    res = client.delete('/user_delete/999888777')
    assert res.status_code == 200

def test_get_missing_user(client):
    res = client.get('/user_id/999999999')
    assert res.status_code == 404

def test_add_user_missing_field(client):
    res = client.put('/user_add', json={"first_name": "Fail"})
    assert res.status_code == 400

def test_delete_nonexistent_user(client):
    res = client.delete('/user_delete/111111111')
    assert res.status_code in [404, 409]

def test_delete_all_users(client):
    client.put('/user_add', json={
        "first_name": "Wipe",
        "last_name": "Me",
        "nshe": "000000001"
    })
    res = client.delete('/user_delete_all')
    assert res.status_code == 200

# ------------------ Academic Calendar Tests ------------------
def test_add_academic_event(client):
    date_str = datetime.now().strftime('%A, %B %d, %Y')
    res = client.put('/academiccalendar_add', json={
        "name": "Test Event",
        "date": date_str,
        "time": "10:00 AM",
        "location": "Building A",
        "organization": "CS Department"
    })
    assert res.status_code == 201
    assert res.json['name'] == "Test Event"

def test_duplicate_academic_event(client):
    date_str = datetime.now().strftime('%A, %B %d, %Y')
    data = {
        "name": "Duplicate Event",
        "date": date_str,
        "time": "10:00 AM",
        "location": "Building B",
        "organization": "Engineering"
    }
    client.put('/academiccalendar_add', json=data)
    res = client.put('/academiccalendar_add', json=data)
    assert res.status_code == 409

def test_add_academic_event_missing_name(client):
    res = client.put('/academiccalendar_add', json={"date": "Monday, March 17, 2025"})
    assert res.status_code == 400

def test_delete_all_academic_events(client):
    date_str = datetime.now().strftime('%A, %B %d, %Y')
    client.put('/academiccalendar_add', json={
        "name": "Clear Event",
        "date": date_str,
        "time": "5:00 PM",
        "location": "Campus",
        "organization": "Clearing House"
    })
    res = client.delete('/academiccalendar_delete_all')
    assert res.status_code == 200

# ------------------ Event Fetch Tests ------------------
def test_get_event_by_id(client):
    date_str = datetime.now().strftime('%A, %B %d, %Y')
    post = client.put('/academiccalendar_add', json={
        "name": "Fetchable Event",
        "date": date_str,
        "time": "11:00 AM",
        "location": "Zoom",
        "organization": "Online Dept"
    })
    event_id = post.json['id']
    res = client.get(f'/academiccalendar_id/{event_id}')
    assert res.status_code == 200
    assert res.json['name'] == "Fetchable Event"

# ------------------ Miscellaneous ------------------
def test_add_involvement_event_with_link(client):
    date_str = datetime.now().isoformat()
    res = client.put('/involvementcenter_add', json={
        "name": "Linked Event",
        "date": date_str,
        "time": "2:00 PM",
        "location": "Online",
        "organization": "Tech Club",
        "link": "https://example.com/event"
    })
    assert res.status_code == 201
    assert res.json['link'] == "https://example.com/event"

def test_create_organization(client):
    res = client.put('/organization_add', json={
        "name": "Cool Org",
        "type": "Club",
        "description": "We do cool stuff"
    })
    assert res.status_code == 201

def test_organization_add_duplicate(client):
    client.put('/organization_add', json={"name": "DupOrg"})
    res = client.put('/organization_add', json={"name": "DupOrg"})
    assert res.status_code == 409

def test_organization_delete_all_empty(client):
    res = client.delete('/organization_delete_all')
    assert res.status_code == 404

# ------------------ DupCheck Tests ------------------
@pytest.mark.parametrize("table_cls, date, name, time, is_dup", [
    (AcademicCalendar, "Monday, March 17, 2025", "Spring Break", "", True),
    (AcademicCalendar, "Tuesday, March 18, 2025", "Spring Break", "", False),
    (InvolvementCenter, "2025-04-01", "Club Fair", "2:00 PM", True),
    (InvolvementCenter, "2025-04-02", "Club Fair", "2:00 PM", False),
    (RebelCoverage, "09/01/2025", "Football Game", "6:00 PM", True),
    (RebelCoverage, "09/02/2025", "Football Game", "6:00 PM", False),
    (UNLVCalendar, "Friday, August 23, 2024", "Orientation", "9:00 AM", True),
    (UNLVCalendar, "Saturday, August 24, 2024", "Orientation", "9:00 AM", False)
])
def test_dupcheck_variants(app, table_cls, date, name, time, is_dup):
    with app.app_context():
        date_obj = {
            AcademicCalendar: datetime.strptime("Monday, March 17, 2025", "%A, %B %d, %Y"),
            InvolvementCenter: datetime.fromisoformat("2025-04-01"),
            RebelCoverage: datetime.strptime("09/01/2025", "%m/%d/%Y"),
            UNLVCalendar: datetime.strptime("Friday, August 23, 2024", "%A, %B %d, %Y")
        }[table_cls]

        if is_dup:
            db.session.add(table_cls(name=name, date=date_obj, time=time))
            db.session.commit()

        result = DupCheck(table_cls, date, name, time)
        if is_dup:
            assert result is False
        else:
            assert isinstance(result, datetime)