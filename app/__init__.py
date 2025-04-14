# Entry point of flask app

from flask import Flask

app = Flask(__name__)

from app import router

if __name__ == "__main__":
    app.run(debug=True)