from app import db
#Take hashing function from 'werkzeug.security' module
from werkzeug.security import generate_password_hash, check_password_hash
#inherit from db.model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(128),unique=True, nullable=False)
    email = db.Column(db.String(128),unique=True, nullable=False)
    #store the password which is trasnformed to hash
    pw_hash = db.Column(db.String(128),nullable=False)
    #method for set the password
    def set_pw(self, password):
        #if user put password, it will trasform to hash, then sotre pw_hashfield.
        self.pw_hash = generate_password_hash(password)
    #check password
    def check_pw(self,password):
        return check_password_hash(self.pw_hash, password)