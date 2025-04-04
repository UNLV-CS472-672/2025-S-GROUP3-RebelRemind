"""
User and Events API Implementation
"""
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource, reqparse, abort, fields, marshal_with
from http import HTTPStatus
from datetime import datetime, timedelta
from sqlalchemy import func, and_

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
api = Api(app)
db = SQLAlchemy(app)

def DupCheck(table, date, name, time = ''):
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
		# print(date_object.date())
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
		#print(f'result DUP: {result}')
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

	def __repr__(self):
		return ("InvolvementCenter(" +
					f"id = {self.id},"
					f"name = {self.name}," +
					f"date = {self.date}," +
					f"time = {self.time}," +
					f"location = {self.location}," +
					f"organization = {self.organization})")

# Create Rebel Coverage table for database
class RebelCoverage(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(500), nullable=False)
	date = db.Column(db.Date, nullable=False)
	time = db.Column(db.String(100))
	location = db.Column(db.String(100))
	organization = db.Column(db.String(100))

	def __repr__(self):
		return ("RebelCoverage(" +
					f"id = {self.id},"
					f"name = {self.name}," +
					f"date = {self.date}," +
					f"time = {self.time}," +
					f"location = {self.location}," +
					f"organization = {self.organization})")

# Create UNLV Calendar table for database
class UNLVCalendar(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(500), nullable=False)
	date = db.Column(db.Date, nullable=False)
	time = db.Column(db.String(100))
	location = db.Column(db.String(100))
	organization = db.Column(db.String(100))

	def __repr__(self):
		return ("UNLVCalendar(" +
					f"id = {self.id},"
					f"name = {self.name}," +
					f"date = {self.date}," +
					f"time = {self.time}," +
					f"location = {self.location}," +
					f"organization = {self.organization})")

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
	'organization': fields.String
}

# Commands for User model
class User_Info(Resource):
	# GET item from User table
	@marshal_with(user_fields)
	def get(self, nshe):
		result = User.query.filter_by(nshe=nshe).first()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message=f"Could not find date '{nshe}'")
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
		return result
	
class User_Delete_All(Resource):
	# DELETE all items from user table
	@marshal_with(event_fields)
	def delete(self):
		result = User.query.delete()
		db.session.commit()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
		return result

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
		#print(args)
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
	# GET items from Rebel Coverage table
	@marshal_with(event_fields)
	def delete(self):
		result = db.session.query(AcademicCalendar).filter(AcademicCalendar.date < (datetime.now().date())).delete()
		db.session.commit()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
		return result

class AcademicCalendar_Delete_All(Resource):
	# GET items from Rebel Coverage table
	@marshal_with(event_fields)
	def delete(self):
		result = AcademicCalendar.query.delete()
		db.session.commit()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
		return result

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
	# PUT items into Academic Calendar table
	@marshal_with(event_fields)
	def put(self):
		args = event_put_args.parse_args()
		#print(args)
		date_object = DupCheck(InvolvementCenter, args['date'], args['name'], args['time'])
		if not date_object:
			abort(HTTPStatus.CONFLICT, message="Event already exists...")

		event = InvolvementCenter(
			name=args['name'],
			date=date_object,
			time=args['time'],
			location=args.get('location'),
			organization=args.get('organization')
		)
		db.session.add(event)
		db.session.commit()
		return event, HTTPStatus.CREATED

class InvolvementCenter_Delete_Past(Resource):
	# GET items from Involvement Center table
	@marshal_with(event_fields)
	def delete(self):
		result = db.session.query(InvolvementCenter).filter(InvolvementCenter.date < (datetime.now().date())).delete()
		db.session.commit()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
		return result

class InvolvementCenter_Delete_All(Resource):
	# GET items from Involvement Center table
	@marshal_with(event_fields)
	def delete(self):
		result = InvolvementCenter.query.delete()
		db.session.commit()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
		return result

# Commands for Rebel Coverage table
class RebelCoverage_Info(Resource):
	# GET items from Rebel Coverage table
	@marshal_with(event_fields)
	def get(self, event_id):
		result = RebelCoverage.query.filter_by(id=event_id).first()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Could not find event with that id")
		return result

class RebelCoverage_Add(Resource):
	# PUT items into Rebel Coverage table
	@marshal_with(event_fields)
	def put(self):
		args = event_put_args.parse_args()
		#print(args)
		date_object = DupCheck(RebelCoverage, args['date'], args['name'], args['time'])
		if not date_object:
			abort(HTTPStatus.CONFLICT, message="Event already exists...")

		event = RebelCoverage(
			name=args['name'],
			date=date_object,
			time=args.get('time'),
			location=args.get('location'),
			organization=args.get('organization')
		)
		db.session.add(event)
		db.session.commit()
		return event, HTTPStatus.CREATED

