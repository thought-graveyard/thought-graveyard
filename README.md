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
```