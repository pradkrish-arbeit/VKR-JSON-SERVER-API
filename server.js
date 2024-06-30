// server.js
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const cors = require('cors'); // Import the cors middleware
 
server.use(cors()); // Enable CORS for all routes

// Middleware to parse JSON bodies
server.use(bodyParser.json());


const dbPath = './db.json';

server.put('/import-bier-folks', (req, res) => {
    const newUsers = req.body;
    fs.readFile(dbPath, (err, data) => {
        if (err) {
            return res.status(500).send('Error reading database');
        }
        let db = JSON.parse(data);
        newUsers.forEach(newUser => {
            const index = db.users.findIndex(user => user.userName === newUser.userName || user.email === newUser.email);
            if (index > -1) {
                db.users[index] = { ...db.users[index], ...newUser }; // Merge existing user data with new data
            } else {
                db.users.push(newUser);
            }
        });
        fs.writeFile(dbPath, JSON.stringify(db, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing database');
            }
            res.send('Users updated successfully');
        });
    });
});



// POST endpoint to send email
server.post('/send-email', async (req, res) => {
  const { userId, subject, text } = req.body;

  try {
    // Fetch user data from JSON server
    //const response = await axios.get(`http://localhost:5000/users/${userId}`);
    //const user = response.data;

    // Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'biermitdir@gmail.com', // Your email address
        pass: 'ybkq galh ryai jsex',  // Your email password or app password
      },
    });

    // Setup email data
    let mailOptions = {
      from: 'biermitdir@gmail.com', // Sender address
      to: 'sndpkmr80@gmail.com',               // Recipient address
      subject: subject,             // Subject line
      text: text,                   // Plain text body
    };

    // Send email
    await transporter.sendMail(mailOptions);
    res.status(200).send({'status':'ok','msg':'Email sent successfully'});
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({'status':'fail','msg':'Error sending email'});
  }
});

// Enable CORS for all routes
/*server.use(cors({
  origin: 'http://127.0.0.1:5500', // Your client URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));*/

// Handle preflight requests
//server.options('*', cors());

server.use(middlewares)
server.use('', router)


server.listen(process.env.PORT || 5000, () => {
  console.log('JSON Server is running')
})
