import requests
import json
from bs4 import BeautifulSoup
from database import BASE

url = "https://catalog.unlv.edu/content.php?catoid=47&navoid=14311"

def default():
    """
    Extracts calendar events from the UNLV catalog page using Selenium and BeautifulSoup,
    and saves the data to a JSON file.
    """
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")

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
                    calendar_data.append({"Date": date_cell, "Event": event_cell})
                    #print(date_cell, event_cell)

        # Remove the last three lines' notices
        calendar_data = calendar_data[:-3]
            
        # Write the cleaned data to the output file in JSON format
        # filename="scraped_AcademicCalendar.json"
        # with open(filename, "w", encoding="utf-8") as f:
        #     json.dump(calendar_data, f, indent=4) # indent for readability

        # PUT calendar events into the database
        calendar_id = 0
        for event in calendar_data:
            calendar_id += 1
            put_data = {
                "name": event['Event'],
                "startDate": event['Date'],
                "endDate": event['Date']
            }
            requests.put(BASE + f"academiccalendar_add", json=put_data) # Use json= for the request body

    else:
        print(f"Failed to access the page. Status code: {response.status_code}")

if __name__ == '__main__':
    default()
