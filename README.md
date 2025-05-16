# Thought Graveyard

[https://github.com/thought-graveyard/thought-graveyard](https://github.com/thought-graveyard/thought-graveyard)


| Name                 | UWA Student ID | GitHub Username |
|----------------------|----------------|-----------------|
| Benjamin Passaportis | 24494921       | plastictortoise |
| Jinseok Kim          | 24035957       | Jinseokkkk      |
| Kaylee Park          | 24079372       | sohyeon-p       |
| Lincoln Pan          | 23178989       | lnkwastaken     |

## Usage

Navigate with your arrow keys and space bar or use the virtual, on-screen keypad.

## Overview

A significant portion of our unique thoughts are forgotten each day. *Thought Graveyard* is a space to save, share and celebrate the thoughts that would normally be lost forever. Create a thought in your *My Thoughts* page to ensure it won't be forgotten like yesterday's thoughts. Catch a glimpse into the world of thoughts that never came into fruition by visiting the *Community Graveyard*, and contribute by sharing your thoughts with the global space, or by sharing with a subset of people that share your occupation. Additionally, interact with others' thoughts and ensure that the best lost thoughts are spread, rather than forgotten. Finally, get a general overview of the ways people represent their thoughts, the emotions theat their thoughts contain, what thoguhts people like, and more by visiting the *Statistics* space.

### Features

- Landing page
- Login page
- Register page
- Main page
  - Create thoughts
  - Share thoughts
- Statistics page

## Environment Setup

This application uses environment variables to store sensitive information.

### Setting up the environment

1. Install required packages: 
   `pip install python-dotenv`
2. Create a `.env` file in the project root folder with the following content:
   `SECRET_KEY="<SECRET_KEY_HERE>"`

Whilst it is essential that this key is kept private for production purposes, our testing uses the key: `ThoughtGraveYardXYZ@#456`. As such, this can be set, for testing purposes, using the following command.

```
echo "SECRET_KEY=\"ThoughtGraveYardXYZ@#456\"" > .env
```

3. The `.env` file is excluded from Git via `.gitignore`, so each team member needs to create their own local `.env` file.

## Usage

```
# After creating the .env file with SECRET_KEY
python3 -m venv virtualenv
source ./virtualenv/bin/activate
pip install -r requirements.txt
flask stamp head
flask db migrate
flask db upgrade
flask run
```

## Security Features

- **Secure password**: All user passwords are securely stored as salted hash using Werkzeug's security utility
- **CSRF Protection**: All forms are protected from against cross-site request forgery attacks using the CSRF protection of Flask-WTF
- **Environmental variables**: Sensitive information such as SECRET_KEY is stored in environment variables vi


## Testing

> Note: running these tests requires the databse to be cleared to ensure that the functionality can be tested correctly.
> Do not run with a production database


The project includes unit tests to ensure functionality works as expected.

Ensure that the flask server is running when the tests are run, as this is a requirement for some of the tests.


### Running Tests

```
# To run all tests:
python -m unittest discover -s tests

# Run model tests
python -m unittest tests.test_models

# Run router tests
python -m unittest tests.test_router

# Run selenium tests
python -m unittest tests.test_selenium
```

## AI Usage Statement

Generative AI was used in this project for the following purposes:
- Graphics creation
- Code generation
- Debugging