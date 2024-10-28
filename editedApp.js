const http = require('http');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Connecting to the MongoDB database
mongoose.connect('mongodb://localhost:27017/test')
  .then(function () {
    console.log('DB Connected');
  })
  .catch(function (err) {
    console.error('DB Connection Error:', err);
  });

// Orders TABLE CONNECTION
// Define the order schema
const orderSchema = new mongoose.Schema({
  customer_email: { type: String, required: true },
  product_code: { type: String, required: true },
  product_name: { type: String, required: true },
  quantity: { type: Number, required: true },
  order_date: { type: Date, required: true }
});

// const orderRetr_Schema = new mongoose.Schema({
//   customer_email: String,
//   product_code: String, 
//   product_name: String,
//   quantity: Number, 
//   order_date: Date }

// );
// Create the model for orders storing
const OrderModel = mongoose.model('product_orders', orderSchema);
// Create the model for orders retirval
// const OrderRetr_Model = mongoose.model('product_orders', orderRetr_Schema);

// Orders TABLE operations over     


// USER TABLE CONNECTION
// Defining the structure of MongoDB document
const userSchema = new mongoose.Schema({
  email: String,
  pass: String
});

// Create collection model
const UserModel = mongoose.model('users', userSchema);


const server = http.createServer(function (req, res) {
  // Serve different HTML pages based on the URL
  if (req.url === '/' || req.url === '/home') {
    //This loads index page first.
    serveFile('index.html', res);
    var curr_email = "";
  } else if (req.url === '/signin') {
    serveFile('signin.html', res);
  } else if (req.url === '/signup') {
    serveFile('signup.html', res);
  } else if (req.url === '/FAQ') {
    serveFile('FAQ.html', res);
  } else if (req.url === '/Client_Dashboard') {
    serveFile('Client_Dashboard.html', res);
  } else if (req.url === '/Client_Profile') {
    serveFile('Client_Profile.html', res);
  } else if (req.url === '/Service_request') {
    serveFile('Service_request.html', res);
  // } else if (req.url === '/Service_history') {
  //   serveFile('Service_history.html', res);
   } else if (req.url.startsWith('/css/') || req.url.startsWith('/js/') || req.url.startsWith('/images/')) {
    // Serve CSS, JS, and image files as static files
    serveStaticFile(req.url, res);
  } else if (req.url === '/signupform' && req.method === 'POST') {
    let rawdata = '';
    req.on('data', function (data) {
      rawdata += data;
    });
    req.on('end', function () {
      const formdata = new URLSearchParams(rawdata);
      const userData = {
        email: formdata.get('email'),
        pass: formdata.get('pass')
      };
      var curr_email = formdata.get('email');
      var curr_pass = formdata.get('pass');

      // Check if email already exists in the database
      UserModel.findOne({ email: curr_email })
        .then((existingUser) => {
          if (existingUser) {
            // Email already exists, return an error
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<script>alert("This email is already in use. Please use a different email.");</script>');
            res.end();
          } else {
            // Email is unique, create the new user
            UserModel.create(userData)
              .then(() => {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write('<script>alert("Account created successfully");</script>');
                res.write('Data Saved Successfully');
                res.write('<script>window.location.href = "/Client_Dashboard";</script>');
                res.end();
              })
              .catch(err => {
                console.error('Error saving data:', err);
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.write('<script>alert("Error saving data");</script>');
                res.write('There was an error saving the data.');
                res.end();
              });
          }
        })
        .catch(err => {
          console.error('Error checking email:', err);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.write('<script>alert("Error occurred during email validation");</script>');
          res.end();
        });
    });
  }

  else if (req.url === '/order' && req.method === 'POST') {
    let rawdata = '';

    req.on('data', (data) => {
      rawdata += data;
    })

    req.on('end', () => {
      const formdata = new URLSearchParams(rawdata);
      const orderData = {
        customer_email: formdata.get('email'),
        product_code: formdata.get('product_code'),
        product_name: formdata.get('product_name'),
        quantity: parseInt(formdata.get('quantity')),
        order_date: new Date(formdata.get('order_date'))
      };
      // Save order data to MongoDB
      OrderModel.create(orderData)
        .then(() => {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write('<script>alert("Order placed successfully!"); window.location.href = "/Service_history";</script>');
          res.end();
        })
        .catch(err => {
          console.error('Error saving order:', err);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.write('<script>alert("Error placing order. Please try again.");</script>');
          res.end();
        });
    });
  }

  else if (req.url === '/Service_history') {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(`
      <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Device Servicing</title>
    <link rel="stylesheet" href="/css/mystyles.css">
    <script src="/js/bootstrap.js"></script>
    <!-- <script src="js\bootstrap.js"></script> -->
    <!-- <link rel="stylesheet" href="C:\Users\jgrac\Documents\Karunya\Semesters\Semester_5\Web_Tech\Internals_3_Project\bootstrap\css\bootstrap.css"> -->
    <link rel="stylesheet" href="/css/bootstrap.css">

    <!-- <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css"> -->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <!-- <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script> -->
</head>
<body>
  <header class="container-fluid bg-primary p-3">
    <h1 class="text-center text-white">Electro Electronics Services</h1>
  </header>
    <div class="container-fluid bg-light">
        <nav class="navbar navbar-expand-sm navbar-light sticky-top justify-content-center">
          <center>
            <div class="container-fluid">
              <ul class="navbar-nav">
                <li class="nav-item fw-bold">
                  <a class="nav-link text-primary text-decoration-underline" href="/Client_Dashboard">Dashboard</a>
                </li>
                <li class="nav-item fw-bold">
                  <a class="nav-link text-primary text-decoration-underline" href="/Client_Profile">Profile</a>
                </li>
                <li class="nav-item fw-bold">
                  <a class="nav-link text-primary text-decoration-underline" href="/Service_request">Request Service</a>
                </li>
                <li class="nav-item fw-bold">
                  <a class="nav-link text-primary text-decoration-underline" href="/Service_history">Service History</a>
                </li>
                <li class="nav-item fw-bold">
                  <a class="nav-link text-primary text-decoration-underline" href="/home">Sign out</a>
                </li>
              </ul>
            </div>
          </center>
          </nav>
    </div>
<center>
 <h2>Service History</h2>
 <table class="table table-striped" style="width:60%">
     <thead>
         <tr>
             <th>Product Code</th>
             <th>Order Date</th>
             <th>Item Name</th>
             <th>Quantity</th>
         </tr>
     </thead>
     <tbody>

    `);
  
    // Fetch orders from MongoDB
    OrderModel.find().then(function(resultant_data) {
      let i = 1;
      resultant_data.forEach(order => {
        res.write(`
          <tr>
            <td>${order.product_code}</td>
            <td>${order.order_date.toLocaleDateString()}</td>
            <td>${order.product_name}</td>
            <td>${order.quantity}</td>
          </tr>
        `);
        i++;
      });
  
      // End the HTML structure
      res.write(`
         </tbody>
 </table>
<center>
<br><br>
    <footer class="footer bg-primary text-white">
      <div class="container-fluid">
        <div>
          <h4>Contact us</h4>
          <span>Phone: <a class="text-decoration-none text-white" href="tel:9944502937">9944502937</a></span> <br>
          <span>Mail: <a class="text-decoration-none text-white" href="mailto:gracegnanam@karunya.edu.in">gracegnanam@karunya.edu.in</a></span>
          <br>
          <div>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d90932.86363574275!2d76.86471896150667!3d11.050424147963179!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba859a7e16eca91%3A0x928f2bfaef0acdc6!2sElectro%20hub!5e0!3m2!1sen!2sin!4v1728826136526!5m2!1sen!2sin" width="600" height="200" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
          </div>
        </div>

        <div>
          <h4>About us</h4>
          <div>
          We serve you the highest quality of products and services, rising above the greatest expectations of any indiviual to cater the need for flawless services for your electronic devices and products.
          </div><br>
        </div>
      </div>
    </footer>
</body>
</html>
      `);
      res.end();
    }).catch(err => {
      console.error('Error fetching orders:', err);
      res.writeHead(500, { "Content-Type": "text/html" });
      res.write('Error retrieving service history.');
      res.end();
    });
  }
  





  else if (req.url === '/signin' && req.method === 'POST') {
    let rawdata = '';
    req.on('data', function (data) {
      rawdata += data;
    });
    req.on('end', function () {
      const formdata = new URLSearchParams(rawdata);
      const inputEmail = formdata.get('email');
      const inputPass = formdata.get('password');

      // Check if the email exists in the database
      UserModel.findOne({ email: inputEmail })
        .then((user) => {
          if (user) {
            // Check if the password matches
            if (user.pass === inputPass) {
              // Password is correct, sign-in success
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.write('<script>alert("Sign-in successful");</script>');
              res.write('<script>window.location.href = "/Client_Dashboard";</script>');
              res.end();
            } else {
              // Password does not match
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.write('<script>alert("Incorrect password");</script>');
              res.end();
            }
          } else {
            // Email does not exist
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write('<script>alert("No account found with this email");</script>');
            res.end();
          }
        })
        .catch(err => {
          console.error('Error during sign-in:', err);
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.write('<script>alert("Error occurred during sign-in");</script>');
          res.end();
        });
    });
  }





  else {
    // Handle 404 - Page not found
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.write('404 Not Found');
    res.end();
  }
});

// Function to serve HTML files
function serveFile(fileName, res) {
  const filePath = path.join(__dirname, fileName);
  fs.readFile(filePath, function (err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.write('404 Not Found');
      res.end();
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(data);
      res.end();
    }
  });
}

// Function to serve static files (CSS, JS, Images)
function serveStaticFile(filePath, res) {
  const extname = path.extname(filePath);
  let contentType = 'text/html';

  if (extname === '.css') {
    contentType = 'text/css';
  } else if (extname === '.js') {
    contentType = 'text/javascript';
  } else if (extname === '.jpg' || extname === '.jpeg') {
    contentType = 'image/jpeg';
  } else if (extname === '.png') {
    contentType = 'image/png';
  }

  const fullPath = path.join(__dirname, filePath);
  fs.readFile(fullPath, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.write(data);
      res.end();
    }
  });
}

// Start the server on port 8000
server.listen(8000, function () {
  console.log('Server started at http://localhost:8000/');
});