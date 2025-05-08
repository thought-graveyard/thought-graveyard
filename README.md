# Thought Graveyard

CITS3403 Agile Web Development Group Project.

## Development Guide

- `main` should always reflect the current state of the project
- Commit new features to new branches
    - These branches should have all the prior capabilities, so that they work correctly in their isolated state
    - Do not remove old stuff from these new branches, otherwise merging becomes somewhat difficult
- Once a feature has been added, create a pull request to main as soon as possible so others can work without conflicts

## Current Features

- Landing page
- Login page
- Register page

## Usage

```
python3 -m venv virtualenv
source ./virtualenv/bin/activate
pip install -r requirements.txt
flask run

flask db init
flask db migrate -m "initial migration"
flask db upgrade
```

## Environment Setup
This application uses environment variables to store sensitive information such as SECRET_KEY.

### Setting up the environment
1. Install required packages: 
   pip install python-dotenv
2. Create a `.env` file in the project root folder with the following content:
   SECRET_KEY= " "

IMPORTANT: All team members must use the same SECRET_KEY. The actual key should be shared through secure channels (private message, encrypted email, etc.) and NOT written in any document that will be committed to Git.

3. The `.env` file is excluded from Git via `.gitignore`, so each team member needs to create their own local `.env` file with the shared team SECRET_KEY.

### Running the application
From the project root directory:
set FLASK_APP=app
flask run