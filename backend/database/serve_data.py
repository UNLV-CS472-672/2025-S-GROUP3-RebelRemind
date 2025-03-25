"""
User and Events API Implementation
"""
from database import app, db
from flask_restful import Api, Resource, reqparse, abort, fields, marshal_with
from http import HTTPStatus

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
api = Api(app)

# Create User table for database
class User(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	first_name = db.Column(db.String(100), nullable=False)
	last_name = db.Column(db.String(100), nullable=False)
	nshe = db.Column(db.String(15), nullable=False, unique=True)

	def __repr__(self):
		return f"User(id = {self.id}, first_name = {self.first_name}, last_name = {self.last_name}, nshe = {self.nshe})"

# Create Academic Calendar table for database
class AcademicCalendar(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(500), nullable=False)
	date = db.Column(db.String(100), db.ForeignKey('daily.date'), nullable=False)
	time = db.Column(db.String(100))
	location = db.Column(db.String(100))

	def __repr__(self):
		return f"AcademicCalendar(id = {self.id}, name = {self.name}, date = {self.date}, time = {self.time}, location = {self.location})"

# Create Involvement Center table for database
class InvolvementCenter(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(500), nullable=False)
	date = db.Column(db.String(100), db.ForeignKey('daily.date'), nullable=False)
	time = db.Column(db.String(100))
	location = db.Column(db.String(100))

	def __repr__(self):
		return f"InvolvementCenter(id = {self.id}, name = {self.name}, date = {self.date}, time = {self.time}, location = {self.location})"

# Create Rebel Coverage table for database
class RebelCoverage(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(500), nullable=False)
	date = db.Column(db.String(100), db.ForeignKey('daily.date'), nullable=False)
	time = db.Column(db.String(100))
	location = db.Column(db.String(100))

	def __repr__(self):
		return f"RebelCoverage(id = {self.id}, name = {self.name}, date = {self.date}, time = {self.time}, location = {self.location})"

# Create UNLV Calendar table for database
class UNLVCalendar(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(500), nullable=False)
	date = db.Column(db.String(100), db.ForeignKey('daily.date'), nullable=False)
	time = db.Column(db.String(100))
	location = db.Column(db.String(100))

	def __repr__(self):
		return f"UNLVCalendar(id = {self.id}, name = {self.name}, date = {self.date}, time = {self.time}, location = {self.location})"

# Create Daily table for database
class Daily(db.Model):
	date = db.Column(db.String(100), primary_key=True)
	academic_calendar = db.relationship("AcademicCalendar", backref="daily", lazy=True)
	involvement_center = db.relationship("InvolvementCenter", backref="daily", lazy=True)
	rebel_coverage = db.relationship("RebelCoverage", backref="daily", lazy=True)
	unlv_calendar = db.relationship("UNLVCalendar", backref="daily", lazy=True)

# leave commented to prevent data overwrite or delete
db.create_all()

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

# Parser for Daily table
daily_put_args = reqparse.RequestParser()
daily_put_args.add_argument("date", type=str, help="Date is required", required=True)
daily_put_args.add_argument("academic_calendar", type=list, location="json")
daily_put_args.add_argument("involvement_center", type=list, location="json")
daily_put_args.add_argument("rebel_coverage", type=list, location="json")
daily_put_args.add_argument("unlv_calendar", type=list, location="json")

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
	'location': fields.String
}

# Resource fields for daily events
daily_fields = {
	'date': fields.String,
	'academic_calendar': fields.List(fields.Nested(event_fields)),
	'involvement_center': fields.List(fields.Nested(event_fields)),
	'rebel_coverage': fields.List(fields.Nested(event_fields)),
	'unlv_calendar': fields.List(fields.Nested(event_fields))
}

