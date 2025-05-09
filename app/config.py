import os
from dotenv import load_dotenv
# load .env file 
load_dotenv()

class Config:
    #set the database
    basedir = os.path.abspath(os.path.dirname(__file__))
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(basedir, "app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # key for Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'ThoughtofGraveyard-dev'


