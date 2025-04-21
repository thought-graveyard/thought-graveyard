from flask import render_template, redirect, request
from app import app

@app.route('/')
def index():
    return redirect('/register')

@app.route('/login')
def login():
    return render_template('login_page.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
<<<<<<< HEAD
=======

>>>>>>> ede8452653a9d35b67a088dbdcd2b53d407cb4f7
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        return redirect('/login')
    
<<<<<<< HEAD
=======

>>>>>>> ede8452653a9d35b67a088dbdcd2b53d407cb4f7
    return render_template('Registerform.html')