class RebelCoverage_Delete_Past(Resource):
	# GET items from Rebel Coverage table
	@marshal_with(event_fields)
	def delete(self):
		result = db.session.query(RebelCoverage).filter(RebelCoverage.date < (datetime.now().date())).delete()
		db.session.commit()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
		return result

class RebelCoverage_Delete_All(Resource):
	# GET items from Rebel Coverage table
	@marshal_with(event_fields)
	def delete(self):
		result = RebelCoverage.query.delete()
		db.session.commit()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
		return result

# Commands for Academic Calendar table
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
		#print(args)
		date_object = DupCheck(UNLVCalendar, args['date'], args['name'], args['time'])
		if not date_object:
			abort(HTTPStatus.CONFLICT, message="Event already exists...")

		event = UNLVCalendar(
			name=args['name'],
			date=date_object,
			time=args.get('time'),
			location=args.get('location'),
			organization=args.get('organization')
		)
		db.session.add(event)
		db.session.commit()
		return event, HTTPStatus.CREATED
	
class UNLVCalendar_Delete_Past(Resource):
	# GET items from Rebel Coverage table
	@marshal_with(event_fields)
	def delete(self):
		result = db.session.query(UNLVCalendar).filter(UNLVCalendar.date < (datetime.now().date())).delete()
		db.session.commit()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
		return result

class UNLVCalendar_Delete_All(Resource):
	# GET items from Rebel Coverage table
	@marshal_with(event_fields)
	def delete(self):
		result = UNLVCalendar.query.delete()
		db.session.commit()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Nothing to delete.")
		return result

# List all items in User model table
class User_List(Resource):
	@marshal_with(user_fields)
	def get(self):
		result = User.query.order_by(and_(User.last_name.asc()), User.first_name.asc()).all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

# List all items in Academic Calendar table
class AcademicCalendar_List(Resource):
	@marshal_with(event_fields)
	def get(self):
		result = AcademicCalendar.query.order_by(AcademicCalendar.date.asc()).all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

# List all items in Involvement Center table
class InvolvementCenter_List(Resource):
	@marshal_with(event_fields)
	def get(self):
		result = InvolvementCenter.query.order_by(InvolvementCenter.date.asc()).all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

# List all items in Rebel Coverage table
class RebelCoverage_List(Resource):
	@marshal_with(event_fields)
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
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

# DAILY LISTS
# List daily items in Academic Calendar table
class AcademicCalendar_Daily(Resource):
	@marshal_with(event_fields)
	def get(self, date):
		result = AcademicCalendar.query.filter_by(date = date).order_by(AcademicCalendar.date.asc()).all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

