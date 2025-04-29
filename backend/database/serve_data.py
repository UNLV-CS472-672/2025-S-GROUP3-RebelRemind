"""
User and Events API Implementation
"""
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource, reqparse, abort, fields, marshal_with
from http import HTTPStatus
from datetime import datetime, timedelta
from sqlalchemy import func, and_
import sys
sys.path.append("/home/frank/webscrapers")
import academic_calendar, involvement_center, rebel_coverage, unlv_calendar # , organizations

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
api = Api(app)
db = SQLAlchemy(app)

def format_time(base_time):
    if not base_time:
        return ""
    formatted_time = ""
    colon_pos = 0
    am_pm_pos = 0
    base_time = base_time.upper()

    # for (All Day), TBA, or non time
    all_char = True
    for i in range(len(base_time)):
        if base_time[i].isnumeric():
            all_char = False
    if all_char:
        return base_time
    
    colon_pos = base_time.find(":")

    # for 8:30 pm and 17:15:00 military time formats
    if colon_pos > 0:
        # for military format
        if base_time[colon_pos + 2:].find(":") > 0:
            if int(base_time[:colon_pos]) < 12:
                formatted_time = base_time[:colon_pos + 3] + " AM"
                # midnight
                if formatted_time[:2] == "00":
                    formatted_time = "12" + formatted_time[2:]
            else:
                if int(base_time[:colon_pos]) > 12:
                    pm_time = str(int(base_time[:colon_pos]) % 12)
                else:
                    pm_time = "12"
                formatted_time = pm_time + base_time[colon_pos:colon_pos + 3]
                formatted_time = formatted_time + " PM"
            colon_pos = formatted_time.find(":")
            formatted_time = str(int(formatted_time[:colon_pos])) + formatted_time[colon_pos:]
            return formatted_time
        # for 8:30 pm format
        formatted_time = base_time[:colon_pos + 3]
        am_pm_pos = base_time.find("A")
        if am_pm_pos > 0:
            formatted_time = formatted_time + " AM"
        am_pm_pos = base_time.find("P")
        if am_pm_pos > 0:
            formatted_time = formatted_time + " PM"
        colon_pos = formatted_time.find(":")
        formatted_time = str(int(formatted_time[:colon_pos])) + formatted_time[colon_pos:]
        return formatted_time
    
    # for 11 am format
    if colon_pos == -1:
        for i in range(len(base_time)):
            if not base_time[i].isnumeric():
                formatted_time = base_time[:i] + ":00"
                break   
        for i in range(len(base_time)):
            is_alpha = base_time[i].isalpha()
            if is_alpha:
                if base_time[i] == "A":
                    formatted_time = formatted_time + " AM"
                if base_time[i] == "P":
                    formatted_time = formatted_time + " PM"
                break
        colon_pos = formatted_time.find(":")
        formatted_time = str(int(formatted_time[:colon_pos])) + formatted_time[colon_pos:]
        return formatted_time

def DupCheck(table, date, name, time = ''):
    if time:
        time = format_time(time)
    # Academic Calendar
    if table == AcademicCalendar:
        # Format date from string into date object
        fmt='%A, %B %d, %Y'
        date_object = datetime.strptime(date, fmt)
        # Check if event exists already
        result = db.session.query(table).filter(and_(table.date == func.date(date_object), table.name == name)).all()

    # Involvement Center
    if table == InvolvementCenter:
        # Format date from string into date object
        date_object = datetime.fromisoformat(date)
        # Check if event exists already
        result = db.session.query(table).filter(and_(table.date == func.date(date_object), table.name == name, table.time == time)).all()

    # Rebel Coverage
    if table == RebelCoverage:
        # Format date from string into date object
        fmt="%m/%d/%Y"
        # Convert string to datetime object
        date_object = datetime.strptime(date, fmt)
        # Check if event exists already
        result = db.session.query(table).filter(and_(table.date == func.date(date_object), table.name == name, table.time == time)).all()

    # UNLV Calendar
    if table == UNLVCalendar:
        # Format date from string into date object
        fmt='%A, %B %d, %Y'
        date_object = datetime.strptime(date, fmt)
        # Check if event exists already
        result = db.session.query(table).filter(and_(table.date == func.date(date_object), table.name == name, table.time == time)).all()

    # Check if event exists already
    if result:
        return False
    return date_object

