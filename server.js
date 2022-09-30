const express = require("express");
const multer = require("multer");
const path = require("path");
const Customer = require("./models/Customer");
const PORT = process.env.PORT || 3001;
const app = express();

// importing the Dog model
const Dog = require("./models/Dog");

// middlewares
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
// setting up the template engine to EJS
app.set("view engine", "ejs");

// set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/assets/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });

// importing the DB
require("./config/db");

// routes
// home route
app.get("/", async (req, res, next) => {
  try {
    const dogs = await Dog.find();
    return res.status(200).render("index", {
      title: "Livestock Management System",
      lists: dogs,
    });
  } catch (error) {
    next(error);
  }
});

// add route
app.get("/add", (req, res, next) => {
  try {
    res.status(200).render("add", {
      title: "Add Livestock | Livestock Management System",
      success: false,
      text: null,
    });
  } catch (error) {
    next(error);
  }
});

// about us route
app.get("/about", (req, res, next) => {
  try {
    res.status(200).render("about", {
      title: "About | Livestock Management System",
    });
  } catch (error) {
    next(error);
  }
});

// get single details of a livestock route
app.get("/info/:id", async (req, res, next) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog) {
      return res.status(401).send("An error ocurred!");
    }
    res.status(200).render("info", {
      title: "Livestock Details | Livestock Management System",
      breed: dog,
    });
  } catch (error) {
    next(error);
  }
});

// edit single details of a livestock route
app.get("/edit/:id", async (req, res, next) => {
  try {
    // get dog details for edit
    const dog = await Dog.findById(req.params.id);

    return res.status(200).render("edit", {
      title: "Livestock Edit Details | Livestock Management System",
      error: null,
      dog,
      text: null,
    });
  } catch (error) {
    next(error);
  }
});

// customers route
app.get("/customers", async (req, res, next) => {
  try {
    const customers = await Customer.find().populate("dog");
    res.status(200).render("customers", {
      title: "Customers | Livestock Management System",
      customers,
      phone: null,
    });
  } catch (error) {
    next(error);
  }
});

// sells route page
app.get("/sells", async (req, res, next) => {
  try {
    // get all livestock details
    const dogs = await Dog.find();

    res.status(200).render("sells", {
      title: "Livestock Sells | Livestock Management System",
      error: null,
      dogs,
    });
  } catch (error) {
    next(error);
  }
});

// POST requests

// route to add dog
app.post("/add", upload.single("image"), async (req, res, next) => {
  try {
    const { name, height, color, health } = req.body;

    const addDog = await Dog.create({
      name,
      health,
      color,
      height,
      image: req.file.filename,
    });

    if (addDog) {
      res.status(200).render("add", {
        title: "Add Livestock | Livestock Management System",
        success: true,
        text: null,
      });
    } else {
      res.status(200).render("add", {
        title: "Add Livestock | Livestock Management System",
        success: false,
        text: null,
      });
    }
  } catch (error) {
    return res.status(200).render("add", {
      title: "Add Livestock | Livestock Management System",
      success: false,
      text: "All input are required",
    });
  }
});

// route to edit dog info
app.post("/edit", upload.single("image"), async (req, res, next) => {
  try {
    const { name, height, color, health } = req.body;

    const editDetails = await Dog.findByIdAndUpdate(
      { _id: req.body.id },
      {
        name,
        height,
        color,
        health,
        image: req.file.filename,
      },
      { new: true }
    );

    if (editDetails) {
      return res.status(200).render("edit", {
        title: "Livestock Edit Details | Livestock Management System",
        error: "Breed updated successfully!",
      });
    } else {
      return res.status(200).render("edit", {
        title: "Livestock Edit Details | Livestock Management System",
        error:
          "An error occured while updating the bread please try again later",
      });
    }
  } catch (error) {
    const dog = await Dog.findById(req.body.id);
    return res.status(200).render("edit", {
      title: "Livestock Edit Details | Livestock Management System",
      error: null,
      text: "Please select an image",
      dog,
    });
  }
});

// route to sell livestock
app.post("/sells", async (req, res, next) => {
  try {
    const dogs = await Dog.find();
    const customer = await Customer.create({
      fname: req.body.fname,
      lname: req.body.lname,
      phone_number: req.body.phone_number,
      email: req.body.email,
      dog: req.body.dog,
      seller_fname: req.body.seller_fname,
      seller_lname: req.body.seller_lname,
      seller_email: req.body.seller_email,
      seller_phone_number: req.body.seller_phone_number,
    });

    if (customer) {
      return res.status(200).render("sells", {
        title: "Livestock Sells | Livestock Management System",
        error: "Details save successfully",
      });
    } else {
      return res.status(200).render("sells", {
        title: "Livestock Sells | Livestock Management System",
        error:
          "An error occured while saving the details please try again later",
      });
    }
  } catch (error) {
    const dogs = await Dog.find();

    return res.status(200).render("sells", {
      title: "Livestock Sells | Livestock Management System",
      error: "All inputs are required!",
      dogs,
    });
  }
});

// search query
app.get("/search", async (req, res, next) => {
  try {
    // check if phone number exit
    const phone = await Customer.findOne({
      phone_number: req.query.phone,
    }).populate("dog");
    if (!phone) return res.status(200).send("Invalid phone number");

    res.status(200).render("customers", {
      title: "Customers | Livestock Management System",
      customers: null,
      phone,
    });
  } catch (error) {
    next(error);
  }
});

// page not found route
app.get("*", (req, res, next) => {
  try {
    res.status(200).render("pagenot", {
      title: "404 Page not found | Livestock Management System",
    });
  } catch (error) {
    next(error);
  }
});

app.listen(PORT, () => console.log("Server running on port ", PORT));
