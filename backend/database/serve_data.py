from flask import Flask
from flask_restful import Api, Resource, reqparse, abort, fields, marshal_with
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
api = Api(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)

class UserModel(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	first_name = db.Column(db.String(100), nullable=False)
	last_name = db.Column(db.String(100), nullable=False)
	nsshe = db.Column(db.String(15), nullable=False, unique=True)
	

	def __repr__(self):
		return f"User_Info(id = {id}, first_name = {first_name}, last_name = {last_name}, nsshe = {nsshe})"

# leave commented to prevent data overwrite or delete
#db.create_all()

user_put_args = reqparse.RequestParser()

user_put_args.add_argument("first_name", type=str, help="First name is required", required=True)
user_put_args.add_argument("last_name", type=str, help="Last name is required", required=True)
user_put_args.add_argument("nsshe", type=str, help="NSSHE is required", required=True)


resource_fields = {
	'id': fields.Integer,
	'first_name': fields.String,
	'last_name': fields.String,
	'nsshe': fields.String
}

class User_Info(Resource):
	@marshal_with(resource_fields)
	def get(self, user_id):
		result = UserModel.query.filter_by(id=user_id).first()
		if not result:
			abort(404, message="Could not find user with that id")
		return result

	@marshal_with(resource_fields)
	def put(self, user_id):
		args = user_put_args.parse_args()
		result = UserModel.query.filter_by(id=user_id).first()
		if result:
			abort(409, message="User id taken...")

		user = UserModel(id=user_id, first_name=args['first_name'], last_name=args['last_name'], nsshe=args['nsshe'])
		db.session.add(user)
		db.session.commit()
		return user, 201
	
class User_List(Resource):
	@marshal_with(resource_fields)
	def get(self):
		result = UserModel.query.all()
		if not result:
			abort(404, message="Table is empty")
		return result


api.add_resource(User_Info, "/user_id/<int:user_id>")

api.add_resource(User_List, "/user_list")

if __name__ == "__main__":
	app.run(host='0.0.0.0', port=5000, debug=True)

