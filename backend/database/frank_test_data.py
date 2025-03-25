import requests

# Swap BASE comments if you want to use a local host (127.0.0.1) or persistant web host
BASE = "http://127.0.0.1:5000/"
#BASE = "http://franklopez.tech:5000/"

def default():

    # Add to user table
    response = requests.put(BASE + "user_add", json={"first_name": "Marge", "last_name": "Simpson", "nsshe": "2000444999"})
    print(response.json())
    
    # Get user info for NSSHE 2000111222
    response = requests.get(BASE + "user_get_by_nsshe/2000222999")
    print(response.json())

    # Get list of all users
    response = requests.get(BASE + "user_list")
    print(response.json())

    # Add event to table
    response = requests.put(BASE + "event_add", json={"name": "Super Bowl", "date": "Feb 2026", "time": "12:00 PM", "location": "California"})

    # Get list of all events
    response = requests.get(BASE + "event_list")
    print(response.json())

if __name__ == '__main__':
    default()