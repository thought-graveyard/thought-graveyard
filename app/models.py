from app import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(128), unique=True, nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    pw_hash = db.Column(db.String(128), nullable=False)
    fullname = db.Column(db.String(128), nullable=True)
    occupation = db.Column(db.String(50), nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    
    def set_pw(self, password):
        # Hash user password
        self.pw_hash = generate_password_hash(password)
    
    #check password
    def check_pw(self,password):
        return check_password_hash(self.pw_hash, password)
    
class Thought(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    content = db.Column(db.Text)
    emotions = db.Column(db.PickleType)
    is_public = db.Column(db.Boolean)
    author = db.Column(db.String(80), default="me")
    position = db.Column(db.JSON)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "emotions": self.emotions or [],
            "is_public": self.is_public,
            "author": self.author,
            "position": self.position
        }