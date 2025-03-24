import requests
import json

BASE = "http://127.0.0.1:5050/"

def default():
    # Retrieve results obtained from webscraping
    try:
        with open('events.json', 'r', encoding='utf-8') as f:
            events = json.load(f)
    except FileNotFoundError:
        print(f"Error: events.json not found")
        return

    # PUT events into database
    id = 0
    for event in events:
        id += 1
        response = requests.put(BASE + f"event_id/{id}", event)

    # GET event list
    response = requests.get(BASE + "event_list")
    data = response.json()

    # output.json should have the same items as events.json
    with open('output.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

if __name__ == '__main__':
    default()
