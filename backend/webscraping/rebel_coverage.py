import requests
import json
from bs4 import BeautifulSoup
from database import BASE

URL = 'https://unlvrebels.com/coverage'

def scrape():
    response = requests.get(URL)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        # Get the main table
        table = soup.find_all('table')[0]
        # Get the rows
        data = table.find_all('tr')[1:]
        # Print list of dates with their events
        weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
        data_table = []

        event_date = ''

        for item in data:
            # get the sport type
            if item.find_all("td", class_="hide-on-medium-down"):
                sport = item.find_all("td", class_="hide-on-medium-down")[0].text
            time = item
            item = item.find('th').text
            dist = item.find('\n', 1)
            trunc_item = item[dist:].replace('\n','')
            item = item.replace('\n','', 0)
            item = item.replace('\n',' ')

            link_tag = time.find('a', href=True)
            link = link_tag['href'] if link_tag else None

            if any(day in item.upper() for day in weekdays):
                event_date = trunc_item
            else:
                if time.find('td'):
                    time = time.find('td').text
                else:
                    time = 0
                data_table.append({
                    "name": item,
                    "startDate": event_date,
                    "startTime": time,
                    "endDate": event_date,
                    "sport": sport,
                    "link": link
                })

        # with open('scraped_RebelCoverage.json', 'w') as json_file:
        #     json.dump(data_table, json_file, indent=4)
        return data_table
    else:
        print(f"Failed to access the page. Status code: {response.status_code}")

def default():
    results = scrape()
    # PUT events into database
    for event in results:
        requests.put(BASE + "rebelcoverage_add", json=event)

if __name__ == '__main__':
    default()
