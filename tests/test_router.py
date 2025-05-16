from tests import BaseTestCase

class TestRoutes(BaseTestCase):
    '''
    Initiating DB and set the test data in BaseTestCase
    '''
    
    def test_login(self):
        '''
        Test login. if success, then check whether move to main page or not
        '''
        response = self.client.post('/login', data={
            'username': 'testuser1', 
            'password': 'TestPass1'
            #check redirect move to main
        }, follow_redirects=True)
        #check display 'Thought Graveyard' in main page
        self.assertIn(b'Thought Graveyard', response.data)
        
    def test_login_invalid(self):
        '''
        test fail to login
        wrong password, still stay in login page, 
        check whether user information is stored in session or not
        '''

        response = self.client.post('/login', data={
            'username': 'testuser1', 
            'password': 'wrong'
            #check redirect move to main
        }, follow_redirects=True)
        #check a successful HTTP response
        self.assertEqual(response.status_code, 200)
        # check that the user remains on the login page (i.e., no redirect)
        # Flash messages are difficult to test, so check for specific page structure elements instead
        self.assertIn(b'<h1>Sign In</h1>', response.data)
        #check that no user information has been stored in the session
        with self.client.session_transaction() as sess:
            self.assertNotIn('user_id', sess)

if __name__ == "__main__":
    import unittest
    unittest.main()