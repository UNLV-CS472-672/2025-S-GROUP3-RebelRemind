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

def format_day(date_obj):
    return date_obj.strftime("%Y-%m-%d")

# --- Extractors ---

def extract_events(filepath, source_name, weekly_grouped, daily_grouped):
    with open(filepath, 'r') as f:
        data = json.load(f)

    for entry in data:
        raw_date = entry.get("date") or entry.get("Date")
        event = entry.get("name") or entry.get("Event")
        time = entry.get("time")
        location = entry.get("location")
        date_obj = parse_date(raw_date)
        if date_obj:
            week_key = format_week_range(date_obj)
            day_key = format_day(date_obj)
            event_data = {
                "date": date_obj.strftime("%Y-%m-%d"),
                "event": event,
                "time": time,
                "location": location.strip() if location else ""
            }
            weekly_grouped[week_key][source_name].append(event_data)
            daily_grouped[day_key][source_name].append(event_data)

# --- Routes ---

@app.route('/calendar-events', methods=['GET'])
def get_combined_events():
    weekly_grouped = defaultdict(lambda: defaultdict(list))
    daily_grouped = defaultdict(lambda: defaultdict(list))

    base_path = ".."

    event_files = [
        ("calendar_events.json", "Academic Calendar"),
        ("scraped_UNLVEvents.json", "UNLV Calendar"),
        ("events.json", "Involvement Center")
    ]

    try:
        for filename, source_name in event_files:
            extract_events(os.path.join(base_path, filename), source_name, weekly_grouped, daily_grouped)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return jsonify({"error": f"File error: {str(e)}"}), 500

    return jsonify({"weekly": weekly_grouped, "daily": daily_grouped}), 200

@app.route('/calendar-events/by-week', methods=['GET'])
def get_events_by_week():
    start_date_str = request.args.get('start-date') or request.headers.get('start-date')
    if not start_date_str:
        return jsonify({"error": "Missing 'start-date' parameter"}), 400

    date_obj = parse_date(start_date_str)
    if not date_obj:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD or 'Monday, March 25, 2025'"}), 400

    week_key = format_week_range(date_obj)
    weekly_grouped = defaultdict(lambda: defaultdict(list))
    daily_grouped = defaultdict(lambda: defaultdict(list))

    base_path = ".."

    event_files = [
        ("calendar_events.json", "Academic Calendar"),
        ("scraped_UNLVEvents.json", "UNLV Calendar"),
        ("events.json", "Involvement Center")
    ]

    try:
        for filename, source_name in event_files:
            extract_events(os.path.join(base_path, filename), source_name, weekly_grouped, daily_grouped)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return jsonify({"error": f"File error: {str(e)}"}), 500

    return jsonify({week_key: weekly_grouped.get(week_key, {})}), 200

@app.route('/calendar-events/by-day', methods=['GET'])
def get_events_by_day():
    date_str = request.args.get('date') or request.headers.get('date')
    if not date_str:
        return jsonify({"error": "Missing 'date' parameter"}), 400

    date_obj = parse_date(date_str)
    if not date_obj:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD or 'Monday, March 25, 2025'"}), 400

    day_key = format_day(date_obj)
    weekly_grouped = defaultdict(lambda: defaultdict(list))
    daily_grouped = defaultdict(lambda: defaultdict(list))

    base_path = ".."

    event_files = [
        ("calendar_events.json", "Academic Calendar"),
        ("scraped_UNLVEvents.json", "UNLV Calendar"),
        ("events.json", "Involvement Center")
    ]

    try:
        for filename, source_name in event_files:
            extract_events(os.path.join(base_path, filename), source_name, weekly_grouped, daily_grouped)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        return jsonify({"error": f"File error: {str(e)}"}), 500

    return jsonify({day_key: daily_grouped.get(day_key, {})}), 200

# --- Run ---

def default():
    app.run(port=5000, debug=True)

if __name__ == '__main__':
    default()
