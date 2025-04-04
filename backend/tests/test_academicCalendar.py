import requests
import json
import os
from database import BASE

def default():
    """
    Tests the Calendar API endpoints:
    1. Reads calendar data from 'events1.json'.
    2. Adds the data to the database using PUT requests.
    3. Retrieves the calendar data from the database using a GET request.
    4. Compares the data from the GET request with the original data from the JSON file.
    5. Writes the retrieved data to 'output_calendar.json'.
    """
    # Construct the path to the calendar_events.json file
    script_directory = os.path.dirname(os.path.abspath(__file__))  # Get the directory of the current script
    webscraping_directory = os.path.join(script_directory, '..', 'webscraping')  # Go back one directory and into "webscraping"
    calendar_file_path = os.path.join(webscraping_directory, 'calendar_events.json')

    # Retrieve calendar data from JSON
    try:
        with open('calendar_events.json', 'r', encoding='utf-8') as f:
            calendar_events = json.load(f)
    except FileNotFoundError:
        print(f"Error: calendar_events.json not found")
        return

    # PUT calendar events into the database
    calendar_id = 0
    for event in calendar_events:
        calendar_id += 1
        put_data = {
            "name": event['Event'],
            "date": event['Date']
        }
        response = requests.put(BASE + f"academiccalendar_id/{calendar_id}", json=put_data) # Use json= for the request body

        if response.status_code != 201:
            print(f"Error adding event {calendar_id}: {response.status_code} - {response.text}")
            return

    # GET calendar list
    response = requests.get(BASE + "academiccalendar_list")
    if response.status_code != 200:
        print(f"Error getting calendar list: {response.status_code} - {response.text}")
        return

    retrieved_data = response.json()

    # Write the retrieved data to 'output_calendar.json'
    with open('output_calendar.json', 'w', encoding='utf-8') as f:
        json.dump(retrieved_data, f, indent=4)

    # Compare retrieved data with original data (optional)
    print("Testing if the database and the json file match")
    if len(retrieved_data) != len(calendar_events):
        print("Error: Number of items in database does not match number of items in json file.")
    else:
        for i in range(len(calendar_events)):
            # Ensure that the fields matches
            if retrieved_data[i]['name'] != calendar_events[i]['Event'] or retrieved_data[i]['date'] != calendar_events[i]['Date']:
                print("Error: Data in the database does not match data in the json file.")
                break
        else:
            print("Great! The calendar matches the JSON file!")

if __name__ == '__main__':
    default()
