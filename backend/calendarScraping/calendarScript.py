import requests
from bs4 import BeautifulSoup
import pandas as pd

# URL of the UNLV event calendar
url = "https://www.unlv.edu/calendar"
response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})

# Check if the request was successful
if response.status_code == 200:
    soup = BeautifulSoup(response.text, "html.parser")

    events = []
    
    # Find all event containers
    for event in soup.find_all("div", class_="col-sm-10"):  # Adjusted selector from your HTML
        title_elem = event.find("a")  # The event title is inside an <a> tag
        title = title_elem.text.strip() if title_elem else "No Title"
        link = "https://www.unlv.edu" + title_elem["href"] if title_elem else "No Link"

        time_elem = event.find_next_sibling("div", class_="col-sm-2")  # Time in next sibling div
        time = time_elem.text.strip() if time_elem else "No Time"

        location_elem = event.find_next_sibling("div", class_="col-sm-12 text-sm")  # Location
        location = location_elem.text.strip() if location_elem else "No Location"

        events.append({"Title": title, "Time": time, "Location": location, "Link": link})

    # Convert to DataFrame for better visualization
    events_df = pd.DataFrame(events)

    with open("output.txt", "w") as file:
        file.write(events_df.to_string(index=False))

    print(events_df)

else:
    print(f"Failed to access the page. Status code: {response.status_code}")
