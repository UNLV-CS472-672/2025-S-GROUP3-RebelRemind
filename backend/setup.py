from setuptools import setup

with open('requirements.txt', 'r', encoding='utf-8') as f:
    requirements = f.read().split('\n')

setup(
    name='backend',
    version='1.0.0',
    install_requires=requirements,
    py_modules=['webscraping', 'database'],
    entry_points={
        'console_scripts': [
            'academic_calendar = webscraping.academic_calendar:default',
            'involvement_center = webscraping.involvement_center:default',
            'rebel_coverage = webscraping.rebel_coverage:default',
            'unlv_calendar = webscraping.unlv_calendar:default',
            'serve_data = database.serve_data:default',
            'test_data = database.test_data:default',
            'test_academicCalendar = database.test_academicCalendar:default'
        ]
    }
)
