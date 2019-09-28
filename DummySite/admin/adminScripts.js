const mongoose = require("mongoose");
const Market = require("../models/Market");
// DB Config
const db = require("../config/keys").mongoURI;

// Connect to MongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("MongoDB successfully connected"))
.catch(err => console.log(err));

function createMarket(marketInfo) {
    Market.findOne({ marketID: marketInfo.marketID }).then(market => {
        if (market) {
          return console.log('Market with that ID already exists');
        } else {
            const newMarket = new Market({
                marketID: marketInfo.marketID,
                name: marketInfo.name,
                rules: marketInfo.rules,
                active: marketInfo.active,
                date: marketInfo.date,
                resolutionDate: marketInfo.resolutionDate,
                imageURL: marketInfo.imageURL,
                contracts: marketInfo.contracts,
            });
            console.log(newMarket);
            newMarket.save().then(console.log).catch(console.log);
        }
    });
}

function updateMarket(marketInfo) {
    Market.findOne({ marketID: marketInfo.marketID }).then(market => {
        if (!market) {
          return console.log('No market with that ID');
        } else {
            Object.assign(market, marketInfo);
            console.log(market);
            market.save().then(console.log).catch(console.log);
        }
    });
}

var mID = '1';
const theinfo = {
    marketID: mID, 
    name: 'Who will be MVP of the 2019 NFL season?', 
    rules: 'rules', 
    active: true, 
    date: new Date(), 
    resolutionDate: new Date(), 
    imageURL: '', 
    contracts: [
        { 
            contractID: mID+'-1',
            contractName: 'Antonio Brown',
            imageURL: '',
        },
        { 
            contractID: mID+'-2',
            contractName: 'Tyreek Hill',
            imageURL: '',
        },
        { 
            contractID: mID+'-3',
            contractName: 'Aaron Hernandez',
            imageURL: '',
        },
    ],
};

const newInfo = {
    marketID: '1',
    rules: 'te2st'
};

createMarket(theinfo);
// updateMarket(newInfo);