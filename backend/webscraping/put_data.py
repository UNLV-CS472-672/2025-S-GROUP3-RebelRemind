import requests

#BASE = "http://127.0.0.1:5050/"
BASE = "http://franklopez.tech:5050/"

date = '2025-03-31'

# DAILY
response = requests.get(BASE + f"academiccalendar_daily/{date}")
print(response.json())

response = requests.get(BASE + f"involvementcenter_daily/{date}")
print(response.json())

response = requests.get(BASE + f"rebelcoverage_daily/{date}")
print(response.json())

response = requests.get(BASE + f"unlvcalendar_daily/{date}")
print(response.json())

# # Academic Calendar
response = requests.get(BASE + f"academiccalendar_list")
print(response.json())

# response = requests.delete(BASE + f"academiccalendar_delete_all")
# print(response.json())

# response = requests.get(BASE + f"academiccalendar_list")
# print(response.json())

# # Involvement Center
response = requests.get(BASE + f"involvementcenter_list")
print(response.json())

# response = requests.delete(BASE + f"involvementcenter_delete_all")
# print(response.json())

# response = requests.get(BASE + f"involvementcenter_list")
# print(response.json())

# # Rebel Coverage
response = requests.get(BASE + f"rebelcoverage_list")
print(response.json())

# response = requests.delete(BASE + f"rebelcoverage_delete_all")
# print(response.json())

# response = requests.get(BASE + f"rebelcoverage_list")
# print(response.json())

# # UNLV Calendar
response = requests.get(BASE + f"unlvcalendar_list")
print(response.json())

# response = requests.delete(BASE + f"unlvcalendar_delete_all")
# print(response.json())

# response = requests.get(BASE + f"unlvcalendar_list")
# print(response.json())

# User
# response = requests.put(BASE + f"user_add", json={"first_name": "Frank", "last_name": "Lopez", "nshe": "2000815810"})
# print(response.json())

# response = requests.put(BASE + f"user_add", json={"first_name": "Frank", "last_name": "Lopez", "nshe": "2000815810"})
# print(response.json())

# response = requests.get(BASE + f"user_id/2000815810")
# print(response.json())

# response = requests.get(BASE + f"user_list")
# print(response.json())

# response = requests.delete(BASE + f"user_delete/2000815810")
# print(response.json())

# response = requests.get(BASE + f"user_list")
# print(response.json())

