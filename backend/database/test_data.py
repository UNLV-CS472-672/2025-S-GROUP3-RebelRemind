"""
Test Cases for User and Event Web Service
"""
import pytest
import requests
import json
from database import app, db
from http import HTTPStatus

# Swap BASE comments if you want to use a local host (127.0.0.1) or persistant web host
BASE = "http://127.0.0.1:5050/"
#BASE = "http://franklopez.tech:5000/"

def default():
    # GET daily list
    response = requests.get(BASE + "daily")
    data = response.json()

    with open('output.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4)

if __name__ == '__main__':
    default()