# Create User table for database
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    nshe = db.Column(db.String(15), nullable=False, unique=True)

    def __repr__(self):
        return ("User("
                    f"id = {self.id}," +
                    f"first_name = {self.first_name}," +
                    f"last_name = {self.last_name}," +
                    f"nshe = {self.nshe})")

# Create Academic Calendar table for database
class AcademicCalendar(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(100))
    location = db.Column(db.String(100))
    organization = db.Column(db.String(100))

    def __repr__(self):
        return ("AcademicCalendar(" +
                    f"id = {self.id},"
                    f"name = {self.name}," +
                    f"date = {self.date}," +
                    f"time = {self.time}," +
                    f"location = {self.location}," +
                    f"organization = {self.organization})")

# Create Involvement Center table for database
class InvolvementCenter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(100))
    location = db.Column(db.String(100))
    organization = db.Column(db.String(100))
    link = db.Column(db.String(100))

    def __repr__(self):
        return ("InvolvementCenter(" +
                    f"id = {self.id},"
                    f"name = {self.name}," +
                    f"date = {self.date}," +
                    f"time = {self.time}," +
                    f"location = {self.location}," +
                    f"organization = {self.organization}," +
                    f"link = {self.link})")
    
# Create Rebel Coverage table for database
class RebelCoverage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(100))
    location = db.Column(db.String(100))
    sport = db.Column(db.String(100))
    link = db.Column(db.String(100))

    def __repr__(self):
        return ("RebelCoverage(" +
					f"id = {self.id},"
					f"name = {self.name}," +
					f"date = {self.date}," +
					f"time = {self.time}," +
					f"location = {self.location}," +
					f"sport = {self.sport}," +
                    f"link = {self.link})")

# Create UNLV Calendar table for database
class UNLVCalendar(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.String(100))
    location = db.Column(db.String(100))
    link = db.Column(db.String(100))
    category = db.Column(db.String(100)) # Renamed from organization

    def __repr__(self):
        return ("UNLVCalendar(" +
                    f"id = {self.id},"
                    f"name = {self.name}," +
                    f"date = {self.date}," +
                    f"time = {self.time}," +
                    f"location = {self.location}," +
                    f"category = {self.category}," + # Updated repr
                    f"link = {self.link})")

# Create Organization table for database
class Organization(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(500), nullable=False, unique=True)

    def __repr__(self):
        return ("Organization(" +
                    f"id = {self.id},"
                    f"name = {self.name})")

# Parser for User table
user_put_args = reqparse.RequestParser()
user_put_args.add_argument("first_name", type=str, help="First name is required", required=True)
user_put_args.add_argument("last_name", type=str, help="Last name is required", required=True)
user_put_args.add_argument("nshe", type=str, help="NSHE is required", required=True)

# Parser for Event table
event_put_args = reqparse.RequestParser()
event_put_args.add_argument("name", type=str, help="Event name is required", required=True)
event_put_args.add_argument("date", type=str, help="Event date is required", required=True)
event_put_args.add_argument("time", type=str, help="Event time can be null", required=False)
event_put_args.add_argument("location", type=str, help="Event location can be null", required=False)
event_put_args.add_argument("organization", type=str, help="Event organization can be null", required=False)
event_put_args.add_argument("category", type=str, help="Event category can be null (UNLV Calendar)", required=False) # Added category
event_put_args.add_argument("link", type=str, help="Event link can be null", required=False)