class AcademicCalendar_Weekly(Resource):
    @marshal_with(event_fields)
    def get(self, date):
        start_date = datetime.strptime(date, "%Y-%m-%d").date()
        end_date = start_date + timedelta(days=7)
        result = db.session.query(AcademicCalendar).filter(
            AcademicCalendar.date >= start_date,
            AcademicCalendar.date < end_date
        ).order_by(AcademicCalendar.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Table is empty")
        return result

class AcademicCalendar_Monthly(Resource):
    @marshal_with(event_fields)
    def get(self, month):
        result = db.session.query(AcademicCalendar).filter(func.strftime("%Y-%m", AcademicCalendar.date) == month).order_by(AcademicCalendar.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Table is empty")
        return result

# List all items in Involvement Center table
class InvolvementCenter_Daily(Resource):
	@marshal_with(event_fields)
	def get(self, date):
		result = InvolvementCenter.query.filter_by(date = date).order_by(InvolvementCenter.date.asc()).all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

class InvolvementCenter_Weekly(Resource):
    @marshal_with(event_fields)
    def get(self, date):
        start_date = datetime.strptime(date, "%Y-%m-%d").date()
        end_date = start_date + timedelta(days=7)
        result = db.session.query(InvolvementCenter).filter(
            InvolvementCenter.date >= start_date,
            InvolvementCenter.date < end_date
        ).order_by(InvolvementCenter.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Table is empty")
        return result

class InvolvementCenter_Monthly(Resource):
    @marshal_with(event_fields)
    def get(self, month):
        result = db.session.query(InvolvementCenter).filter(func.strftime("%Y-%m", InvolvementCenter.date) == month).order_by(InvolvementCenter.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Table is empty")
        return result

# List all items in Rebel Coverage table
class RebelCoverage_Daily(Resource):
	@marshal_with(event_fields)
	def get(self, date):
		result = RebelCoverage.query.filter_by(date = date).order_by(RebelCoverage.date.asc()).all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

class RebelCoverage_Weekly(Resource):
    @marshal_with(event_fields)
    def get(self, date):
        start_date = datetime.strptime(date, "%Y-%m-%d").date()
        end_date = start_date + timedelta(days=7)
        result = db.session.query(RebelCoverage).filter(
            RebelCoverage.date >= start_date,
            RebelCoverage.date < end_date
        ).order_by(RebelCoverage.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Table is empty")
        return result

class RebelCoverage_Monthly(Resource):
    @marshal_with(event_fields)
    def get(self, month):
        result = db.session.query(RebelCoverage).filter(func.strftime("%Y-%m", RebelCoverage.date) == month).order_by(RebelCoverage.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Table is empty")
        return result

# List all items in UNLV Calendar table
class UNLVCalendar_Daily(Resource):
	@marshal_with(event_fields)
	def get(self, date):
		result = UNLVCalendar.query.filter_by(date = date).order_by(UNLVCalendar.date.asc()).all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

class UNLVCalendar_Weekly(Resource):
    @marshal_with(event_fields)
    def get(self, date):
        start_date = datetime.strptime(date, "%Y-%m-%d").date()
        end_date = start_date + timedelta(days=7)
        result = db.session.query(UNLVCalendar).filter(
            UNLVCalendar.date >= start_date,
            UNLVCalendar.date < end_date
        ).order_by(UNLVCalendar.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Table is empty")
        return result

class UNLVCalendar_Monthly(Resource):
    @marshal_with(event_fields)
    def get(self, month):
        result = db.session.query(UNLVCalendar).filter(func.strftime("%Y-%m", UNLVCalendar.date) == month).order_by(UNLVCalendar.date.asc()).all()
        if not result:
            abort(HTTPStatus.NOT_FOUND, message="Table is empty")
        return result

# API resources for PUT commands
api.add_resource(User_Add, "/user_add")
api.add_resource(AcademicCalendar_Add, "/academiccalendar_add")
api.add_resource(InvolvementCenter_Add, "/involvementcenter_add")
api.add_resource(RebelCoverage_Add, "/rebelcoverage_add")
api.add_resource(UNLVCalendar_Add, "/unlvcalendar_add")

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

# API resources for GET commands
api.add_resource(User_Info, "/user_id/<string:nshe>")
api.add_resource(AcademicCalendar_Info, "/academiccalendar_id/<int:event_id>")
api.add_resource(InvolvementCenter_Info, "/involvementcenter_id/<int:event_id>")
api.add_resource(RebelCoverage_Info, "/rebelcoverage_id/<int:event_id>")
api.add_resource(UNLVCalendar_Info, "/unlvcalendar_id/<int:event_id>")

# API resources for list commands
api.add_resource(User_List, "/user_list")
api.add_resource(AcademicCalendar_List, "/academiccalendar_list")
api.add_resource(InvolvementCenter_List, "/involvementcenter_list")
api.add_resource(RebelCoverage_List, "/rebelcoverage_list")
api.add_resource(UNLVCalendar_List, "/unlvcalendar_list")

# API resources for DAILY GET commands
api.add_resource(AcademicCalendar_Daily, "/academiccalendar_daily/<string:date>")
api.add_resource(InvolvementCenter_Daily, "/involvementcenter_daily/<string:date>")
api.add_resource(RebelCoverage_Daily, "/rebelcoverage_daily/<string:date>")
api.add_resource(UNLVCalendar_Daily, "/unlvcalendar_daily/<string:date>")

# API resources for WEEKLY GET commands
api.add_resource(AcademicCalendar_Weekly, "/academiccalendar_weekly/<string:date>")
api.add_resource(InvolvementCenter_Weekly, "/involvementcenter_weekly/<string:date>")
api.add_resource(RebelCoverage_Weekly, "/rebelcoverage_weekly/<string:date>")
api.add_resource(UNLVCalendar_Weekly, "/unlvcalendar_weekly/<string:date>")

# API resources for MONTHLY GET commands
api.add_resource(AcademicCalendar_Monthly, "/academiccalendar_monthly/<string:month>")
api.add_resource(InvolvementCenter_Monthly, "/involvementcenter_monthly/<string:month>")
api.add_resource(RebelCoverage_Monthly, "/rebelcoverage_monthly/<string:month>")
api.add_resource(UNLVCalendar_Monthly, "/unlvcalendar_monthly/<string:month>")

# default function to run API
def default():
	with app.app_context():
		db.create_all()
		app.run(host='0.0.0.0', port=5050, debug=True)

if __name__ == '__main__':
	default()
