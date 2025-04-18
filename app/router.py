
from flask import render_template, redirect
from app import app 

@app.route('/')
def index():
    return redirect('/register')

@app.route('/login')
def login():
    return render_template('login_page.html')

@app.route('/register')
def register():
    return render_template('Registerform.html')