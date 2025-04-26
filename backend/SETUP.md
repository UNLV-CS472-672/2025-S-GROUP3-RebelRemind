# How to Setup Backend Environment

## Installing dependencies

- Make sure you are in backend directory
```sh
   cd backend
```

- Install virtual environment, if not done so already
```sh
   python3 -m venv venv
```

- Activate virtual environment
```sh
   source venv/Scripts/activate
```

- Install all packages and requirements
```sh
   pip install -e .
```

## Running Scripts

- Create database and launch Flask API server on localhost
```sh
   serve_data
```

- Run all webscraping scripts
```sh
   ./webscrape.sh
```

- Show events stored in database
  - http://localhost:5050/academiccalendar_list
  - http://localhost:5050/involvementcenter_list
  - http://localhost:5050/rebelcoverage_list
  - http://localhost:5050/unlvcalendar_list
  - http://localhost:5050/organization_list

- Run pytest to test files
```sh
   pytest
```
