from flask import Blueprint, request, make_response, jsonify
from .models import User
from . import db
from werkzeug.security import generate_password_hash, check_password_hash
from jwt_handler import assign_jwt

auth = Blueprint('auth', __name__)

@auth.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')
    print(email, password)

    try: 
        users_ref = db.collection(u'users')
        user = users_ref.document(email).get()
        
        if not user.exists:
            return make_response(jsonify("Wrong email or passwrod"), 400)

        user = User.from_dict(user.to_dict())
        if not check_password_hash(user.password , password):
            return make_response(jsonify("Wrong email or passwrod"), 400)


        token = assign_jwt(user.email)    

    except Exception as e:
        return f'An error has occured {e}', 500
    
    headers = {
        "message": "Logged in succesfully",
    }    
    res = make_response(jsonify(headers), 200)
    res.headers.set('Authorization', "Bearer " + token)
    return res
    
@auth.route('/register', methods= ['POST'])
def register():
    email = request.json.get('email')
    name = request.json.get('name')
    password = request.json.get('password')
   

    try:
        users_ref = db.collection(u'users')
        if users_ref.document(email).get().exists:
            return "User already exists", 400

        user = User(name=name, email=email, password=generate_password_hash(password, method='sha256'))
        users_ref.document(user.email).set(user.__dict__)

    except Exception as e:
            return f"An error has occured {e}", 400

    return "User created", 201



