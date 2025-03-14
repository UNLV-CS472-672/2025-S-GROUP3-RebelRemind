from setuptools import setup

with open('requirements.txt', 'r', encoding='utf-8') as f:
    requirements = f.read().split('\n')

setup(
    name='backend',
    version='1.0.0',
    install_requires=requirements,
    entry_points={
        'console_scripts': [
            'involvement_center = webscraping.involvement_center:default'
        ]
    }
)