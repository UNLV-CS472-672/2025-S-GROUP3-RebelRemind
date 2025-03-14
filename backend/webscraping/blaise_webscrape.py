from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time

# setup the web driver
from webdriver_manager.chrome import ChromeDriverManager
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service)


url = "https://catalog.unlv.edu/content.php?catoid=47&navoid=14311"

# get URL
driver.get(url)

def extract_calendar_data(filename="academicCalendar.txt"):
    try:
        # wait for content to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "acalog-page-title"))
        )

        # find main content
        main_content = driver.find_element(By.XPATH, "//td[@class='block_content' and @colspan='2']")

        # extract text
        text_content = main_content.text

        # write to file
        with open(filename, "w", encoding="utf-8") as f:
            f.write(text_content)

        print(f"Calendar data written to {filename}")

    except TimeoutException:
        print("Timed out waiting for the main content to load.")
    except Exception as e:
        print(f"An error occurred: {e}")

extract_calendar_data()
driver.quit()
