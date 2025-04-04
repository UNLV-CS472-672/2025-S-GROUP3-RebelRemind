import requests
import json
from datetime import datetime
from pytz import timezone
#from database import BASE
BASE = "http://127.0.0.1:5050/"

url = "https://involvementcenter.unlv.edu/api/discovery/event/search?"
query = f"endsAfter={datetime.today()}&orderByField=endsOn&orderByDirection=ascending&status=Approved&take=9999"

def default():
    response = requests.get(url+query)
    json_data = response.json()
    events = json_data['value']
    results = []
    for event in events:
        event = map_event(event)
        # PUT events into database
        response = requests.put(BASE + f"involvementcenter_add", json=event)
        results.append(event)
    
    with open('scraped_InvolvementCenter.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4)

def map_event(event_json):
    event = event_json['startsOn']
    # Convert to local time zone
    utc_time = datetime.fromisoformat(event)
    local_tz = timezone('America/Los_Angeles')
    local_time = utc_time.astimezone(local_tz)
    # Strip date
    e_date = str(local_time.date())
    # Strip time
    e_time = str(local_time.time())

    return {
        'name': event_json['name'],
        'date': e_date,
        'time': e_time,
        'location': event_json['location']
    }

if __name__ == '__main__':
    default()