# Parser for Rebel Coverage table
rebel_put_args = reqparse.RequestParser()
rebel_put_args.add_argument("name", type=str, help="Event name is required", required=True)
rebel_put_args.add_argument("date", type=str, help="Event date is required", required=True)
rebel_put_args.add_argument("time", type=str, help="Event time can be null", required=False)
rebel_put_args.add_argument("location", type=str, help="Event location can be null", required=False)
rebel_put_args.add_argument("sport", type=str, help="Sport can be null", required=False)
rebel_put_args.add_argument("link", type=str, help="Event link can be null", required=False)

# Parser for Organization table
organization_put_args = reqparse.RequestParser()
organization_put_args.add_argument("name", type=str, help="Organization name is required", required=True)

# Resource fields for User model
user_fields = {
    'id': fields.Integer,
    'first_name': fields.String,
    'last_name': fields.String,
    'nshe': fields.String
}

# Resource fields for Event model
event_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'date': fields.String,
    'time': fields.String,
    'location': fields.String,
    'organization': fields.String, # Keep for other models
    'category': fields.String,     # Add for UNLV Calendar
    'link' : fields.String
}

# Resource fields for Rebel Coverage model
rebel_fields = {
	'id': fields.Integer,
	'name': fields.String,
	'date': fields.String,
	'time': fields.String,
	'location': fields.String,
	'sport': fields.String,
    'link' : fields.String
}

# Resource fields for Organization model
organization_fields = {
    'id': fields.Integer,
    'name': fields.String,
}

# Commands for User model
class User_Info(Resource):
    # GET item from User table
    @marshal_with(user_fields)
    def get(self, nshe):
        result = User.query.filter_by(nshe=nshe).first()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message=f"Could not find nshe '{nshe}'")
        return result

class User_Add(Resource):
    # PUT item into User table
    @marshal_with(user_fields)
    def put(self):
        args = user_put_args.parse_args()
        # Check if exists
        result = User.query.filter_by(nshe = args['nshe']).all()
        if result:
            abort(HTTPStatus.CONFLICT, message="NSHE taken...")
        user = User(first_name=args['first_name'], last_name=args['last_name'], nshe=args['nshe'])
        db.session.add(user)
        db.session.commit()
        return user, HTTPStatus.CREATED

class User_Delete(Resource):
    # DELETE item from User table
    @marshal_with(user_fields)
    def delete(self, nshe):
        result = db.session.query(User).filter(User.nshe == nshe).delete()
        if not result:
            abort(HTTPStatus.CONFLICT, message="NSHE not found")
        db.session.commit()
        # Return the count of deleted items, or a message
        # Since marshal_with expects a model instance or list, direct count might not work well.
        # Returning a message might be more appropriate for DELETE operations.
        return jsonify(message=f"Deleted {result} user(s) with NSHE {nshe}.")


class User_Delete_All(Resource):
    # DELETE all items from user table
    # @marshal_with(user_fields) # marshal_with is less suitable for bulk delete confirmation
    def delete(self):
        result = User.query.delete()
        db.session.commit()
        if not result:
            # abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.") # Or just return success if 0 deleted is ok
            return jsonify(message="User table already empty or deletion failed."), HTTPStatus.OK
        return jsonify(message=f"Deleted {result} users."), HTTPStatus.OK

# Commands for Academic Calendar table
class AcademicCalendar_Info(Resource):
    # GET items from Academic Calendar table
    @marshal_with(event_fields)
    def get(self, event_id):
        result = AcademicCalendar.query.filter_by(id=event_id).first()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Could not find event with that id")
        return result

class AcademicCalendar_Add(Resource):
    # PUT items into Academic Calendar table
    @marshal_with(event_fields)
    def put(self):
        args = event_put_args.parse_args()
        date_object = DupCheck(AcademicCalendar, args['date'], args['name'])
        if not date_object:
            abort(HTTPStatus.CONFLICT, message="Event already exists...")

        event = AcademicCalendar(
            name=args['name'],
            date=date_object,
            time=args.get('time'),
            location=args.get('location'),
            organization=args.get('organization')
        )
        db.session.add(event)
        db.session.commit()
        return event, HTTPStatus.CREATED

