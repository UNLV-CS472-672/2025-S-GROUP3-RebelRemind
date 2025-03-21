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

- Run corresponding webscraping script
```sh
   academic_calendar
   involvement_center
   rebel_coverage
   unlv_calendar
```

- Create database and launch Flask API server
```sh
   serve_data
```

- Test database
```sh
   test_data
```
