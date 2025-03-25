from flask import Flask
from flask_restful import Api, Resource, reqparse, abort, fields, marshal_with
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
api = Api(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

# Create User model table for database
class UserModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	first_name = db.Column(db.String(100), nullable=False)
	last_name = db.Column(db.String(100), nullable=False)
	nshe = db.Column(db.String(15), nullable=False, unique=True)

	def __repr__(self):
		return f"User_Info(id = {id}, first_name = {first_name}, last_name = {last_name}, nshe = {nshe})" # type: ignore

# Create Event model table for database
class EventModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(100), nullable=False)
	date = db.Column(db.String(100), nullable=False)
	time = db.Column(db.String(100))
	location = db.Column(db.String(100))

	def __repr__(self):
		return f"Event_Info(id = {id}, name = {name}, date = {date}, time = {time}, location = {location})" # type: ignore

# leave commented to prevent data overwrite or delete
db.create_all()

# Parser for User model
user_put_args = reqparse.RequestParser()
user_put_args.add_argument("first_name", type=str, help="First name is required", required=True)
user_put_args.add_argument("last_name", type=str, help="Last name is required", required=True)
user_put_args.add_argument("nshe", type=str, help="NSHE is required", required=True)

# Parser for Event model
event_put_args = reqparse.RequestParser()
event_put_args.add_argument("name", type=str, help="Event name is required", required=True)
event_put_args.add_argument("date", type=str, help="Event date is required", required=True)
event_put_args.add_argument("time", type=str, help="Event time can be null", required=False)
event_put_args.add_argument("location", type=str, help="Event location can be null", required=False)

# Resource fields for User model
user_resource_fields = {
	'id': fields.Integer,
	'first_name': fields.String,
	'last_name': fields.String,
	'nshe': fields.String
}

# Resource fields for Event model
event_resource_fields = {
	'id': fields.Integer,
	'name': fields.String,
	'date': fields.String,
	'time': fields.String,
	'location': fields.String
}

# Commands for User model
class User_Info(Resource):
	# GET items from User model table
	@marshal_with(user_resource_fields)
	def get(self, user_id):
		result = UserModel.query.filter_by(id=user_id).first()
		if not result:
			abort(404, message="Could not find user with that id")
		return result

	# PUT items from User model table
	@marshal_with(user_resource_fields)
	def put(self, user_id):
		args = user_put_args.parse_args()
		result = UserModel.query.filter_by(id=user_id).first()
		if result:
			abort(409, message="User id taken...")

		user = UserModel(id=user_id, first_name=args['first_name'], last_name=args['last_name'], nshe=args['nshe'])
		db.session.add(user)
		db.session.commit()
		return user, 201

# Commands for Event model
class Event_Info(Resource):
	# GET items from Event model table
	@marshal_with(event_resource_fields)
	def get(self, event_id):
		result = EventModel.query.filter_by(id=event_id).first()
		if not result:
			abort(404, message="Could not find event with that id")
		return result

	# PUT items from Event model table
	@marshal_with(event_resource_fields)
	def put(self, event_id):
		args = event_put_args.parse_args()
		result = EventModel.query.filter_by(id=event_id).first()
		if result:
			abort(409, message="Event id taken...")

		event = EventModel(id=event_id, name=args['name'], date=args['date'], time=args['time'], location=args['location'])
		db.session.add(event)
		db.session.commit()
		return event, 201

# List all items in User model table
class User_List(Resource):
	@marshal_with(event_resource_fields)
	def get(self):
		result = UserModel.query.all()
		if not result:
			abort(404, message="Table is empty")
		return result

# List all items in Event model table
class Event_List(Resource):
	@marshal_with(event_resource_fields)
	def get(self):
		result = EventModel.query.all()
		if not result:
			abort(404, message="Table is empty")
		return result

# API resources for GET/PUT commands
api.add_resource(User_Info, "/user_id/<int:user_id>")
api.add_resource(Event_Info, "/event_id/<int:event_id>")

# API resources for list commands
api.add_resource(User_List, "/user_list")
api.add_resource(Event_List, "/event_list")

# default function to run API
def default():
	app.run(host='0.0.0.0', port=5050, debug=True)

if __name__ == '__main__':
    with app.app_context():
        db.drop_all()
        db.create_all()  # Create tables within the application context
        default()  # Run the app after creating the tables
