# LawnGuru Code Challenge
Difficulty: Medium
## The Project
Build a React.js app that controls the customer's location. The page owner must be logged to change his customer’s list. The customers master page must have a map with the customer location markers and a list above that shows the customers information like: Full Name, Address and Date of Creation.
### Requirements
The owner register page must to have:
- Username (just letters) - required
- Email - required
- Password - required
- Confirm Password - required

The customers register page must to have:
- First Name - required
- Last Name - required
- email - required
- Address - required
    - Country
    - State
    - City
    - Street
    - Zip Code

Customer’s list should have an option to:
- Edit Address and Name
- Delete
- Undo deleted customers

#### Think about
- The map and the list should match the info
- Is it really necessary to delete a customer?
- How do we update the map and the list at the same time?
- Should I block routes to avoid an unlogged person changing the info? 