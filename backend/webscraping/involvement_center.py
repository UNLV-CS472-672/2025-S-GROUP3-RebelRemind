import requests
from datetime import datetime
from pytz import timezone
from database import BASE

url = "https://involvementcenter.unlv.edu/api/discovery/event/search?"
query = f"endsAfter={datetime.today()}&orderByField=endsOn&orderByDirection=ascending&status=Approved&take=9999"
tz = timezone("America/Los_Angeles")

def default():
    response = requests.get(url+query)

    json_data = response.json()

    events = json_data['value']

    results = []
    id = 0
    
    for event in events:
        id += 1
        event = map_event(event)
        # PUT events into database
        response = requests.put(BASE + f"involvementcenter_id/{id}", event)
        results.append(event)

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

if __name__ == '__main__':
    default()
