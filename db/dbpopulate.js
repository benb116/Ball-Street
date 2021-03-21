const { Sequelize, Op, Model, DataTypes } = require("sequelize");
const config = require('../config');
const u = require('../util');

async function PopulateDB(sequelize) {
    await sequelize.sync({ force: true });
    const { NFLPosition, RosterPosition, NFLDivision, NFLTeam, NFLPlayer, Contest, User, Entry } = sequelize.models;

    // Define NFL positions
    const nflpos = {
        'FLEX': {id: config.FlexNFLPositionId, canflex: false},
        'QB': {id: 1, canflex: false},
        'RB': {id: 2, canflex: true},
        'WR': {id: 3, canflex: true},
        'TE': {id: 4, canflex: true},
        'K': {id: 5, canflex: false},
        'DEF': {id: 6, canflex: false},
    };
    const nflposrecords = Object.keys(nflpos).map(p => {
        return {...nflpos[p], name: p};
    });
    await NFLPosition.bulkCreate(nflposrecords);  
    // NFLPosition.findAll().then(console.log);  

    // Define roster positions
    const rosterpos = {
        'QB1': 'QB',
        'RB1': 'RB',
        'RB2': 'RB',
        'WR1': 'WR',
        'WR2': 'WR',
        'TE1': 'TE',
        'FLEX1': 'FLEX',
        'FLEX2': 'FLEX',
        'K1': 'K',
        'DEF1': 'DEF'
    };
    const rosposrecords = Object.keys(rosterpos).map(p => {
        return {name: p, NFLPositionId: nflpos[rosterpos[p]].id};
    });
    const row = await RosterPosition.bulkCreate(rosposrecords);
    // RosterPosition.findAll().then(console.log);  

    // Define NFL divisions
    const divs = {
        'NFC East': {id: 1, isafc: false},
        'NFC West': {id: 2, isafc: false},
        'NFC North': {id: 3, isafc: false},
        'NFC South': {id: 4, isafc: false},
        'AFC East': {id: 5, isafc: true},
        'AFC West': {id: 6, isafc: true},
        'AFC North': {id: 7, isafc: true},
        'AFC South': {id: 8, isafc: true},
    };
    const divrecords = Object.keys(divs).map(d => {
        return {...divs[d], name: d};
    });
    await NFLDivision.bulkCreate(divrecords);    

    // Define NFL teams
    const teams = {
        "ARI": {location: "Arizona", name: "Cardinals", id: 1, division: "NFC West", fullname: "Arizona Cardinals"},
        "ATL": {location: "Atlanta", name: "Falcons", id: 2, division: "NFC South", fullname: "Atlanta Falcons"},
        "BAL": {location: "Baltimore", name: "Ravens", id: 3, division: "AFC North", fullname: "Baltimore Ravens"},
        "BUF": {location: "Buffalo", name: "Bills", id: 4, division: "AFC East", fullname: "Buffalo Bills"},
        "CAR": {location: "Carolina", name: "Panthers", id: 5, division: "NFC South", fullname: "Carolina Panthers"},
        "CHI": {location: "Chicago", name: "Bears", id: 6, division: "NFC North", fullname: "Chicago Bears"},
        "CIN": {location: "Cincinnati", name: "Bengals", id: 7, division: "AFC North", fullname: "Cincinnati Bengals"},
        "CLE": {location: "Cleveland", name: "Browns", id: 8, division: "AFC North", fullname: "Cleveland Browns"},
        "DAL": {location: "Dallas", name: "Cowboys", id: 9, division: "NFC East", fullname: "Dallas Cowboys"},
        "DEN": {location: "Denver", name: "Broncos", id: 10, division: "AFC West", fullname: "Denver Broncos"},
        "DET": {location: "Detroit", name: "Lions", id: 11, division: "NFC North", fullname: "Detroit Lions"},
        "GB": {location: "Green Bay", name: "Packers", id: 12, division: "NFC North", fullname: "Green Bay Packers"},
        "HOU": {location: "Houston", name: "Texans", id: 13, division: "AFC South", fullname: "Houston Texans"},
        "IND": {location: "Indianapolis", name: "Colts", id: 14, division: "AFC South", fullname: "Indianapolis Colts"},
        "JAX": {location: "Jacksonville", name: "Jaguars", id: 15, division: "AFC South", fullname: "Jacksonville Jaguars"},
        "KC": {location: "Kansas City", name: "Chiefs", id: 16, division: "AFC West", fullname: "Kansas City Chiefs"},
        "MIA": {location: "Miami", name: "Dolphins", id: 17, division: "AFC East", fullname: "Miami Dolphins"},
        "MIN": {location: "Minnesota", name: "Vikings", id: 18, division: "NFC North", fullname: "Minnesota Vikings"},
        "NE": {location: "New England", name: "Patriots", id: 19, division: "AFC East", fullname: "New England Patriots"},
        "NO": {location: "New Orleans", name: "Saints", id: 20, division: "NFC South", fullname: "New Orleans Saints"},
        "NYG": {location: "New York", name: "Giants", id: 21, division: "NFC East", fullname: "New York Giants"},
        "NYJ": {location: "New York", name: "Jets", id: 22, division: "AFC East", fullname: "New York Jets"},
        "LV": {location: "Las Vegas", name: "Raiders", id: 23, division: "AFC West", fullname: "Las Vegas Raiders"},
        "PHI": {location: "Philadelphia", name: "Eagles", id: 24, division: "NFC East", fullname: "Philadelphia Eagles"},
        "PIT": {location: "Pittsburgh", name: "Steelers", id: 25, division: "AFC North", fullname: "Pittsburgh Steelers"},
        "LAC": {location: "Los Angeles", name: "Chargers", id: 26, division: "AFC West", fullname: "Los Angeles Chargers"},
        "SF": {location: "San Francisco", name: "49ers", id: 27, division: "NFC West", fullname: "San Francisco 49ers"},
        "SEA": {location: "Seattle", name: "Seahawks", id: 28, division: "NFC West", fullname: "Seattle Seahawks"},
        "LAR": {location: "Los Angeles", name: "Rams", id: 29, division: "NFC West", fullname: "Los Angeles Rams"},
        "TB": {location: "Tampa Bay", name: "Buccaneers", id: 30, division: "NFC South", fullname: "Tampa Bay Buccaneers"},
        "TEN": {location: "Tennessee", name: "Titans", id: 31, division: "AFC South", fullname: "Tennessee Titans"},
        "WAS": {location: "Washington", name: "Football Team", id: 32, division: "NFC East", fullname: "Washington Football Team"},
    };
    const teamfullnamearr = Object.values(teams).map(e => e.fullname);
    const teamabrs = Object.keys(teams);
    const teamfullnameMap = teamfullnamearr.reduce((acc, cur, i) => {
        acc[cur] = teamabrs[i];
        return acc;
    }, {});
    const teamrecords = Object.keys(teams).map(t => {
        let obj = {...teams[t], abr: t, NFLDivisionId: divs[teams[t].division].id};
        delete obj.division;
        delete obj.fullname;
        return obj;
    });
    await NFLTeam.bulkCreate(teamrecords);    

    // Define NFL players
    const players = require('./nflplayers.json');
    let playerrecords = players.map(p => {
        let obj = {};
        obj.id = p.player_id;
        obj.name = p.name;
        const posind = Object.keys(nflpos).indexOf(p.position);
        if (posind === -1) { return null; }
        obj.NFLPositionId = posind;
        obj.jersey = p.jersey;
        obj.NFLTeamId = teams[teamfullnameMap[p.team]].id;
        return obj;
    }).filter(e => e !== null);
    const teamdefrecords = teamfullnamearr.map(t => {
        let obj = {};
        const abr = teamfullnameMap[t];
        obj.id = teams[abr].id;
        obj.name = t;
        obj.NFLPositionId = nflpos.DEF.id;
        obj.NFLTeamId = teams[abr].id;

        return obj;
    });
    await NFLPlayer.bulkCreate(playerrecords);
    await NFLPlayer.bulkCreate(teamdefrecords);

    // Give Jalen Hurts a preprice
    const hurtsID = await NFLPlayer.findOne({
        where: { name: 'Jalen Hurts'},
        attributes: ['id']
    }).then(data => data.dataValues.id);
    await NFLPlayer.update({ preprice: 17000 }, { where: { id: hurtsID } });

    // Give Ezekiel Elliott a preprice
    const EllID = await NFLPlayer.findOne({
        where: { name: 'Ezekiel Elliott'},
        attributes: ['id']
    }).then(data => data.dataValues.id);
    await NFLPlayer.update({ preprice: 1700 }, { where: { id: EllID } });


    // Define existing contest
    const con = {
        id: 1,
        name: 'Ball Street Big One',
        nflweek: 1
    };
    await Contest.bulkCreate([con]);


    // Define Users
    const usrs = [ 'email1@gmail.com', 'email2@gmail.com', 'email3@gmail.com', 'email4@gmail.com' ];
    await User.bulkCreate(usrs.map(u => {
        return {email: u};
    }));

    const entrs = usrs.map((e, i) => {
        return { UserId: i+1, ContestId: 1 };
    });
    await Entry.bulkCreate(entrs);

    // User.findAll().then(console.log);

    // const NYteams = await sequelize.models.NFLTeam.findOne({
    //     where: {
    //         location: { [Op.startsWith]: 'New York' },
    //     },
    //     attributes: ['name', 'abr']    
    // }).then(util.dv);
    // console.log(NYteams);
}

module.exports = PopulateDB;