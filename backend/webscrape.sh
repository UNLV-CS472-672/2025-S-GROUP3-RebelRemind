#!/bin/bash

# Path to the folder containing Python scripts
SCRIPT_DIR="webscraping"

# List of Python modules to run (without .py extension)
scripts=("academic_calendar" "involvement_center" "rebel_coverage" "unlv_calendar")

# Loop through and execute each module
for script in "${scripts[@]}"; do
    echo "Running $SCRIPT_DIR.$script..."
    python3 -m "$SCRIPT_DIR.$script"
    if [ $? -ne 0 ]; then
        echo "Error running $SCRIPT_DIR.$script. Exiting."
        exit 1
    fi
done

echo "All scripts executed successfully."
