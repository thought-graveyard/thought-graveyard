#import functions from flask   
from flask import render_template, redirect, request, session,url_for,flash
from app import app, db
from app.models import User

@app.route('/welcome')
def landing():
    return render_template('landing_page.html')

@app.route('/')
def main():
    return render_template('main_page.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        #if form submit, request 'POST'
        #Bring ID and password that user input
        username = request.form.get('username')
        password = request.form.get('password')
        #database will be found by user input
        user = User.query.filter_by(username=username).first()

        if user and user.check_pw(password):
            #successful log-in
            session['user_id'] = user.id
            session['username'] = user.username
            #move to main page
            return redirect('/')
        else:
            #fail to log-in
            flash("Your ID and Password are incorrect")
    #request 'GET' or if fail to log-in, it would display log-in page
    return render_template('login_page.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        #Bring user input
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')

        #check User is already exist or not by ID or Email
        exist_user = User.query.filter((User.username == username) | (User.email == email)).first()
        
        if exist_user:
            flash("Your name or email have been using.")
            return render_template('register_page.html')
        
        #create new user
        user = User(username=username, email=email)
        #hasing the password
        user.set_pw(password)
        #add into database
        db.session.add(user)
        #store changed information
        db.session.commit()

        flash("Complete your join. please log-in")
        #move to log-in page
        return redirect('/login')
    #if 'GET' request, display register page
    return render_template('register_page.html')

@app.route('/logout')
def logout():
    #remove user information from session
    session.pop('user_id',None)
    session.pop('username',None)
    return redirect('/welcome')