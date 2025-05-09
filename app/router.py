#import functions from flask   
from flask import render_template, redirect, request, session,url_for,flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from app import app, db
from app.models import User, Thought
from app.forms import RegisterForm
import random

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
    form = RegisterForm() 
    if form.validate_on_submit():

        exist_user = User.query.filter(
            (User.username == form.username.data) | 
            (User.email == form.email.data)
        ).first()
        
        if exist_user:
            flash("Your name or email have been using.")
            return render_template('register_page.html', form=form)
        
        user = User(
            username=form.username.data,
            email=form.email.data,
            fullname=form.fullname.data,
            occupation=form.occupation.data,
            gender=form.gender.data
        )

        user.set_pw(form.password.data)
        
        db.session.add(user)
        db.session.commit()

        flash("Complete your join. please log-in")
        return redirect('/login')
    

    return render_template('register_page.html', form=form)

@app.route('/logout')
def logout():
    #remove user information from session
    session.pop('user_id',None)
    session.pop('username',None)
    return redirect('/welcome')

@app.route('/public')
def public():
    return render_template('graveyard.html')

@app.route('/personal')
def personal():
    return render_template('graveyard.html')

@app.route('/api/public-thoughts')
def public_thoughts():
    thoughts = Thought.query.filter_by(is_public=True).all()
    return jsonify([t.to_dict() for t in thoughts])

@app.route('/api/personal-thoughts')
def personal_thoughts():
    thoughts = Thought.query.filter_by(is_public=False, author="me").all()
    return jsonify([t.to_dict() for t in thoughts])

@app.route('/api/thoughts', methods=['POST'])
def add_thought():
    data = request.json
    new_thought = Thought(
        title=data['title'],
        content=data['content'],
        emotions=data.get('emotions', []),
        is_public=data.get('is_public', False),
        author="me",
        position={
            "top": f"{random.randint(5, 85)}%",
            "left": f"{random.randint(5, 85)}%"
        }
    )
    db.session.add(new_thought)
    db.session.commit()
    return jsonify(new_thought.to_dict()), 201

@app.route('/api/thoughts/<int:thought_id>', methods=['DELETE'])
def delete_thought(thought_id):
    thought = Thought.query.get(thought_id)
    if thought and thought.author == "me":
        db.session.delete(thought)
        db.session.commit()
        return '', 204
    return '', 403