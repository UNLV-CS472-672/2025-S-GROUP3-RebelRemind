from flask import Flask
from flask_restful import Api, Resource, reqparse, abort, fields, marshal_with
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import IntegrityError

app = Flask(__name__)
api = Api(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

app.app_context()

# User Table
class UserModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	first_name = db.Column(db.String(100), nullable=False)
	last_name = db.Column(db.String(100), nullable=False)
	nsshe = db.Column(db.String(15), nullable=False, unique=True)

	def __repr__(self):
		return f"User_Info(id = {id}, first_name = {first_name}, last_name = {last_name}, nsshe = {nsshe})"
	
# Calendar Table
class CalendarModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(500), nullable=False)  # Increased size for long events
	date = db.Column(db.String(100), nullable=False)
	time = db.Column(db.String(100))
	location = db.Column(db.String(100))

	def __repr__(self):
		return f"Calendar(id={self.id}, name'{self.name}', date='{self.date}', time='{self.time}', location='{self.location}')"

# uncomment initially then leave commented to prevent data overwrite or delete
#db.create_all()

# user info
user_put_args = reqparse.RequestParser()

user_put_args.add_argument("first_name", type=str, help="First name is required", required=True)
user_put_args.add_argument("last_name", type=str, help="Last name is required", required=True)
user_put_args.add_argument("nsshe", type=str, help="NSSHE is required", required=True)

# calendar info
calendar_put_args = reqparse.RequestParser()

calendar_put_args.add_argument("name", type=str, help="Event name is required", required=True)
calendar_put_args.add_argument("date", type=str, help="Event date is required", required=True)
calendar_put_args.add_argument("time", type=str, help="Event time can be null", required=False)
calendar_put_args.add_argument("location", type=str, help="Event location can be null", required=False)


resource_fields = {
	'id': fields.Integer,
	'first_name': fields.String,
	'last_name': fields.String,
	'nsshe': fields.String
}

calendar_fields = {
	'id': fields.Integer,
	'name': fields.String,
	'date': fields.String,
	'time': fields.String,
	'location': fields.String
}

# User
class User_Get_By_NSSHE(Resource):
	@marshal_with(resource_fields)
	def get(self, nsshe):
		result = UserModel.query.filter_by(nsshe=nsshe).first()
		if not result:
			abort(404, message="Could not find user with that NSSHE")
		return result
	
class User_List(Resource):
@marshal_with(resource_fields)
	def get(self):
		result = UserModel.query.all()
		if not result:
			abort(404, message="No users found")
		return result

class User_Add(Resource):
	@marshal_with(resource_fields)
	def put(self):
		args = user_put_args.parse_args()
		try:
			user = UserModel(first_name=args['first_name'], last_name=args['last_name'], nsshe=args['nsshe'])
			db.session.add(user)
			db.session.commit()
			return user, 201
		except IntegrityError as e:
			abort(409, message=f"IntegrityError: {e}")

# Calendar
class Event_Add(Resource):
	@marshal_with(calendar_fields)
	def put(self):
		args = calendar_put_args.parse_args()
		try:
			event = CalendarModel(name=args['name'], date=args['date'], time=args['time'], location=args['location'])
			db.session.add(event)
			db.session.commit()
			return event, 201
		except IntegrityError as e:
			abort(409, message=f"IntegrityError: {e}")

class Event_List(Resource):
	@marshal_with(calendar_fields)
	def get(self):
		result = CalendarModel.query.all()
		if not result:
			abort(404, message="Table is empty")
		return result

# API calls
# Get user info by sending their NSSHE
api.add_resource(User_Get_By_NSSHE, "/user_get_by_nsshe/<string:nsshe>")
# Get list of users
api.add_resource(User_List, "/user_list")
# Put a new user.
api.add_resource(User_Add, "/user_add")
# Put a new event
api.add_resource(Event_Add, "/event_add")
# Get list of events
api.add_resource(Event_List, "/event_list")

# default function to run API
def default():
	app.run(host='0.0.0.0', port=5050, debug=False)

if __name__ == '__main__':
	with app.app_context():
		db.session.query(CalendarModel).delete()  # Delete only events
		db.session.commit()
		db.create_all()  # Ensure tables exist
		default()
