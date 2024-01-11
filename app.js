if(process.env.Node_ENV !== "production"){
    require('dotenv').config();
}


const express = require('express');
const path = require('path');
const ExpressError = require('./utils/expressError.js');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const flash = require('connect-flash');
const methodOverride = require('method-override');
const campgroundRoutes = require('./routes/campground.js');
const reviewRoutes = require('./routes/reviews.js');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const dbURL = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const secret = process.env.SECRET || 'thisShouldBeSecret';

// const localDB = 'mongodb://localhost:27017/yelp-camp';

mongoose.set('strictQuery', true)
mongoose.connect(dbURL);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database conncection");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

// const store = new MongoStore({
//     url:dbURL,
//     secret:"ThisSHouldBeSecret",
//     touchAfter: 24 * 60 * 60
// });


// store.on("error", function (e) {
//     console.log("SESSION STORE ERROR", e)
// });

const sessionConfig = {
    store: MongoStore.create({ mongoUrl: dbURL }),
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
    
};


app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());



const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
];
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dwtcc3voj/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
 
app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 


app.use((req, res, next) => {
    console.log(req.query, "hello");
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});



    app.use('/', userRoutes);
    app.use("/campgrounds", campgroundRoutes);
    app.use('/campgrounds/:id/reviews', reviewRoutes);

    
    app.get('/', (req,res) => {
        res.render('home');
    });


    app.get("/aboutMe/myResume", (req, res) => {
        res.render('myResume');

    });

   

    


    app.all('*', (req, res, next) => {
        next(new ExpressError('Page Not Found', 404));
    });


app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh No, Something Went Wrong';
     res.status(statusCode).render('error', { err });
});




app.listen(3000, () => {
    console.log('Serving on port 3000')
});