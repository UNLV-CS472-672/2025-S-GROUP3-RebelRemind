from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
from webdriver_manager.chrome import ChromeDriverManager

def default(filename="academicCalendar.txt"):
    """
    Extracts calendar events from the UNLV catalog page using Selenium and BeautifulSoup,
    adding "Date:" and "Event:" prefixes.
    """
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service)
    url = "https://catalog.unlv.edu/content.php?catoid=47&navoid=14311"

    try:
        driver.get(url)

        # Wait for the main content to load
        WebDriverWait(driver, 60).until(
            EC.presence_of_element_located((By.CLASS_NAME, "block_content"))
        )

        # Get the HTML source code from Selenium
        html_content = driver.page_source

        # Use BeautifulSoup to parse the HTML
        soup = BeautifulSoup(html_content, 'html.parser')

        # Find the main content area containing the calendar
        main_content_div = soup.find('td', class_='block_content', colspan='2')

        if not main_content_div:
            print("Main content area not found.")
            return

        # Extract all tables within the main content
        tables = main_content_div.find_all('table', border='1')

        calendar_data = []
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) == 2:  # Ensure it's a date/event row
                    date_cell = cells[0].text.strip()
                    event_cell = cells[1].text.strip()
                    calendar_data.append(f"Date: {date_cell}\nEvent: {event_cell}")

        # Remove the last three lines' notices
        calendar_data = calendar_data[:-3]

        # Write the cleaned data to the output file
        with open(filename, "w", encoding="utf-8") as f:
            for item in calendar_data:
                f.write(item + "\n\n")  # Added extra newline for readability

        print(f"Calendar data written to {filename}")

    except TimeoutException:
        print("Timed out waiting for the main content to load.")
    except NoSuchElementException:
        print("Element not found. Check the XPATH selector.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        driver.quit()
