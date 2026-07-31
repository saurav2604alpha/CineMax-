require("dotenv").config();
const mongoose  = require("mongoose");
const bcrypt    = require("bcryptjs");

const User       = require("../models/user.model");
const Movie      = require("../models/movie.model");
const Theater    = require("../models/theater.model");
const Screen     = require("../models/screen.model");
const Showtime   = require("../models/showtime.model");
const Concession = require("../models/concession.model");

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/cinemax";

const movies = [
  {
    title: "Avengers: Secret Wars",
    overview: "The multiverse collapses as Earth's mightiest heroes face their greatest threat yet.",
    poster: "https://image.tmdb.org/t/p/w500/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg",
    background: "https://image.tmdb.org/t/p/original/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg",
    trailer: "https://www.youtube.com/watch?v=ZlNFpri-Y38",
    genre: ["Action","Adventure","Sci-Fi"],
    rating: "9.2", duration: 180,
    releaseDate: new Date("2024-05-01"),
    director: "The Russo Brothers",
    cast: [{ artist:"Robert Downey Jr.", name:"Tony Stark" }, { artist:"Chris Evans", name:"Steve Rogers" }],
    reviews: [],
  },
  {
    title: "Dune: Messiah",
    overview: "Paul Atreides rules the universe but faces betrayal from within.",
    poster: "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    background: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    trailer: "https://www.youtube.com/watch?v=n9xhJrPXop4",
    genre: ["Sci-Fi","Drama","Adventure"],
    rating: "8.8", duration: 165,
    releaseDate: new Date("2024-11-22"),
    director: "Denis Villeneuve",
    cast: [{ artist:"Timothée Chalamet", name:"Paul Atreides" }, { artist:"Zendaya", name:"Chani" }],
    reviews: [],
  },
  {
    title: "The Dark Knight Returns",
    overview: "Bruce Wayne returns from retirement when Gotham faces a new enemy.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    background: "https://image.tmdb.org/t/p/original/hkBaDkMWbLaf8B1lsLIbf1nMHFm.jpg",
    trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    genre: ["Action","Thriller","Drama"],
    rating: "9.0", duration: 152,
    releaseDate: new Date("2025-07-18"),
    director: "Christopher Nolan",
    cast: [{ artist:"Christian Bale", name:"Bruce Wayne" }, { artist:"Heath Ledger", name:"The Joker" }],
    reviews: [],
  },
  {
    title: "Interstellar: Beyond",
    overview: "A new crew ventures through the wormhole to discover humanity's second chance.",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    background: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    trailer: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    genre: ["Sci-Fi","Drama","Adventure"],
    rating: "8.9", duration: 169,
    releaseDate: new Date("2025-11-14"),
    director: "Christopher Nolan",
    cast: [{ artist:"Matthew McConaughey", name:"Cooper" }, { artist:"Anne Hathaway", name:"Brand" }],
    reviews: [],
  },
  {
    title: "Spider-Man: Beyond the Web",
    overview: "Miles Morales teams up with new Spider-People across the multiverse.",
    poster: "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    background: "https://image.tmdb.org/t/p/original/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg",
    trailer: "https://www.youtube.com/watch?v=1I4az-ZlnBY",
    genre: ["Animation","Action","Adventure"],
    rating: "9.3", duration: 140,
    releaseDate: new Date("2026-03-22"),
    director: "Joaquim Dos Santos",
    cast: [{ artist:"Shameik Moore", name:"Miles Morales" }],
    reviews: [],
  },
  {
    title: "Oppenheimer: Legacy",
    overview: "The untold aftermath of the Trinity test and the man who changed history.",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    background: "https://image.tmdb.org/t/p/original/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg",
    trailer: "https://www.youtube.com/watch?v=uYPbbksJxIg",
    genre: ["Drama","History","Thriller"],
    rating: "8.7", duration: 185,
    releaseDate: new Date("2026-06-01"),
    director: "Christopher Nolan",
    cast: [{ artist:"Cillian Murphy", name:"J. Robert Oppenheimer" }],
    reviews: [],
  },
];

