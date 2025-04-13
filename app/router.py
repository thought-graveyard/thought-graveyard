# File to store routes of flask app

from flask import render_template
from app import app  # 이 줄이 필요합니다

@app.route('/')
def index():
    return render_template('landing_page.html')

@app.route('/login')
def login():
    return render_template('login_page.html')