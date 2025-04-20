from flask import render_template, redirect, request
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

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Take from data to here
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        return redirect('/login')
    
    # GET 요청(페이지 로드)인 경우 폼 보여주기
    return render_template('Registerform.html')