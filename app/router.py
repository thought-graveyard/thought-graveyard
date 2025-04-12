# File to store routes of flask app

from flask import render_template

@app.route('/')
def index():
    return render_template('landing_page.html')