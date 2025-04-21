
import requests
import json
from http import HTTPStatus
from database import BASE # <-- Import BASE from database.py

URL = "https://involvementcenter.unlv.edu/api/discovery/search/organizations?"
QUERY = "orderBy%5B0%5D=UpperName%20asc&top=9999&filter=&query=&skip=0"

print("Running websraping.organizations...")
def default():
    response = requests.get(URL+QUERY)
    json_data = response.json()
    orgs = json_data['value']
    results = []
    for org in orgs:
        org = map_event(org)
        # PUT events into database
        response = requests.put(BASE + f"organization_add", json=org)
        results.append(org)
    
    with open('scraped_Organizations.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4)

        # --- Extract Data ---
    # Check if soup was successfully created before proceeding
    if results:
        organizations = []
        org_link_selector = '#org-search-results a[href*="/organization/"]'
        org_links = results.select(org_link_selector)

        if not org_links:
            pass # No links found, do nothing
        else:
            for link_element in org_links:
                name_selector = 'div[style*="font-weight: 600"]'
                name_tag = link_element.select_one(name_selector)
                if name_tag:
                    org_name = name_tag.get_text(strip=True)
                    if org_name:
                        organizations.append(org_name)

        # --- Process and Send Data to API ---
        if organizations:
            unique_organizations = sorted(list(set(organizations)))

            added_count = 0
            conflict_count = 0
            error_count = 0

            for org_name in unique_organizations:
                api_endpoint = BASE + "organization_add"
                payload = {"name": org_name}
                try:
                    response = requests.put(api_endpoint, json=payload, timeout=10)
                    if response.status_code == HTTPStatus.CREATED:
                        added_count += 1
                    elif response.status_code == HTTPStatus.CONFLICT:
                        conflict_count += 1
                    else:
                        error_count += 1
                except requests.exceptions.RequestException as e:
                    error_count += 1

            pass # End of the 'if organizations' block, do nothing if no orgs found or after processing
    else:
        pass # Do nothing if soup wasn't created

def map_event(org_json):
    return {
        'name': org_json['Name'],
    }

if __name__ == '__main__':
    default()
