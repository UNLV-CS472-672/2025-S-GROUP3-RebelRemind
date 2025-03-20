#!/usr/bin/env python3

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

#service = Service(executable_path='./chromedriver-linux64/chromedriver')
service = Service(ChromeDriverManager().install())

options = webdriver.ChromeOptions()
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

for match in matches:
    if any(day in match.text for day in weekdays):
        data_table.append([match.text])
    else:
        data_table[-1].append(match.text)

for i in range(len(data_table)):
    print(data_table[i])

driver.quit()

#TODO Put data into the database backend
