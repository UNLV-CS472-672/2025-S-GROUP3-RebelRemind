import requests
import json
from bs4 import BeautifulSoup
from database import BASE

# URL of the UNLV event calendar
url = "https://www.unlv.edu/calendar"

def default():
    # Make request inside function
    response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        
        events = []  # Initialize an empty list to hold events
        event_id = 1  # Initialize event ID counter

        # Loop through each event on the page
        for event in soup.find_all("div", class_="col-sm-10"):
            title_elem = event.find("a")
            title = title_elem.text.strip() if title_elem else "No Title"
            link = "https://www.unlv.edu" + title_elem["href"] if title_elem else "No Link"

            time_elem = event.find_next_sibling("div", class_="col-sm-2")
            time = time_elem.text.strip() if time_elem else "No Time"

            location_elem = event.find_next_sibling("div", class_="col-sm-12 text-sm")
            location = location_elem.text.strip() if location_elem else "No Location"
            
            # Extract date 
            date_elem = event.find_previous("div", class_="card-header")
            date = date_elem.text.strip() if date_elem else "TBD"

            # Prepare event data to send to the Flask API
            event_data = {
                "name": title,
                "date": date,  
                "time": time,
                "location": location
            }

            # Send event data to Flask API
            api_response = requests.put(BASE + f"unlvcalendar_id/{event_id}", json=event_data)
            if api_response.status_code == 201:
                pass

            events.append(event_data)  # Add event data to the events list

            event_id += 1  # Increment event ID
        
        with open('scraped_UNLVEvents.json', 'w') as json_file:
            json.dump(events, json_file, indent=4)  # Write events as formatted JSON

    else:
        print(f"Failed to access the page. Status code: {response.status_code}")

if __name__ == "__main__":
    default()
