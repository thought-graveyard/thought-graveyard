from app import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(128), unique=True, nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    pw_hash = db.Column(db.String(128), nullable=False)
    
    def set_pw(self, password):
        # Hash user password
        self.pw_hash = generate_password_hash(password)
    
    #check password
    def check_pw(self,password):
        return check_password_hash(self.pw_hash, password)