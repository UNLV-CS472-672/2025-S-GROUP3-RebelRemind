from flask import Flask, jsonify, request
import json
from datetime import datetime, timedelta
from collections import defaultdict
import os

app = Flask(__name__)

# --- Utilities ---

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%A, %B %d, %Y")
    except ValueError:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            return None

def format_week_range(date_obj):
    week_start = date_obj - timedelta(days=date_obj.weekday())
    week_end = week_start + timedelta(days=6)

    if week_start.year != week_end.year:
        return f"{week_start.strftime('%b %d, %Y')} – {week_end.strftime('%b %d, %Y')}"
    elif week_start.month != week_end.month:
        return f"{week_start.strftime('%b %d')} – {week_end.strftime('%b %d, %Y')}"
    else:
        return f"{week_start.strftime('%b %d')} – {week_end.strftime('%d, %Y')}"

# --- Extractors ---

def extract_academic_calendar_events(filepath, source_name, weekly_grouped):
    with open(filepath, 'r') as f:
        data = json.load(f)

    for entry in data:
        raw_date = entry.get("Date")
        event = entry.get("Event")
        date_obj = parse_date(raw_date)
        if date_obj:
            week_key = format_week_range(date_obj)
            weekly_grouped[week_key][source_name].append({
                "date": date_obj.strftime("%Y-%m-%d"),
                "event": event
            })

def extract_unlv_calendar_events(filepath, source_name, weekly_grouped):
    with open(filepath, 'r') as f:
        data = json.load(f)

    for entry in data:
        raw_date = entry.get("date")
        event = entry.get("name")
        time = entry.get("time")
        location = entry.get("location")
        date_obj = parse_date(raw_date)
        if date_obj:
            week_key = format_week_range(date_obj)
            weekly_grouped[week_key][source_name].append({
                "date": date_obj.strftime("%Y-%m-%d"),
                "event": event,
                "time": time,
                "location": location.strip() if location else ""
            })

def extract_involvement_center_events(filepath, source_name, weekly_grouped):
    with open(filepath, 'r') as f:
        data = json.load(f)

    for entry in data:
        raw_date = entry.get("date")
        event = entry.get("name")
        time = entry.get("time")
        location = entry.get("location")
        date_obj = parse_date(raw_date)
        if date_obj:
            week_key = format_week_range(date_obj)
            weekly_grouped[week_key][source_name].append({
                "date": date_obj.strftime("%Y-%m-%d"),
                "event": event,
                "time": time,
                "location": location.strip() if location else ""
            })

# --- Main Route ---

@app.route('/calendar-events', methods=['GET'])
def get_combined_events():
    weekly_grouped = defaultdict(lambda: defaultdict(list))

    # Filepaths
    base_path = os.path.join("..", "webscraping")
    academic_file = os.path.join(base_path, "calendar_events.json")
    unlv_file = os.path.join(base_path, "scraped_UNLVEvents.json")
    involvement_file = os.path.join(base_path, "events.json")

    try:
        extract_academic_calendar_events(academic_file, "Academic Calendar", weekly_grouped)
        extract_unlv_calendar_events(unlv_file, "UNLV Calendar", weekly_grouped)
        extract_involvement_center_events(involvement_file, "Involvement Center", weekly_grouped)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return jsonify({"error": f"File error: {str(e)}"}), 500

    return jsonify(weekly_grouped), 200


@app.route('/calendar-events/by-week', methods=['GET'])
def get_events_by_week():
    start_date_str = request.headers.get('start-date')
    if not start_date_str:
        return jsonify({"error": "Missing 'start-date' header"}), 400

    date_obj = parse_date(start_date_str)
    if not date_obj:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD or 'Monday, March 25, 2025'"}), 400

    week_key = format_week_range(date_obj)
    weekly_grouped = defaultdict(lambda: defaultdict(list))

    # Filepaths
    base_path = os.path.join("..", "webscraping")
    academic_file = os.path.join(base_path, "calendar_events.json")
    unlv_file = os.path.join(base_path, "scraped_UNLVEvents.json")
    involvement_file = os.path.join(base_path, "events.json")

    try:
        extract_academic_calendar_events(academic_file, "Academic Calendar", weekly_grouped)
        extract_unlv_calendar_events(unlv_file, "UNLV Calendar", weekly_grouped)
        extract_involvement_center_events(involvement_file, "Involvement Center", weekly_grouped)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return jsonify({"error": f"File error: {str(e)}"}), 500

    events = weekly_grouped.get(week_key, {})
    return jsonify({week_key: events}), 200

# --- Run ---

if __name__ == '__main__':
    app.run(debug=True)