const concessions = [
  { photo:"https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300", name:"Large Popcorn",        price:185, stock:100 },
  { photo:"https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300", name:"Regular Popcorn",      price:120, stock:100 },
  { photo:"https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300", name:"Nachos with Cheese",   price:165, stock:80  },
  { photo:"https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=300", name:"Large Coke",           price:95,  stock:150 },
  { photo:"https://images.unsplash.com/photo-1564419320461-6870880221ad?w=300", name:"Bottled Water",        price:45,  stock:200 },
  { photo:"https://images.unsplash.com/photo-1603033156166-2ae22eb2b7e2?w=300", name:"Hotdog Sandwich",      price:95,  stock:60  },
  { photo:"https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=300", name:"Combo: Popcorn+Drink", price:250, stock:80  },
  { photo:"https://images.unsplash.com/photo-1555638741-4a36de0a3ccf?w=300", name:"M&Ms (Sharing Size)",  price:75,  stock:120 },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    await Promise.all([Movie.deleteMany({}), Theater.deleteMany({}), Screen.deleteMany({}), Showtime.deleteMany({}), Concession.deleteMany({})]);
    console.log("🗑️  Cleared existing data");

    const createdMovies = await Movie.insertMany(movies);
    console.log(`🎬 Created ${createdMovies.length} movies`);

    await Concession.insertMany(concessions);
    console.log(`🍿 Created ${concessions.length} concession items`);

    const theater = await Theater.create({
      name: "CineMax Grand",
      cinemaImg: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=800",
      location: { address: "123 Cinema Drive", city: "Manila", mapUrl: "https://maps.google.com/?q=Manila" },
      amenities: ["IMAX","4DX","Dolby Atmos","Parking","Food Court","Wi-Fi"],
      contact: { phone: "+63 2 8888 0000", email: "info@cinemax.ph" },
      operatingHours: { open: "10:00 AM", close: "11:00 PM" },
      isActive: true,
    });
    console.log(`🏛️  Created theater: ${theater.name}`);

    const screenData = [
      { name:"Hall 1 – IMAX",     seatingCapacity:120, screenType:"IMAX",     features:["IMAX","Dolby Atmos"] },
      { name:"Hall 2 – 4DX",      seatingCapacity:80,  screenType:"4DX",      features:["4DX","Motion Seats"] },
      { name:"Hall 3 – Standard", seatingCapacity:96,  screenType:"Standard", features:["Standard"] },
      { name:"Hall 4 – Standard", seatingCapacity:96,  screenType:"Standard", features:["Standard"] },
    ];
    const screens = await Screen.insertMany(screenData);
    console.log(`🎭 Created ${screens.length} screens`);

    const today    = new Date(); today.setHours(0,0,0,0);
    const dates    = [0,1,2,3,4].map(d => { const x = new Date(today); x.setDate(x.getDate()+d); return x; });
    const times    = [{ startTime:"10:00 AM", endTime:"12:30 PM" }, { startTime:"02:00 PM", endTime:"04:30 PM" }, { startTime:"07:00 PM", endTime:"09:30 PM" }];
    const priceMap = { IMAX:380, "4DX":450, Standard:280 };

    const showtimeData = [];
    for (const movie of createdMovies.slice(0,4)) {
      for (const screen of screens.slice(0,2)) {
        for (const date of dates.slice(0,3)) {
          for (const { startTime, endTime } of times) {
            showtimeData.push({
              movieId: movie._id, theaterId: theater._id, screenId: screen._id,
              hall: screen.name, date, startTime, endTime,
              availableSeats: screen.seatingCapacity,
              bookedSeats: [], price: priceMap[screen.screenType] || 280, isActive: true,
            });
          }
        }
      }
    }
    await Showtime.insertMany(showtimeData);
    console.log(`📅 Created ${showtimeData.length} showtimes`);

    if (!await User.findOne({ email:"admin@cinemax.ph" })) {
      await User.create({ firstName:"Cinema", lastName:"Admin", email:"admin@cinemax.ph", password: await bcrypt.hash("Admin@123",12), isAdmin:true });
      console.log("👤 Admin: admin@cinemax.ph / Admin@123");
    }
    if (!await User.findOne({ email:"user@cinemax.ph" })) {
      await User.create({ firstName:"Test", lastName:"User", email:"user@cinemax.ph", password: await bcrypt.hash("User@1234",12), isAdmin:false });
      console.log("👤 User:  user@cinemax.ph  / User@1234");
    }

    console.log("\n✅ Database seeded successfully!");
    console.log("─────────────────────────────────────────────");
    console.log("🔑 Admin: admin@cinemax.ph  / Admin@123");
    console.log("🔑 User:  user@cinemax.ph   / User@1234");
    console.log("─────────────────────────────────────────────");
  } catch (err) {
    console.error("❌ Seed error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
