require("dotenv").config()
const express = require("express");
const User = require("./models/user.model");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const app = express();
app.use(express.static('dist'))
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to the home page");
});

try {
  mongoose.connect(`mongodb+srv://Anoop:anoop123@cluster0.vayg0jw.mongodb.net/`);
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
      `http://api.weatherstack.com/current?access_key=ca669715ac4e94d66dd71220c7bcdf58&query=${city}`
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

    if(!Bankdata){
      return res.send("ifsc code id wrong")
    }
    const existingUser = await User.findOne({ user_id : req.body.id });

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

      } 

    else{

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
          temp: weatherData.current.temperature,
          humidity: weatherData.current.humidity,
        },
    });
  }

    return res.send("User added successfully");
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
