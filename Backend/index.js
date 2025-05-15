// const express = require('express');
// const bodyParser = require('body-parser');
// const path = require('path');
// const app = express();
// const cors = require('cors');

// app.use(cors());
// app.use(bodyParser.json());

// const userRoutes = require('./routes/userRoutes');

// require('dotenv').config();
// require('./db'); // Ensure this file connects to MongoDB

// const PORT = process.env.PORT || 8000;

// app.use(express.static(path.join(__dirname, '../client')));
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/signup.html'));
// });

// app.use('/', userRoutes);

// app.use('/ai',ai)

// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });


const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

const userRoutes = require('./routes/userRoutes');

require('dotenv').config();
require('./db'); // Ensure this file connects to MongoDB

const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname,'..' ,'Client')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,'..' ,'Client','home.html'));
});

app.use('/', userRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});