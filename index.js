require("dotenv").config();
const express = require("express");
const User = require("./models/user.model");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the home page");
});

try {
  mongoose.connect(`${process.env.MONGO_URL}`);
} catch (error) {
  console.log("DB connection failed");
}

async function fetchBankData(ifsc) {
  try {
    const response = await axios.get(`https://ifsc.razorpay.com/${ifsc}`);
    const data = response.data;
    return data;
  } catch (error) {
    return false;
  }
}

async function fetchweatherData(city) {
  try {
    const response = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=c829d0d974a948f0834164116241901&q=${city}`
    );
    const data = response.data;
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("default weather");
  }
}

app.post("/register", async (req, res) => {
  try {
    const Bankdata = await fetchBankData(req.body.ifsc);

    if (!Bankdata) {
      return res.send("ifsc code id wrong");
    }
    const existingUser = await User.findOne({ user_id: req.body.id });

    if (existingUser) {
      existingUser.bank_accounts.push(req.body.ifsc);
      existingUser.accounts.push({
        bank: Bankdata.BANK,
        branch: Bankdata.BRANCH,
        address: Bankdata.ADDRESS,
        city: Bankdata.CITY,
        district: Bankdata.DISTRICT,
        state: Bankdata.STATE,
        bank_code: Bankdata.IFSC,
      });

      await existingUser.save();
      res.send("user added successfully");
    } else {
      const weatherData = await fetchweatherData(Bankdata.CITY);

      await User.create({
        user_id: req.body.id,
        user_name: req.body.name,
        bank_accounts: Bankdata.IFSC,
        name: req.body.name,
        accounts: [
          {
            bank: Bankdata.BANK,
            branch: Bankdata.BRANCH,
            address: Bankdata.ADDRESS,
            city: Bankdata.CITY,
            district: Bankdata.DISTRICT,
            state: Bankdata.STATE,
            bank_code: Bankdata.IFSC,
          },
        ],
        weather: {
          temp: weatherData.current.temp_c,
          humidity: weatherData.current.humidity,
        },
      });
    }
    return res.send("User created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/details", async (req, res) => {
  const allUser = await User.find();
  res.send(allUser);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is ready at port ${process.env.PORT}`);
});
 