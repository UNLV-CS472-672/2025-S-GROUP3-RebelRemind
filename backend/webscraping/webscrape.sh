#!/bin/bash

# List of Python scripts to run
scripts=("academic_calendar.py" "involvement_center.py" "rebel_coverage.py" "unlv_calendar.py")

# Loop through and execute each script
for script in "${scripts[@]}"; do
    echo "Running $script..."
    python3 "$script"
    if [ $? -ne 0 ]; then
        echo "Error running $script. Exiting."
        exit 1
    fi
done

echo "All scripts executed successfully."
