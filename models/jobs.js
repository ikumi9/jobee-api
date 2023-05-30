const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");
const geoCoder = require("../utils/geocoder");

const jobSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    maxLength: [500, "Title must not exceed 100 characters."],
  },
  slug: String,
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxLength: [500, "Description must not exceed 100 charaxters."],
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Add a valid email"],
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  company: {
    type: String,
    required: [true, "Company is required"],
  },
  industry: {
    type: [String],
    required: [true, "Industry is required!"],
    enum: {
      values: [
        "Business",
        "Information Technology",
        "Banking",
        "Education/Training",
        "Telecommunication",
        "Others",
      ],
      message: "Select correct option for industry",
    },
  },
  jobType: {
    type: String,
    required: [true, "Please enter job type."],
    enum: {
      values: ["Permanent", "Temporary", "Internship"],
      message: "Please select correct options for job type.",
    },
  },
  minEducation: {
    type: String,
    required: [true, "Please enter minimum education for this job."],
    enum: {
      values: ["Bachelors", "Masters", "Phd"],
      message: "Please select correct options for Education.",
    },
  },
  positions: {
    type: Number,
    default: 1,
  },
  experience: {
    type: String,
    required: [true, "Please enter experience required for this job."],
    enum: {
      values: [
        "No Experience",
        "1 Year - 2 Years",
        "2 Year - 5 Years",
        "5 Years+",
      ],
      message: "Please select correct options for Experience.",
    },
  },
  salary: {
    type: Number,
    required: [false, "Please enter expected salary for this job."],
  },
  postingDate: {
    type: Date,
    default: Date.now,
  },
  lastDate: {
    type: Date,
    default: new Date().setDate(new Date().getDate() + 7), // Expire after 7 days
  },
  applicantsApplied: {
    type: [Object],
    select: false,
  },
});

// set index on title field
jobSchema.index({
  title: "text",
});

// create slug before saving to database
jobSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

// Setting up Location
jobSchema.pre("save", async function (next) {
  const loc = await geoCoder.geocode(this.address);

  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };
});

module.exports = mongoose.model("Jobs", jobSchema);
