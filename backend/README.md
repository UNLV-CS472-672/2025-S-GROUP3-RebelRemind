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

- Create database and launch Flask API server
```sh
   serve_data
```

- Run all webscraping scripts
```sh
   ./webscrape.sh
```

- Output events stored in database
```sh
   test_database
```

- Run pytest to test files
```sh
   python3 -m pytest --cov=webscraping --cov=database --cov=tests --cov=app
```
