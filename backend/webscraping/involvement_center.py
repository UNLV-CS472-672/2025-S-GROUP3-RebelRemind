import requests
import json
from datetime import datetime
from pytz import timezone

url = "https://involvementcenter.unlv.edu/api/discovery/event/search?"
query = f"endsAfter={datetime.today()}&orderByField=endsOn&orderByDirection=ascending&status=Approved&take=9999"
tz = timezone("America/Los_Angeles")

def default():
    response = requests.get(url+query)

    json_data = response.json()

    events = json_data['value']

    results = []
    for event in events:
        results.append(map_event(event))

    with open('events.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4)

def map_event(event_json):
    dt = event_json['startsOn']
    dt = datetime.strptime(dt, '%Y-%m-%dT%H:%M:%S%z').astimezone(tz)
    date = dt.strftime('%A, %B %d, %Y')
    time = dt.strftime('%I:%M %p %Z')
    return {
        'name': event_json['name'],
        'date': date,
        'time': time,
        'location': event_json['location']
    }
