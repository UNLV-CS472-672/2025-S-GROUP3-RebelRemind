import requests

BASE = "http://franklopez.tech:5000/"

def default():
    #response = requests.put(BASE + "user_id/2", {"first_name": "nasty", "last_name": "nate"})
    #print(response.json())

    response = requests.get(BASE + "user_id/1")
    print(response.json())

    response = requests.get(BASE + "user_id/2")
    print(response.json())

    response = requests.get(BASE + "user_id/3")
    print(response.json())

    response = requests.get(BASE + "user_list")
    print(response.json())
