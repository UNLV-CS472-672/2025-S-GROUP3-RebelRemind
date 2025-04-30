
import requests
import json
from database import BASE

URL = "https://involvementcenter.unlv.edu/api/discovery/search/organizations?"
QUERY = "orderBy%5B0%5D=UpperName%20asc&top=9999&filter=&query=&skip=0"

def scrape():
    response = requests.get(URL+QUERY)
    json_data = response.json()
    orgs = json_data['value']
    results = []
    for org in orgs:
        org = map_event(org)
        results.append(org)
    
    # with open('scraped_Organizations.json', 'w', encoding='utf-8') as f:
    #     json.dump(results, f, indent=4)
    return results

def default():
    results = scrape()
    # PUT events into database
    for org in results:
        requests.put(BASE + "organization_add", json=org)

def map_event(org_json):
    return {
        'name': org_json['Name'],
    }

if __name__ == '__main__':
    default()
