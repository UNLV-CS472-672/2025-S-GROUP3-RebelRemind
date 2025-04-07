
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
import requests
from http import HTTPStatus
import time
import os
from database import BASE # <-- Import BASE from database.py


URL = "https://involvementcenter.unlv.edu/organizations"



print("Running websraping.organizations...")

# --- Setup Selenium WebDriver ---
options = webdriver.ChromeOptions()
options.add_argument('--headless') #  run browser in the background
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--log-level=3')  # suppress non-critical Selenium logs
options.add_experimental_option('excludeSwitches', ['enable-logging']) # suppress DevTools logs

# --- Initialize WebDriver ---
driver = None # Initialize driver to None
try:
    driver = webdriver.Chrome(options=options)
except Exception as e:
    if driver:
        driver.quit()
    exit() # Exit if driver fails to initialize

# --- Load Page and Handle Dynamic Content ---
soup = None # Initialize soup to None outside the try block
try:
    driver.get(URL)
    wait = WebDriverWait(driver, 15)

    click_count = 0
    while True:
        try:
            load_more_button_xpath = "//button[contains(., 'Load More')]"
            load_more_button = wait.until(EC.presence_of_element_located((By.XPATH, load_more_button_xpath)))
            driver.execute_script("arguments[0].scrollIntoView(true);", load_more_button)
            time.sleep(0.5)
            load_more_button = wait.until(EC.element_to_be_clickable((By.XPATH, load_more_button_xpath)))
            driver.execute_script("arguments[0].click();", load_more_button)
            click_count += 1
            time.sleep(2.5) # Adjust sleep time if needed

        except TimeoutException:
            break
        except NoSuchElementException:
            break
        except Exception as e:
            time.sleep(2)
            try:
                driver.find_element(By.XPATH, load_more_button_xpath)
            except NoSuchElementException:
                pass # Just break silently if it's gone after error
            break

    # --- Get final page source ---
    page_html = driver.page_source
    soup = BeautifulSoup(page_html, 'html.parser') # Assign soup here

finally:
    # --- Close the browser ---
    if driver:
        driver.quit()

# --- Extract Data ---
# Check if soup was successfully created before proceeding
if soup:
    organizations = []
    org_link_selector = '#org-search-results a[href*="/organization/"]'
    org_links = soup.select(org_link_selector)

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
            api_endpoint = BASE.strip('/') + "/organization_add"
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
