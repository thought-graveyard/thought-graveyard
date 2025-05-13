from flask_wtf import FlaskForm 
from wtforms import StringField, PasswordField, SelectField, RadioField, BooleanField 
from wtforms.validators import DataRequired, Email, EqualTo, Length, Regexp

class RegisterForm(FlaskForm):
    # cannot be empty in name field
    fullname = StringField('Full Name', validators=[DataRequired()])
    
    # cannot be empty in username field
    username = StringField('Username', validators=[DataRequired()])
    
    # cannot be empty and must be email form 
    email = StringField('Email', validators=[DataRequired(), Email()])
    
    occupation = SelectField('Occupation', choices=[
        ('student', 'Student'),
        ('technology', 'Technology & IT'),
        ('healthcare', 'Healthcare'),
        ('business', 'Business & Finance'),
        ('education', 'Education'),
        ('arts', 'Arts & Creative'),
        ('service', 'Service Industry'),
        ('science', 'Science & Research'),
        ('trades', 'Trades & Manual Labor'),
        ('other', 'Other')
    ])
    
    # another validate check
    password = PasswordField('Password', validators=[
        DataRequired(),
        Length(min=8), 
        Regexp(r'(?=.*\d)(?=.*[a-z])(?=.*[A-Z])', 
               message='Password must contain at least one uppercase letter, one lowercase letter, and one number')
    ])
    
    confirm_password = PasswordField('Confirm Password', validators=[
        DataRequired(), 
        EqualTo('password', message='Passwords must match') 
    ])
    
    gender = RadioField('Gender', choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('prefer-not-to-say', 'Prefer not to say')
    ])

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])