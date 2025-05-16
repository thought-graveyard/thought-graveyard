import unittest
import os
import sys

# add app directory to python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# using Flask application object(app) and db object
from app import app, db
from app.models import User, Thought

class TestConfig:
    """
    - TESTING: Enables testing mode (errors are shown immediately)
    - SQLALCHEMY_DATABASE_URI: Uses an in-memory database (automatically removed after tests)
    - SQLALCHEMY_TRACK_MODIFICATIONS: Disables modification tracking (improves performance)
    - WTF_CSRF_ENABLED: Disables CSRF token (makes form validation easier during testing)
    - SECRET_KEY: Secret key used for Flask session and form encryption

    """
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"  # use SQLite memory
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False  # inactivity CSRF for testing
    SECRET_KEY = os.environ.get("SECRET_KEY")


class BaseTestCase(unittest.TestCase):
    '''
    Base class for all test cases

    - setUp: Performs initialization before each test method runs
    - tearDown: Performs cleanup after each test method runs
    - create_test_users: Creates two test users
    - create_test_thoughts: Creates two test Thought objects
    '''
    def setUp(self):
        '''
        Preparation steps before running tests:

        1. Change the app configuration to TestConfig
        2. Create a test client (self.client)
        3. Push the application context to enable database access
        4. Create all database tables (db.create_all)
        5. Insert test user and thought data
        '''
        app.config.from_object(TestConfig)
        self.app = app
        #HTTP client for testing
        self.client = app.test_client()
        self.app_context = app.app_context()
        #activate context
        self.app_context.push()
        #create table
        db.create_all()
        #add user data
        self.create_test_users()
        #add thought data
        self.create_test_thoughts()

    def tearDown(self):
        '''
        Cleanup steps after running tests:

        - Remove the database session (db.session.remove)
        - Drop all database tables (db.drop_all)
        - Pop the application context (app_context.pop)
        '''
        db.session.remove()
        User.query.delete()
        Thought.query.delete()
        db.session.commit()
        self.app_context.pop()

    def create_test_users(self):
        '''
        create user1 ,user 2 for testing
        '''
        test_user1 = User(
            username="testuser1",
            email="test1@example.com",
            fullname="Test User One",
            occupation="technology",
            gender="male"
        )
        test_user1.set_pw("TestPass1")
        
        test_user2 = User(
            username="testuser2",
            email="test2@example.com",
            fullname="Test User Two",
            occupation="student",
            gender="female"
        )
        test_user2.set_pw("TestPass2")
        #add to session and commit to reflect to DB
        db.session.add(test_user1)
        db.session.add(test_user2)
        db.session.commit()

    def create_test_thoughts(self):
        '''
        create Thought object and store DB for testing
        '''
        thought1 = Thought(
            title="Private Test Thought",
            content="This is a private thought for testing",
            emotions="happy",
            space="private",
            author="1",  
            position=[100, 100],
            local_position=[100, 100],
            #if 0, it is activated
            tombstone=0,
            likes=["1"]
        )
        thought2 = Thought(
            title="Public Test Thought",
            content="This is a public thought for testing",
            emotions="sad",
            space="public",
            author="2", 
            position=[200, 200],
            local_position=[200, 200],
            #if 1 , it would be deleted or inactivated
            tombstone=1,
            likes=["1", "2"]
        )
        #add to session and commit
        db.session.add(thought1)
        db.session.add(thought2)
        db.session.commit()