# Commands for User model
class User_Info(Resource):
	# GET items from User table
	@marshal_with(user_fields)
	def get(self, user_id):
		result = User.query.get(user_id)
		if not result:
			abort(HTTPStatus.NOT_FOUND, message=f"Could not find user '{user_id}'")
		return result

	# PUT items into User table
	@marshal_with(user_fields)
	def put(self, user_id):
		args = user_put_args.parse_args()
		result = User.query.get(user_id)
		if result:
			abort(HTTPStatus.CONFLICT, message="User id taken...")

		user = User(id=user_id, first_name=args['first_name'], last_name=args['last_name'], nshe=args['nshe'])
		db.session.add(user)
		db.session.commit()
		return user, HTTPStatus.CREATED

# Commands for Academic Calendar table
class AcademicCalendar_Info(Resource):
	# GET items from Academic Calendar table
	@marshal_with(event_fields)
	def get(self, event_id):
		result = AcademicCalendar.query.filter_by(id=event_id).first()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Could not find event with that id")
		return result

	# PUT items into Academic Calendar table
	@marshal_with(event_fields)
	def put(self, event_id):
		args = event_put_args.parse_args()
		result = AcademicCalendar.query.filter_by(id=event_id).first()
		if result:
			abort(HTTPStatus.CONFLICT, message="Event id taken...")

		event = AcademicCalendar(
			id=event_id,
			name=args['name'],
			date=args['date'],
			time=args.get('time'),
			location=args.get('location')
		)
		db.session.add(event)
		
		# Update or create Daily entry
		daily_entry = Daily.query.filter_by(date=args['date']).first()
		if not daily_entry:
			daily_entry = Daily(date=args['date'])
			db.session.add(daily_entry)

		daily_entry.academic_calendar.append(event)
		db.session.commit()
		return event, HTTPStatus.CREATED

# Commands for Involvement Center table
class InvolvementCenter_Info(Resource):
	# GET items from Involvement Center table
	@marshal_with(event_fields)
	def get(self, event_id):
		result = InvolvementCenter.query.filter_by(id=event_id).first()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Could not find event with that id")
		return result

	# PUT items into Involvement Center table
	@marshal_with(event_fields)
	def put(self, event_id):
		args = event_put_args.parse_args()
		result = InvolvementCenter.query.filter_by(id=event_id).first()
		if result:
			abort(HTTPStatus.CONFLICT, message="Event id taken...")

		event = InvolvementCenter(
			id=event_id,
			name=args['name'],
			date=args['date'],
			time=args.get('time'),
			location=args.get('location')
		)
		db.session.add(event)

		# Update or create Daily entry
		daily_entry = Daily.query.filter_by(date=args['date']).first()
		if not daily_entry:
			daily_entry = Daily(date=args['date'])
			db.session.add(daily_entry)

		daily_entry.involvement_center.append(event)
		db.session.commit()
		return event, HTTPStatus.CREATED

# Commands for Rebel Coverage table
class RebelCoverage_Info(Resource):
	# GET items from Rebel Coverage table
	@marshal_with(event_fields)
	def get(self, event_id):
		result = RebelCoverage.query.filter_by(id=event_id).first()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Could not find event with that id")
		return result

	# PUT items into Rebel Coverage table
	@marshal_with(event_fields)
	def put(self, event_id):
		args = event_put_args.parse_args()
		result = RebelCoverage.query.filter_by(id=event_id).first()
		if result:
			abort(HTTPStatus.CONFLICT, message="Event id taken...")

		event = RebelCoverage(
			id=event_id,
			name=args['name'],
			date=args['date'],
			time=args.get('time'),
			location=args.get('location')
		)
		db.session.add(event)
		
		# Update or create Daily entry
		daily_entry = Daily.query.filter_by(date=args['date']).first()
		if not daily_entry:
			daily_entry = Daily(date=args['date'])
			db.session.add(daily_entry)

		daily_entry.rebel_coverage.append(event)
		db.session.commit()
		return event, HTTPStatus.CREATED

