#!/usr/bin/env python3

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
import requests
import json
from database import BASE

def default():
    #service = Service(executable_path='./chromedriver-linux64/chromedriver')
    service = Service(ChromeDriverManager().install())

    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    driver = webdriver.Chrome(service=service, options=options)
    url = 'https://unlvrebels.com/coverage'

    # Open the webpage
    driver.get(url)

    # Wait for page to load before proceeding
    driver.implicitly_wait(0)

    table = driver.find_element(By.TAG_NAME, 'table')

    matches = table.find_elements(By.TAG_NAME, 'tr')

    # Print list of dates with their events
    weekdays = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
    data_table = []
    matches = matches[1:]

    event_date = ''

    for match in matches:
        if any(day in match.text for day in weekdays):
            #data_table.append([match.text])
            event_date = match.text
        else:
            #data_table[-1].append(match.text)
            data_table.append({"name": match.text, "date": event_date})

    #print(data_table)

    id = 0

    for i in range(len(data_table)):
        id += 1
        requests.put(BASE + f"rebelcoverage_id/{id}", json={"name": data_table[i]["name"], "date": data_table[i]["date"]})
        
    with open('scraped_RebelCoverage.json', 'w') as json_file:
        json.dump(data_table, json_file, indent=4)

    driver.quit()

if __name__ == '__main__':
    default()