class AcademicCalendar_Delete_Past(Resource):
    # DELETE past items from Academic Calendar table
    # @marshal_with(event_fields) # Less suitable for bulk delete confirmation
    def get(self):
        delete_count = db.session.query(AcademicCalendar).filter(AcademicCalendar.date < (datetime.now().date())).delete()
        db.session.commit()
        # if not delete_count:
            # abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
            # return jsonify(message="No past Academic Calendar events found to delete."), HTTPStatus.OK
        # return jsonify(message=f"Deleted {delete_count} past Academic Calendar events."), HTTPStatus.OK

class AcademicCalendar_Delete_All(Resource):
    # DELETE all items from Academic Calendar table
    # @marshal_with(event_fields) # Less suitable for bulk delete confirmation
    def delete(self):
        delete_count = AcademicCalendar.query.delete()
        db.session.commit()
        if not delete_count:
            # abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
            return jsonify(message="Academic Calendar table already empty or deletion failed."), HTTPStatus.OK
        return jsonify(message=f"Deleted {delete_count} Academic Calendar events."), HTTPStatus.OK


# Commands for Involvement Center table
class InvolvementCenter_Info(Resource):
    # GET items from Involvement Center table
    @marshal_with(event_fields)
    def get(self, event_id):
        result = InvolvementCenter.query.filter_by(id=event_id).first()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Could not find event with that id")
        return result

class InvolvementCenter_Add(Resource):
    # PUT items into Involvement Center table
    @marshal_with(event_fields)
    def put(self):
        args = event_put_args.parse_args()
        date_object = DupCheck(InvolvementCenter, args['date'], args['name'], args['time'])
        if not date_object:
            abort(HTTPStatus.CONFLICT, message="Event already exists...")

        event = InvolvementCenter(
            name=args['name'],
            date=date_object,
            time=format_time(args['time']), # Assuming time is required based on DupCheck usage
            location=args.get('location'),
            organization=args.get('organization'),
            link=args.get('link')
        )
        db.session.add(event)
        db.session.commit()
        return event, HTTPStatus.CREATED

class InvolvementCenter_Delete_Past(Resource):
    # DELETE past items from Involvement Center table
    # @marshal_with(event_fields) # Less suitable for bulk delete confirmation
    def get(self):
        delete_count = db.session.query(InvolvementCenter).filter(InvolvementCenter.date < (datetime.now().date())).delete()
        db.session.commit()
        # if not delete_count:
            # abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
            # return jsonify(message="No past Involvement Center events found to delete."), HTTPStatus.OK
        # return jsonify(message=f"Deleted {delete_count} past Involvement Center events."), HTTPStatus.OK

class InvolvementCenter_Delete_All(Resource):
    # DELETE all items from Involvement Center table
    # @marshal_with(event_fields) # Less suitable for bulk delete confirmation
    def delete(self):
        delete_count = InvolvementCenter.query.delete()
        db.session.commit()
        if not delete_count:
            # abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
            return jsonify(message="Involvement Center table already empty or deletion failed."), HTTPStatus.OK
        return jsonify(message=f"Deleted {delete_count} Involvement Center events."), HTTPStatus.OK


# Commands for Rebel Coverage table
class RebelCoverage_Info(Resource):
	# GET items from Rebel Coverage table
	@marshal_with(rebel_fields)
	def get(self, event_id):
		result = RebelCoverage.query.filter_by(id=event_id).first()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Could not find event with that id")
		return result

class RebelCoverage_Add(Resource):
	# PUT items into Rebel Coverage table
	@marshal_with(rebel_fields)
	def put(self):
		args = rebel_put_args.parse_args()
		#print(args)
		date_object = DupCheck(RebelCoverage, args['date'], args['name'], args['time'])
		if not date_object:
			abort(HTTPStatus.CONFLICT, message="Event already exists...")

		event = RebelCoverage(
			name=args['name'],
			date=date_object,
			time=format_time(args.get('time')),
			location=args.get('location'),
			sport=args.get('sport'),
            link=args.get('link')
		)
		db.session.add(event)
		db.session.commit()
		return event, HTTPStatus.CREATED

