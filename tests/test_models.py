from tests import BaseTestCase
from app.models import User, Thought
from app import db

class TestUserModel(BaseTestCase):
    ''''
    Unit test class for the User model.
    Inherits from BaseTestCase to utilize database initialization and 
    test data creation/cleanup functionalities.
    '''
    def test_password_hashing(self):
        '''
        test password hashing and valid logic
        '''
        user = User(
            username="passwordtest",
            email="password@test.com",
            fullname="Password Test"
        )
        #set the password hash
        user.set_pw("MyTestPassword123")
        self.assertTrue(user.check_pw("MyTestPassword123"))
        self.assertFalse(user.check_pw("WrongPassword"))
    
    def test_user_creation(self):
        '''
        check whether created user for test is properly stored or not.
        '''
        user1 = User.query.filter_by(username="testuser1").first()
        user2 = User.query.filter_by(username="testuser2").first()
        #Checks whether the user object actually exists in the database.
        self.assertIsNotNone(user1)
        self.assertIsNotNone(user2)
        #Checks whether the stored email and occupation information match the test data.
        self.assertEqual(user1.email, "test1@example.com")
        self.assertEqual(user2.occupation, "student")
        #Final check to ensure that the password verification method works correctly.
        self.assertTrue(user1.check_pw("TestPass1"))

class TestThoughtModel(BaseTestCase):
    '''
    Unit test class for the Thought model.
    '''
    def test_thought_creation(self):
        '''
        Verifies that the test Thought data has been correctly stored in the database.
        '''
        thought1 = Thought.query.filter_by(title="Private Test Thought").first()
        thought2 = Thought.query.filter_by(title="Public Test Thought").first()
        # Checks whether the object exists in the database.
        self.assertIsNotNone(thought1)
        self.assertIsNotNone(thought2)
        
        self.assertEqual(thought1.emotions, "happy")
        self.assertEqual(thought2.space, "public")
    
    def test_thought_likes(self):
        '''
        Tests whether SQLAlchemy needs to be explicitly notified after modifying the JSON array (likes).
        '''
        from sqlalchemy.orm.attributes import flag_modified
        # When modifying a JSON array, 
        # it must explicitly inform SQLAlchemy that the field has changed.
        thought = Thought.query.filter_by(title="Public Test Thought").first()
        
        self.assertEqual(thought.likes, ["1", "2"])

        thought.likes.append("3")
        #Notifies SQLAlchemy that the JSON column has been modified.
        flag_modified(thought, 'likes')
        db.session.commit()
        #Retrieves the object again after modification to verify the updated value.
        updated_thought = Thought.query.filter_by(title="Public Test Thought").first()
        self.assertEqual(updated_thought.likes, ["1", "2", "3"])

if __name__ == "__main__":
    import unittest
    unittest.main()