# Commands for Academic Calendar table
class UNLVCalendar_Info(Resource):
	# GET items from UNLV Calendar table
	@marshal_with(event_fields)
	def get(self, event_id):
		result = UNLVCalendar.query.filter_by(id=event_id).first()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Could not find event with that id")
		return result

	# PUT items into UNLV Calendar table
	@marshal_with(event_fields)
	def put(self, event_id):
		args = event_put_args.parse_args()
		result = UNLVCalendar.query.filter_by(id=event_id).first()
		if result:
			abort(HTTPStatus.CONFLICT, message="Event id taken...")

		event = UNLVCalendar(
			id=event_id,
			name=args['name'],
			date=args['date'],
			time=args.get('time'),
			location=args.get('location')
		)
		db.session.add(event)
		
		# Update or create Daily entry
		daily_entry = Daily.query.filter_by(date=args['date']).first()
		if not daily_entry:
			daily_entry = Daily(date=args['date'])
			db.session.add(daily_entry)

		daily_entry.unlv_calendar.append(event)
		db.session.commit()
		return event, HTTPStatus.CREATED

# Commands for Daily table
class Daily_Info(Resource):
	# GET items from Daily table
	@marshal_with(daily_fields)
	def get(self, date):
		result = Daily.query.filter_by(date=date).first()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message=f"Could not find date '{date}'")
		return result
	
	# PUT items into Daily table
	@marshal_with(daily_fields)
	def put(self, date):
		data = daily_put_args.parse_args()

		# Remove any existing data for the given date
		Daily.query.filter_by(date=date).delete()

        # Process data for each table
		def add_events(table, events):
			if events:
				for event in events:
					new_event = table(
						name=event['name'],
						date=event['date'],
						time=event.get('time'),
						location=event.get('location')
                    )
					db.session.add(new_event)

		add_events(AcademicCalendar, data['academic_calendar'])
		add_events(InvolvementCenter, data['involvement_center'])
		add_events(RebelCoverage, data['rebel_coverage'])
		add_events(UNLVCalendar, data['unlv_calendar'])
        
		new_daily = Daily(date=date)
		db.session.add(new_daily)
		db.session.commit()

# List all items in User model table
class User_List(Resource):
	@marshal_with(user_fields)
	def get(self):
		result = User.query.all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

# List all items in Academic Calendar table
class AcademicCalendar_List(Resource):
	@marshal_with(event_fields)
	def get(self):
		result = AcademicCalendar.query.all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

# List all items in Involvement Center table
class InvolvementCenter_List(Resource):
	@marshal_with(event_fields)
	def get(self):
		result = InvolvementCenter.query.all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

# List all items in Rebel Coverage table
class RebelCoverage_List(Resource):
	@marshal_with(event_fields)
	def get(self):
		result = RebelCoverage.query.all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

# List all items in UNLV Calendar table
class UNLVCalendar_List(Resource):
	@marshal_with(event_fields)
	def get(self):
		result = UNLVCalendar.query.all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

# List all items in UNLV Calendar table
class Daily_List(Resource):
	@marshal_with(daily_fields)
	def get(self):
		result = Daily.query.all()
		if not result:
			abort(HTTPStatus.NOT_FOUND, message="Table is empty")
		return result

# API resources for GET/PUT commands
api.add_resource(User_Info, "/user_id/<int:user_id>")
api.add_resource(AcademicCalendar_Info, "/academiccalendar_id/<int:event_id>")
api.add_resource(InvolvementCenter_Info, "/involvementcenter_id/<int:event_id>")
api.add_resource(RebelCoverage_Info, "/rebelcoverage_id/<int:event_id>")
api.add_resource(UNLVCalendar_Info, "/unlvcalendar_id/<int:event_id>")
api.add_resource(Daily_Info, "/daily/<string:date>")

# API resources for list commands
api.add_resource(User_List, "/user_list")
api.add_resource(AcademicCalendar_List, "/academiccalendar_list")
api.add_resource(InvolvementCenter_List, "/involvementcenter_list")
api.add_resource(RebelCoverage_List, "/rebelcoverage_list")
api.add_resource(UNLVCalendar_List, "/unlvcalendar_list")
api.add_resource(Daily_List, "/daily")

# default function to run API
def default():
	app.run(host='0.0.0.0', port=5050, debug=True)

if __name__ == '__main__':
	with app.app_context():
		#db.create_all()  # Ensure tables exist
		default()
