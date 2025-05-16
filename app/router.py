#import functions from flask   
from flask import render_template, redirect, request, session,url_for,flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm.attributes import flag_modified
from flask_cors import CORS
from app import app, db
from app.models import User, Thought
from app.forms import RegisterForm, LoginForm, ThoughtForm
import random

@app.route('/welcome')
def landing():
    if session.get("user_id") != None:
        return redirect("/")

    return render_template('landing_page.html')

@app.route('/')
def main():
    form = ThoughtForm()
    
    if session.get("user_id") == None:
        return redirect("/welcome")

    return render_template('main_page.html', form = form, user_id = session["user_id"])


@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()

    if form.validate_on_submit():
        username = form.username.data
        password = form.password.data
        
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
            return render_template('login_page.html', form=form)
        
    elif session.get("user_id") == None:
        #request 'GET' then it would display log-in page
        return render_template('login_page.html', form=form)
    else:
        return redirect("/")


@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm() 
    if form.validate_on_submit():

        exist_user = User.query.filter(
            (User.username == form.username.data) | 
            (User.email == form.email.data)
        ).first()
        
        if exist_user:
            flash("Your name or email is already in use.")
            return render_template('register_page.html', form=form)
        
        user = User(
            username=form.username.data,
            email=form.email.data,
            fullname=form.fullname.data,
            occupation=form.occupation.data,
            gender=form.gender.data
        )

        user.set_pw(form.password.data)

        #add into database
        db.session.add(user)
        db.session.commit()

        flash("Complete your join. please log-in")
        return redirect('/login')
    
    elif session.get("user_id") == None:
        #request 'GET' then it would display log-in page
        return render_template('register_page.html', form=form)
    else:
        return redirect("/")


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
    if session.get("user_id") != None:
        user = User.query.filter_by(id = session.get("user_id"))[0]
        public_thoughts = Thought.query.filter_by(space = "public").all()
        occupation_thoughts = Thought.query.filter_by(space = user.occupation).all()
        
        return jsonify([t.to_dict() for t in public_thoughts] + [t.to_dict() for t in occupation_thoughts])
    
    return "Invalid permissions to view thoughts", 403

@app.route('/api/personal-thoughts')
def personal_thoughts():
    if session.get("user_id") != None:
        thoughts = Thought.query.filter_by(author = session.get("user_id")).all()
        return jsonify([t.to_dict() for t in thoughts])
    
    return "Invalid permissions to view thoughts", 403


@app.route('/api/thoughts', methods=['POST'])
def add_thought():
    form = ThoughtForm()

    if session.get("user_id") != None and form.validate_on_submit():
        data = request.json

        position = [
            random.randint(0, 19) * 50,
            random.randint(0, 9) * 50
        ]

        # take previous thought
        thoughts = Thought.query.filter_by(space = "public").all()

        # set the minimum distance
        min_distance = 75

        # Maximum number of location adjustment attempts.
        max_attempts = 20
        attempts = 0

        # Find a location that does not overlap with other tombstones.
        while attempts < max_attempts:
            overlap = False
            
            for thought in thoughts:
                thought_pos = thought.to_dict()["position"]
                
                distance = ((position[0] - thought_pos[0])**2 + 
                        (position[1] - thought_pos[1])**2)**0.5
                
                if distance < min_distance:
                    overlap = True
                    break
            
            if not overlap:
                # Terminate the loop once a non-overlapping location is found.
                break
                
            # When overlapping, shift the position by small amounts.
            position[0] += random.randint(-100, 100)
            position[1] += random.randint(-100, 100)
            
            # Maintain screen boundaries
            position[0] = max(0, min(position[0], 950))
            position[1] = max(0, min(position[1], 450))
            
            attempts += 1

        # Get occupation from User table
        occupation = User.query.filter_by(id = session.get("user_id")).all()[0].occupation

        new_thought = Thought(
            title = form.title.data,
            content = form.content.data,
            emotions = form.emotion.data,
            space = occupation if form.space.data == "occupation" else form.space.data,
            author = session.get("user_id"),
            tombstone = form.tombstone.data,
            local_position = data.get("local_position"),
            position = position,
            likes = [session.get("user_id")]
        )

        db.session.add(new_thought)
        db.session.commit()

        return jsonify(new_thought.to_dict()), 201
    
    return "Invalid permissions to add thought", 403


@app.route('/api/thoughts/<int:thought_id>', methods=['DELETE'])
def delete_thought(thought_id):
    if session.get("user_id") != None:
        thought = Thought.query.get(thought_id)

        if thought and thought.author == session.get("user_id"):
            db.session.delete(thought)
            db.session.commit()
            return "Successfully deleted thought", 204
    
    return "Failed to delete thought", 403


@app.route('/api/thoughts/<int:thought_id>', methods=['UPDATE'])
def like_thought(thought_id):
    if session.get("user_id") != None:
        thought = db.session.query(Thought).get(thought_id)

        if thought:
            if session.get("user_id") not in thought.likes:
                thought.likes += [session.get("user_id")]
            else:
                thought.likes.remove(session.get("user_id"))

            # Flask cannot tell that list is edited, so explicity flag likes
            flag_modified(thought, 'likes')
            
            db.session.commit()

            return db.session.query(Thought).get(thought_id).to_dict(), 200
    
    return {}, 403