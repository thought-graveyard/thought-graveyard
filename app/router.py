from flask import render_template, redirect, request
from app import app

@app.route('/')
def index():
    return render_template('landing_page.html')

@app.route('/login')
def login():
    return render_template('login_page.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        return redirect('/login')
    
    return render_template('Registerform.html')