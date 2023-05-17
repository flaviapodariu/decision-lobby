from flask import Flask
import os 
from dotenv import find_dotenv, load_dotenv
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

dotnev_file = find_dotenv()
load_dotenv(dotnev_file)
credentials_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')

cred = credentials.Certificate(credentials_path)
firebase_admin.initialize_app(cred)

db = firestore.client()

def create_app():

    app = Flask(__name__)

    from .auth import auth
    from .lobby import lobby

    app.register_blueprint(auth, url_prefix='/auth')
    app.register_blueprint(lobby, url_prefix='/lobby')
    return app