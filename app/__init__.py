
from flask import Flask

app = Flask(__name__, 
            static_folder='static',  # static folder
            static_url_path='/static')  # URL Path

from app import router

if __name__ == "__main__":
    app.run(debug=True)