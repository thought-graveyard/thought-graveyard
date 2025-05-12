from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_wtf import CSRFProtect
from app.config import Config

app = Flask(__name__, 
            static_folder='static',
            static_url_path='/static') 

#apply set to file
app.config.from_object(Config)

#enable CSRF protection
csrf = CSRFProtect(app)

#initiciate database
db = SQLAlchemy(app)
migrate = Migrate(app,db)
#import the model
from app import models, router

if __name__ == "__main__":
    app.run(debug=True)