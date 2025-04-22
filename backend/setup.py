from setuptools import setup

with open('requirements.txt', 'r', encoding='utf-8') as f:
    requirements = f.read().split('\n')

setup(
    name='backend',
    version='1.0.0',
    install_requires=requirements,
    py_modules=['webscraping', 'database', 'tests'],
    entry_points={
        'console_scripts': [
            'academic_calendar = webscraping.academic_calendar:default',
            'involvement_center = webscraping.involvement_center:default',
            'organizations = webscraping.organizations:default',
            'rebel_coverage = webscraping.rebel_coverage:default',
            'unlv_calendar = webscraping.unlv_calendar:default',
            'serve_data = database.serve_data:default',
            'test_academicCalendar = tests.test_academicCalendar:default',
            'test_involvementCenter = tests.test_involvementCenter:default',
            'test_organizations = tests.test_organizations:default',
            'test_rebelCoverage = tests.test_rebelCoverage:default',
            'test_serveData = tests.test_serveData:default',
            'test_unlvCalendar = tests.test_unlvCalendar:default'
        ]
    }
)
