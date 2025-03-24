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
        return f"User_Info(id = {id}, first_name = {first_name}, last_name = {last_name}, nshe = {nshe})"


# Create Calendar model table for database
class CalendarModel(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event = db.Column(db.String(500), nullable=False)  # Increased size for long events
    date = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f"Calendar(id={self.id}, event='{self.event}', date='{self.date}')"

# leave commented to prevent data overwrite or delete


# Parser for User model
user_put_args = reqparse.RequestParser()
user_put_args.add_argument("first_name", type=str, help="First name is required", required=True)
user_put_args.add_argument("last_name", type=str, help="Last name is required", required=True)
user_put_args.add_argument("nshe", type=str, help="NSHE is required", required=True)

# Parser for Calendar model
calendar_put_args = reqparse.RequestParser()
calendar_put_args.add_argument("event", type=str, help="Event is required", required=True)
calendar_put_args.add_argument("date", type=str, help="Date is required", required=True)

# Resource fields for User model
user_resource_fields = {
    'id': fields.Integer,
    'first_name': fields.String,
    'last_name': fields.String,
    'nshe': fields.String
}

# Resource fields for Calendar model
calendar_resource_fields = {
    'id': fields.Integer,
    'event': fields.String,
    'date': fields.String
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


# Commands for Calendar model
class Calendar_Info(Resource):
    @marshal_with(calendar_resource_fields)
    def get(self, calendar_id):
        result = CalendarModel.query.filter_by(id=calendar_id).first()
        if not result:
            abort(404, message="Could not find calendar entry with that id")
        return result

    @marshal_with(calendar_resource_fields)
    def put(self, calendar_id):
        args = calendar_put_args.parse_args()
        result = CalendarModel.query.filter_by(id=calendar_id).first()
        if result:
            abort(409, message="Calendar id taken...")

        calendar_entry = CalendarModel(id=calendar_id, event=args['event'], date=args['date'])
        db.session.add(calendar_entry)
        db.session.commit()
        return calendar_entry, 201

# List all items in User model table
class User_List(Resource):
    @marshal_with(user_resource_fields)
    def get(self):
        result = UserModel.query.all()
        if not result:
            abort(404, message="Table is empty")
        return result

# List all items in Calendar model table
class Calendar_List(Resource):
    @marshal_with(calendar_resource_fields)
    def get(self):
        result = CalendarModel.query.all()
        if not result:
            abort(404, message="Calendar table is empty")
        return result

# API resources for GET/PUT commands
api.add_resource(User_Info, "/user_id/<int:user_id>")
api.add_resource(Calendar_Info, "/calendar_id/<int:calendar_id>")

# API resources for list commands
api.add_resource(User_List, "/user_list")
api.add_resource(Calendar_List, "/calendar_list")

# default function to run API
def default():
    app.run(host='0.0.0.0', port=5000, debug=True)

if __name__ == '__main__':
    with app.app_context():
     #   db.drop_all()
        db.create_all()  # Create tables within the application context
        default()  # Run the app after creating the tables
