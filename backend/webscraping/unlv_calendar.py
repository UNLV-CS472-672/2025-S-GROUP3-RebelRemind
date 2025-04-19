import requests
import json
from bs4 import BeautifulSoup
from database import BASE
import openai
# URL of the UNLV event calendar
url = "https://www.unlv.edu/calendar"

openai.api_key = ''



def ai_categorize_event(event_name):
    try:
        prompt = f"""
Given the following event title: "{event_name}"

Choose the most appropriate category from this list:
Arts, Academics, Career, Culture, Diversity, Health, Social, Sports, Tech, Community

Return only the category name.
If no category fits, return "None".
"""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an assistant that classifies event titles into categories."},
                {"role": "user", "content": prompt}
            ],
            temperature=0  # deterministic response
        )

        category = response.choices[0].message.content.strip()

        #  make sure it is in our list
        INTERESTS = [
            "Arts",
            "Academics",
            "Career",
            "Culture",
            "Diversity",
            "Health",
            "Social",
            "Sports",
            "Tech",
            "Community"
        ]

        if category in INTERESTS:
          #  print(f"[AI] Categorized '{event_name}' as '{category}'")
            return category
        else:
           # print(f"[AI] Unrecognized category for '{event_name}'. AI returned: {category}")
            return None

    except Exception as e:
        print(f"[Error] AI categorization failed for '{event_name}': {e}")
        return None
        
def default():
    # Make request inside function
    response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    index = 0
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, "html.parser")
        
        events = []  # Initialize an empty list to hold events

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
                "location": location,
                "category": None,
                "link": link
            }
            category = ai_categorize_event(title)
            event_data["category"] = category
            # Send event data to Flask API
            #api_response = requests.put(BASE + f"unlvcalendar_id/{event_id}", json=event_data)
            api_response = requests.put(BASE + f"unlvcalendar_add", json=event_data)
            # if api_response.status_code == 201:
            #     pass

            events.append(event_data)  # Add event data to the events list
          #  index += 1
          #  if index == 10:
             #   break
            
        with open('scraped_UNLVCalendar.json', 'w') as json_file:
            json.dump(events, json_file, indent=4)  # Write events as formatted JSON

    else:
        print(f"Failed to access the page. Status code: {response.status_code}")

if __name__ == "__main__":
    default()