class RebelCoverage_Delete_Past(Resource):
	# GET items from Rebel Coverage table
	@marshal_with(rebel_fields)
	def get(self):
		result = db.session.query(RebelCoverage).filter(RebelCoverage.date < (datetime.now().date())).delete()
		db.session.commit()
		# if not result:
			# abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
		# return result

class RebelCoverage_Delete_All(Resource):
	# GET items from Rebel Coverage table
	@marshal_with(rebel_fields)
	def delete(self):
		result = RebelCoverage.query.delete()
		db.session.commit()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
		return result

# Commands for UNLV Calendar table
class UNLVCalendar_Info(Resource):
    # GET items from UNLV Calendar table
    @marshal_with(event_fields)
    def get(self, event_id):
        result = UNLVCalendar.query.filter_by(id=event_id).first()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Could not find event with that id")
        return result

class UNLVCalendar_Add(Resource):
    # PUT items into UNLV Calendar table
    @marshal_with(event_fields)
    def put(self):
        args = event_put_args.parse_args()
        date_object = DupCheck(UNLVCalendar, args['date'], args['name'], args['time'])
        if not date_object:
            abort(HTTPStatus.CONFLICT, message="Event already exists...")

        event = UNLVCalendar(
            name=args['name'],
            date=date_object,
            time=format_time(args.get('time')),
            location=args.get('location'),
            category=args.get('category'), # Use category from args
            link=args.get('link')
        )
        db.session.add(event)
        db.session.commit()
        return event, HTTPStatus.CREATED

class UNLVCalendar_Delete_Past(Resource):
    # DELETE past items from UNLV Calendar table
    # @marshal_with(event_fields) # Less suitable for bulk delete confirmation
    def get(self):
        delete_count = db.session.query(UNLVCalendar).filter(UNLVCalendar.date < (datetime.now().date())).delete()
        db.session.commit()
        # if not delete_count:
            # abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
            # return jsonify(message="No past UNLV Calendar events found to delete."), HTTPStatus.OK
        # return jsonify(message=f"Deleted {delete_count} past UNLV Calendar events."), HTTPStatus.OK

class UNLVCalendar_Delete_All(Resource):
    # DELETE all items from UNLV Calendar table
    # @marshal_with(event_fields) # Less suitable for bulk delete confirmation
    def delete(self):
        delete_count = UNLVCalendar.query.delete()
        db.session.commit()
        if not delete_count:
            # abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
            return jsonify(message="UNLV Calendar table already empty or deletion failed."), HTTPStatus.OK
        return jsonify(message=f"Deleted {delete_count} UNLV Calendar events."), HTTPStatus.OK

# Commands for Organization table
class Organization_Add(Resource):
    # PUT item into Organization table
    @marshal_with(organization_fields)
    def put(self):
        args = organization_put_args.parse_args()
        result = Organization.query.filter_by(name=args['name']).first()
        if result:
            abort(HTTPStatus.CONFLICT, message=f"Organization with name {args['name']} already exists.")
        organization = Organization(
            name=args['name']
        )
        db.session.add(organization)
        db.session.commit()
        return organization, HTTPStatus.CREATED

class Organization_Delete_All(Resource):
    # @marshal_with(organization_fields) # Less suitable for bulk delete confirmation
    def delete(self):
        delete_count = Organization.query.delete()
        db.session.commit()
        if not delete_count:
            # abort(HTTPStatus.NOT_FOUND, message="Organization table is already empty or deletion failed.")
            return jsonify(message="Organization table already empty or deletion failed."), HTTPStatus.OK
        return jsonify(message=f"Deleted {delete_count} organizations."), HTTPStatus.OK

# List all items in User model table
class User_List(Resource):
    @marshal_with(user_fields)
    def get(self):
        # Corrected order_by usage for multiple columns
        result = User.query.order_by(User.last_name.asc(), User.first_name.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="User table is empty")
        return result

