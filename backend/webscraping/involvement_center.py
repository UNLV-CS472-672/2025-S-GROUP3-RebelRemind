from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
from time import sleep

options = webdriver.ChromeOptions()
driver = webdriver.Chrome(options=options)
url = 'https://involvementcenter.unlv.edu/events'

# Open the webpage
driver.get(url)

# Wait for webpage to load
try:
    element = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.ID, "react-app"))
    )
except TimeoutException:
    driver.quit()

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

# Close webpage
driver.quit()
