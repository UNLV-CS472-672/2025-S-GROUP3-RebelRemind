import requests
import json
from bs4 import BeautifulSoup

# from database import BASE
BASE = "http://127.0.0.1:5050/"
url = 'https://unlvrebels.com/coverage'

def default():
    response = requests.get(url)
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
            if any(day in item.upper() for day in weekdays):
                event_date = trunc_item
            else:
                if time.find('td'):
                    time = time.find('td').text
                else:
                    time = 0
                data_table.append({"name": item, "date": event_date, "time": time, "sport": sport})

        for i in range(len(data_table)):
            requests.put(BASE + f"rebelcoverage_add", json={"name": data_table[i]["name"], "date": data_table[i]["date"], "time": data_table[i]["time"], "sport": data_table[i]["sport"]})
        
        # with open('scraped_RebelCoverage.json', 'w') as json_file:
        #     json.dump(data_table, json_file, indent=4)

    else:
        print(f"Failed to access the page. Status code: {response.status_code}")

if __name__ == '__main__':
    default()