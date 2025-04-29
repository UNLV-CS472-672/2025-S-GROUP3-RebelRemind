import requests
import json
from datetime import datetime
from pytz import timezone
from database import BASE

URL = "https://involvementcenter.unlv.edu/api/discovery/event/search?"
QUERY = f"endsAfter={datetime.today()}&orderByField=endsOn&orderByDirection=ascending&status=Approved&take=9999"

def scrape():
    response = requests.get(URL+QUERY)
    json_data = response.json()
    events = json_data['value']
    results = []
    for event in events:
        event = map_event(event)
        results.append(event)
    
    # with open('scraped_InvolvementCenter.json', 'w', encoding='utf-8') as f:
    #     json.dump(results, f, indent=4)
    return results

def default():
    results = scrape()
    # PUT events into database
    for event in results:
        requests.put(BASE + "involvementcenter_add", json=event)

def map_event(event_json):
    start = event_json['startsOn']
    end = event_json['endsOn']
    # Convert to local time zone
    utc_startTime = datetime.fromisoformat(start)
    utc_endTime = datetime.fromisoformat(end)
    local_tz = timezone('America/Los_Angeles')
    local_startTime = utc_startTime.astimezone(local_tz)
    local_endTime = utc_endTime.astimezone(local_tz)
    # Strip date
    startDate = str(local_startTime.date())
    endDate = str(local_endTime.date())
    # Strip time
    startTime = str(local_startTime.strftime('%I:%M %p'))
    endTime = str(local_endTime.strftime('%I:%M %p'))

    return {
        'name': event_json['name'],
        'startDate': startDate,
        'startTime': startTime,
        'endDate': endDate,
        'endTime': endTime,
        'location': event_json['location'],
        'organization': event_json['organizationName'],
        'link': f"https://involvementcenter.unlv.edu/event/{event_json['id']}"
    }

if __name__ == '__main__':
    default()