# List all items in Academic Calendar table
class AcademicCalendar_List(Resource):
    @marshal_with(event_fields)
    def get(self):
        result = AcademicCalendar.query.order_by(AcademicCalendar.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Academic Calendar table is empty")
        return result

# List all items in Involvement Center table
class InvolvementCenter_List(Resource):
    @marshal_with(event_fields)
    def get(self):
        result = InvolvementCenter.query.order_by(InvolvementCenter.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Involvement Center table is empty")
        return result

# List all items in Rebel Coverage table
class RebelCoverage_List(Resource):
	@marshal_with(rebel_fields)
	def get(self):
		result = RebelCoverage.query.order_by(RebelCoverage.date.asc()).all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

# List all items in UNLV Calendar table
class UNLVCalendar_List(Resource):
    @marshal_with(event_fields)
    def get(self):
        result = UNLVCalendar.query.order_by(UNLVCalendar.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="UNLV Calendar table is empty")
        return result

# List all items in Organization table
class Organization_List(Resource):
    @marshal_with(organization_fields)
    def get(self):
        result = Organization.query.order_by(Organization.name.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Organization table is empty")
        return result

# DAILY LISTS
# List daily items in Academic Calendar table
class AcademicCalendar_Daily(Resource):
    @marshal_with(event_fields)
    def get(self, date):
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            abort(HTTPStatus.BAD_REQUEST, message="Invalid date format. Please use YYYY-MM-DD.")
        result = AcademicCalendar.query.filter_by(date=target_date).order_by(AcademicCalendar.date.asc()).all() # order_by might be redundant here
        if not result:
            abort(HTTPStatus.NOT_FOUND, message=f"No Academic Calendar events found for date {date}")
        return result

class AcademicCalendar_Weekly(Resource):
    @marshal_with(event_fields)
    def get(self, date):
        try:
            start_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            abort(HTTPStatus.BAD_REQUEST, message="Invalid start date format. Please use YYYY-MM-DD.")
        end_date = start_date + timedelta(days=7)
        result = db.session.query(AcademicCalendar).filter(
            AcademicCalendar.date >= start_date,
            AcademicCalendar.date < end_date # Use < end_date for a 7-day range including start_date
        ).order_by(AcademicCalendar.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message=f"No Academic Calendar events found for the week starting {date}")
        return result

class AcademicCalendar_Monthly(Resource):
    @marshal_with(event_fields)
    def get(self, month):
        # Validate month format (YYYY-MM)
        try:
            datetime.strptime(month, "%Y-%m")
        except ValueError:
             abort(HTTPStatus.BAD_REQUEST, message="Invalid month format. Please use YYYY-MM.")
        # Use func.strftime which is database-agnostic for simple cases like this
        result = db.session.query(AcademicCalendar).filter(func.strftime("%Y-%m", AcademicCalendar.date) == month).order_by(AcademicCalendar.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message=f"No Academic Calendar events found for month {month}")
        return result

# List daily items in Involvement Center table
class InvolvementCenter_Daily(Resource):
    @marshal_with(event_fields)
    def get(self, date):
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            abort(HTTPStatus.BAD_REQUEST, message="Invalid date format. Please use YYYY-MM-DD.")
        result = InvolvementCenter.query.filter_by(date=target_date).order_by(InvolvementCenter.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message=f"No Involvement Center events found for date {date}")
        return result

class InvolvementCenter_Weekly(Resource):
    @marshal_with(event_fields)
    def get(self, date):
        try:
            start_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            abort(HTTPStatus.BAD_REQUEST, message="Invalid start date format. Please use YYYY-MM-DD.")
        end_date = start_date + timedelta(days=7)
        result = db.session.query(InvolvementCenter).filter(
            InvolvementCenter.date >= start_date,
            InvolvementCenter.date < end_date
        ).order_by(InvolvementCenter.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message=f"No Involvement Center events found for the week starting {date}")
        return result

class InvolvementCenter_Monthly(Resource):
    @marshal_with(event_fields)
    def get(self, month):
        try:
            datetime.strptime(month, "%Y-%m")
        except ValueError:
             abort(HTTPStatus.BAD_REQUEST, message="Invalid month format. Please use YYYY-MM.")
        result = db.session.query(InvolvementCenter).filter(func.strftime("%Y-%m", InvolvementCenter.date) == month).order_by(InvolvementCenter.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message=f"No Involvement Center events found for month {month}")
        return result

# List daily items in Rebel Coverage table
class RebelCoverage_Daily(Resource):
	@marshal_with(rebel_fields)
	def get(self, date):
		result = RebelCoverage.query.filter_by(date = date).order_by(RebelCoverage.date.asc()).all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

class RebelCoverage_Weekly(Resource):
    @marshal_with(rebel_fields)
    def get(self, date):
        try:
            start_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            abort(HTTPStatus.BAD_REQUEST, message="Invalid start date format. Please use YYYY-MM-DD.")
        end_date = start_date + timedelta(days=7)
        result = db.session.query(RebelCoverage).filter(
            RebelCoverage.date >= start_date,
            RebelCoverage.date < end_date
        ).order_by(RebelCoverage.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message=f"No Rebel Coverage events found for the week starting {date}")
        return result

class RebelCoverage_Monthly(Resource):
    @marshal_with(rebel_fields)
    def get(self, month):
        try:
            datetime.strptime(month, "%Y-%m")
        except ValueError:
             abort(HTTPStatus.BAD_REQUEST, message="Invalid month format. Please use YYYY-MM.")
        result = db.session.query(RebelCoverage).filter(func.strftime("%Y-%m", RebelCoverage.date) == month).order_by(RebelCoverage.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message=f"No Rebel Coverage events found for month {month}")
        return result

# List daily items in UNLV Calendar table
class UNLVCalendar_Daily(Resource):
    @marshal_with(event_fields)
    def get(self, date):
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            abort(HTTPStatus.BAD_REQUEST, message="Invalid date format. Please use YYYY-MM-DD.")
        result = UNLVCalendar.query.filter_by(date=target_date).order_by(UNLVCalendar.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message=f"No UNLV Calendar events found for date {date}")
        return result

class UNLVCalendar_Weekly(Resource):
    @marshal_with(event_fields)
    def get(self, date):
        try:
            start_date = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            abort(HTTPStatus.BAD_REQUEST, message="Invalid start date format. Please use YYYY-MM-DD.")
        end_date = start_date + timedelta(days=7)
        result = db.session.query(UNLVCalendar).filter(
            UNLVCalendar.date >= start_date,
            UNLVCalendar.date < end_date
        ).order_by(UNLVCalendar.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message=f"No UNLV Calendar events found for the week starting {date}")
        return result

class UNLVCalendar_Monthly(Resource):
    @marshal_with(event_fields)
    def get(self, month):
        try:
            datetime.strptime(month, "%Y-%m")
        except ValueError:
             abort(HTTPStatus.BAD_REQUEST, message="Invalid month format. Please use YYYY-MM.")
        result = db.session.query(UNLVCalendar).filter(func.strftime("%Y-%m", UNLVCalendar.date) == month).order_by(UNLVCalendar.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message=f"No UNLV Calendar events found for month {month}")
        return result
    
# Clear ALL data
class Database_Delete_All(Resource):
	# DELETE ALL DATA FROM DATABASE
	def get(self):
		User.query.delete()
		AcademicCalendar.query.delete()
		InvolvementCenter.query.delete()
		RebelCoverage.query.delete()
		UNLVCalendar.query.delete()
		Organization.query.delete()
		db.session.commit()
		return HTTPStatus.OK

# Scrape All Sites
class Scrape_All(Resource):
	# SCRAPE ALL SITES
	def get(self):
		academic_calendar.default()
		involvement_center.default()
		rebel_coverage.default()
		# unlv_calendar.default() # this has AI that costs money per scrape so leaving out
		# organizations.default()
		return HTTPStatus.OK

# API resources for PUT commands
api.add_resource(User_Add, "/user_add")
api.add_resource(AcademicCalendar_Add, "/academiccalendar_add")
api.add_resource(InvolvementCenter_Add, "/involvementcenter_add")
api.add_resource(RebelCoverage_Add, "/rebelcoverage_add")
api.add_resource(UNLVCalendar_Add, "/unlvcalendar_add")
api.add_resource(Organization_Add, "/organization_add")

# API resource for DELETE commands
api.add_resource(User_Delete, "/user_delete/<string:nshe>")
api.add_resource(User_Delete_All, "/user_delete_all")
api.add_resource(AcademicCalendar_Delete_All, "/academiccalendar_delete_all")
api.add_resource(AcademicCalendar_Delete_Past, "/academiccalendar_delete_past")
api.add_resource(InvolvementCenter_Delete_All, "/involvementcenter_delete_all")
api.add_resource(InvolvementCenter_Delete_Past, "/involvementcenter_delete_past")
api.add_resource(RebelCoverage_Delete_All, "/rebelcoverage_delete_all")
api.add_resource(RebelCoverage_Delete_Past, "/rebelcoverage_delete_past")
api.add_resource(UNLVCalendar_Delete_All, "/unlvcalendar_delete_all")
api.add_resource(UNLVCalendar_Delete_Past, "/unlvcalendar_delete_past")
api.add_resource(Organization_Delete_All, "/organization_delete_all")

# API resources for GET commands (by ID)
api.add_resource(User_Info, "/user_id/<string:nshe>")
api.add_resource(AcademicCalendar_Info, "/academiccalendar_id/<int:event_id>")
api.add_resource(InvolvementCenter_Info, "/involvementcenter_id/<int:event_id>")
api.add_resource(RebelCoverage_Info, "/rebelcoverage_id/<int:event_id>")
api.add_resource(UNLVCalendar_Info, "/unlvcalendar_id/<int:event_id>")

# API resources for list commands (all items)
api.add_resource(User_List, "/user_list")
api.add_resource(AcademicCalendar_List, "/academiccalendar_list")
api.add_resource(InvolvementCenter_List, "/involvementcenter_list")
api.add_resource(RebelCoverage_List, "/rebelcoverage_list")
api.add_resource(UNLVCalendar_List, "/unlvcalendar_list")
api.add_resource(Organization_List, "/organization_list")

# API resources for DAILY GET commands (by date YYYY-MM-DD)
api.add_resource(AcademicCalendar_Daily, "/academiccalendar_daily/<string:date>")
api.add_resource(InvolvementCenter_Daily, "/involvementcenter_daily/<string:date>")
api.add_resource(RebelCoverage_Daily, "/rebelcoverage_daily/<string:date>")
api.add_resource(UNLVCalendar_Daily, "/unlvcalendar_daily/<string:date>")

# API resources for WEEKLY GET commands (by start date YYYY-MM-DD)
api.add_resource(AcademicCalendar_Weekly, "/academiccalendar_weekly/<string:date>")
api.add_resource(InvolvementCenter_Weekly, "/involvementcenter_weekly/<string:date>")
api.add_resource(RebelCoverage_Weekly, "/rebelcoverage_weekly/<string:date>")
api.add_resource(UNLVCalendar_Weekly, "/unlvcalendar_weekly/<string:date>")

# API resources for MONTHLY GET commands (by month YYYY-MM)
api.add_resource(AcademicCalendar_Monthly, "/academiccalendar_monthly/<string:month>")
api.add_resource(InvolvementCenter_Monthly, "/involvementcenter_monthly/<string:month>")
api.add_resource(RebelCoverage_Monthly, "/rebelcoverage_monthly/<string:month>")
api.add_resource(UNLVCalendar_Monthly, "/unlvcalendar_monthly/<string:month>")

# API resource for DELETE ALL DATA
api.add_resource(Database_Delete_All, "/database_delete_all")

# API resource for SCRAPE ALL
api.add_resource(Scrape_All, "/scrape_all")

# default function to run API
def default():
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5050, debug=True)

if __name__ == '__main__':
    default()