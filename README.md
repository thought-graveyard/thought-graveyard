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
- Main page
  - Create option
  - Share option
- Statistics page

## Environment Setup
This application uses environment variables to store sensitive information such as SECRET_KEY.

### Setting up the environment
1. Install required packages: 
   pip install python-dotenv
2. Create a `.env` file in the project root folder with the following content:
   SECRET_KEY="<SECRET_KEY_HERE>"

Whilst it is essential that this key is kept private for production purposes, our testing uses the key: `ThoughOfGraveYardG19!23$XYZ@#456`. As such, this can be set, for testing purposes, using the following command.

```
echo "SECRET_KEY=\"ThoughOfGraveYardG19doc_size.jsXYZ@#456\"" > .env
```

3. The `.env` file is excluded from Git via `.gitignore`, so each team member needs to create their own local `.env` file with the shared team SECRET_KEY.

## Usage

```
python3 -m venv virtualenv
source ./virtualenv/bin/activate
pip install -r requirements.txt
flask db upgrade
flask run
```


## Testing

The project includes both unit tests and Selenium browser tests to ensure functionality works as expected.

### Running Tests

```
To run all tests:
python -m unittest discover -s tests

# Run model tests
python -m unittest tests.test_models

```