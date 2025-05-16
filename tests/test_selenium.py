import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class SeleniumTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        options = Options()
        options.add_argument("--window-size=1200,800")
        cls.driver = webdriver.Chrome(options = options)
        cls.driver.implicitly_wait(3)

    def test_1_register(self):
        driver = self.driver
        driver.get("http://localhost:5000/register")

        driver.find_element(By.NAME, "fullname").send_keys("Selenium User")
        driver.find_element(By.NAME, "username").send_keys("seleniumuser")
        driver.find_element(By.NAME, "email").send_keys("seluser@example.com")
        driver.find_element(By.NAME, "occupation").send_keys("student")
        driver.find_element(By.NAME, "password").send_keys("Test1234!")
        driver.find_element(By.NAME, "confirm_password").send_keys("Test1234!")

        driver.execute_script("document.getElementById('dot-1').click()");
        driver.execute_script("document.getElementById('registerForm').submit()");

        # Successful registration redirects to login
        WebDriverWait(driver, 3).until(EC.url_contains("/login"))
        self.assertIn("login", driver.current_url)

    def test_2_login(self):
        driver = self.driver
        driver.get("http://localhost:5000/login")

        driver.find_element(By.NAME, "username").send_keys("seleniumuser")
        driver.find_element(By.NAME, "password").send_keys("Test1234!")
        driver.find_element(By.TAG_NAME, "button").click()

        # Successful login goes to main page, which has the canvas element
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.TAG_NAME, "canvas")))
        self.assertIn("http://localhost:5000/", driver.current_url)

    def test_3_add_thought(self):
        driver = self.driver
        driver.get("http://localhost:5000/")

        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.TAG_NAME, "canvas")))
        driver.find_element(By.TAG_NAME, "body").send_keys(Keys.SPACE)
        time.sleep(1)

        # Populate tombstone creation form
        driver.find_element(By.NAME, "title").send_keys("Selenium Test")
        driver.find_element(By.NAME, "content").send_keys("This is a thought.")
        driver.find_element(By.CSS_SELECTOR, "input[name='emotion'][value='happy']").click()
        driver.find_element(By.CSS_SELECTOR, "input[name='space'][value='private']").click()
        driver.find_element(By.ID, "tombstone-form").submit()

        WebDriverWait(driver, 3).until(
            # Tombstone becomes the first search result
            EC.presence_of_element_located((By.TAG_NAME, "li"))
        )

    def test_4_personal_page_loads(self):
        driver = self.driver
        driver.get("http://localhost:5000/")

        # If personal page loads, there will be a canvas element
        WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.TAG_NAME, "canvas")))
        self.assertTrue("canvas" in driver.page_source)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

if __name__ == "__main__":
    unittest.main()