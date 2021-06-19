const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
var morgan = require('morgan')
var http = require('http');
const app = express();
var path = require('path');
var socketIO = require('socket.io');
var methodOverride = require('method-override')
// Passport Config
require('./config/passport')(passport);
var socket = require('socket.io');
// // DB Config
mongoose.connect('mongodb://localhost/users',{ useUnifiedTopology: true ,useNewUrlParser: true})
.then(console.log('connected to mongoDB'))
.catch(err=>{console.error('could not connect to data base',err)})

// const db = require('mongodb://localhost/login',{ useUnifiedTopology: true ,useNewUrlParser: true}).mongoURI;

// // Connect to MongoDB
// mongoose
//   .connect(
//     db
    
//   )
//   .then(() => console.log('MongoDB Connected'))
//   .catch(err => console.log(err));
// var app = require('http').createServer(app)
// var io = require('socket.io')(app);
//  var io = require('socket.io').(server);

// const httpServer = require("http").createServer(app);
const server = http.createServer(app);


// EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.use(morgan('tiny'));

app.use(methodOverride('X-HTTP-Method-Override'))

// Express body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);


//socket





// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Routes
app.use('/', require('./routes/index.js'));
app.use('/users', require('./routes/users.js'));
app.use('/posts', require('./routes/posts.js'));
app.use('/groups', require('./routes/groups.js'));
app.use('/panel', require('./routes/panel.js'));
app.use('/repository', require('./routes/repository.js'));

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, console.log(`Server running on  ${PORT}`));


// app.listen(app.get('port'), function(){
// 	console.log('Server started on port '+app.get('port'));
// });
app.set('port', (process.env.PORT || 5000));
server.listen(app.get('port'),function(){
      console.log('server running on port 5000');
    });
    const io= socketIO(server);
    require('./socket/friend')(io);
   