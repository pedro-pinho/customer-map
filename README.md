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
- Email - required
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

#### Check the demo
[here](https://master.d2yw7c4rgcohc2.amplifyapp.com/)

#### How to run

You need [node.js](https://nodejs.org/en/download/) to run this project, and amplify-cli
```
npm install -g @aws-amplify/cli
```

Run the following commands on the root of the application
```
cd server/
npm install
npm start
```

On another command line
```
npm install
npm start
```