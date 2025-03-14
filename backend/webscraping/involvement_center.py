from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException

from webdriver_manager.chrome import ChromeDriverManager
service = Service(ChromeDriverManager().install())
options = webdriver.ChromeOptions()
driver = webdriver.Chrome(service=service,options=options)
url = 'https://involvementcenter.unlv.edu/events'

# Open the webpage
# driver.get(url)

def involvement_center():
    # Wait for webpage to load
    try:
        element = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "react-app"))
        )

        # Click to load all events
        while True:
            try:
                load_more = driver.find_element(By.XPATH, '//span[text()="Load More"]')
                load_more.click()
            except NoSuchElementException or StaleElementReferenceException:
                break

        # Retrieve events and dates
        events = driver.find_elements(By.TAG_NAME, 'h3')
        dates = driver.find_elements(By.XPATH, '//div[@style="margin: 0px 0px 0.125rem;"]')
        del events[:5]

        # Write events and dates to file
        with open('involvement_center.txt','w') as f:
            for event, date in zip(events, dates):
                f.write(event.text + "\n" + date.text + "\n\n")
    
    except TimeoutException:
        print("Timed out waiting for the main content to load.")

# involvement_center()
# Close webpage
# driver.quit()

import requests
import json
import DateTime

query = "endsAfter=2025-03-14&orderByField=endsOn&orderByDirection=ascending&status=Approved&take=200"
url = "https://involvementcenter.unlv.edu/api/discovery/event/search?"

def default():
    response = requests.get(url+query)

    print(response.status_code)
    json_data = response.json()

    events = json_data['value']

    results = []
    for event in events:
        results.append(map_event(event))

    with open('output.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=4)

    return results

def map_event(event_json):
    return {
        'name': event_json['name'],
        'date': event_json['startsOn'],
        'location': event_json['location']
    }