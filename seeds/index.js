const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');


// res.set({'Accept-Version': 'v1'});


mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database conncection");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //Your User ID
            author: '64f938e3fe90892a7a664490',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Wide Open Road in the woods",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                             cities[random1000].longitude,
                             cities[random1000].latitude,
            ]
            },
            images:[
                {
                  url: 'https://res.cloudinary.com/dwtcc3voj/image/upload/v1703556744/YelpCamp/adw7n0w5mqdjpofcmjss.avif',
                  filename: 'YelpCamp/adw7n0w5mqdjpofcmjss',
                },
                
                {
                  url: 'https://res.cloudinary.com/dwtcc3voj/image/upload/v1703556746/YelpCamp/v0fbzg4yefm944o1xyx4.avif',
                  filename: 'YelpCamp/v0fbzg4yefm944o1xyx4',
                }
              ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})