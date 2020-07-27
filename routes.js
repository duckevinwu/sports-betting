// Code below for testing in production

var config = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
}

const axios = require("axios");
const cheerio = require("cheerio");
var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);

/* -------------------------------------------------- */
/* ------------------- Route Handlers --------------- */
/* -------------------------------------------------- */

/* ---- (Dashboard) ---- */
function getAllPeople(req, res) {
  var query = `
    SELECT login, name, birthyear
    FROM Person;
  `;
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      res.json(rows);
    }
  });
};

/* ---- Part 2 (FindFriends) ---- */
function getFriends(req, res) {
  var inputLogin = req.params.login;

  // TODO: (3) - Edit query below
  var query = `
    SELECT f.friend, p.name
    FROM Friends f JOIN Person p ON f.friend=p.login
    WHERE f.login='${inputLogin}'
  `;
  connection.query(query, function(err, rows, fields) {
    if (err) console.log(err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
};


// ----------------------------------------------------------
// ---------------- GENERATE EMAIL --------------------------
// ----------------------------------------------------------

function scrapeSchedule(callback) {

  var currDate = getCurrDate();

  axios.get('https://www.scoresandodds.com/nba?date=' + currDate)
    .then(function (response) {
      // handle success
      var pageData = response.data
      // console.log(response.data)
      const $ = cheerio.load(pageData)

      var games = [];

      $('.event-card-table').each((i, game) => {

        var gameObj = {};

        var gameDate = $('.event-card-header span', game).data('value');
        var gameDateObject = new Date(gameDate);

        gameObj.time = getTimeFromDate(gameDateObject);

        var spreadArr = $('[data-field="current-spread"]', game);
        var side = spreadArr.data('side');

        var spread = $('.data-value', spreadArr).text().trim();

        if (side === 'away') {
          gameObj.spread1 = spread;
          gameObj.spread2 = convertSpread(spread);
        } else {
          gameObj.spread1 = convertSpread(spread);
          gameObj.spread2 = spread;
        }

        var teamArr = $('.team-emblem', game);

        var team1 = $(teamArr[0]).text();
        var team2 = $(teamArr[1]).text();

        gameObj.team1 = team1;
        gameObj.team2 = team2;

        games.push(gameObj);
      });

      callback(games);

    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
}

function convertSpread(s) {
  var newSpread = 0.0 - parseFloat(s);
  if (newSpread >= 0) {
    return "+" + newSpread;
  } else {
    return "-" + newSpread;
  }
}



function getCurrDate() {
  var date = new Date();

  var year = date.getFullYear();
  var month = date.getMonth()+1;
  var day = date.getDate()+4;

  if (day < 10) {
    day = '0' + day;
  }
  if (month < 10) {
    month = '0' + month;
  }

  var formattedDate = year + "-" + month + "-" + day;

  return formattedDate;
}

function getTimeFromDate(d) {

  var localeSpecificTime = d.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute:'2-digit'});
  var formattedDate = localeSpecificTime.replace(/ +/g, "").toLowerCase();

  return formattedDate;
}

function abbToName(s) {
  var map = {
    ATL:	'Atlanta Hawks',
    BKN:	'Brooklyn Nets',
    BOS:	'Boston Celtics',
    CHA:	'Charlotte Hornets',
    CHI:	'Chicago Bulls',
    CLE:	'Cleveland Cavaliers',
    DAL:	'Dallas Mavericks',
    DEN:	'Denver Nuggets',
    DET:	'Detroit Pistons',
    GS:	'Golden State Warriors',
    HOU:	'Houston Rockets',
    IND:	'Indiana Pacers',
    LAC:	'Los Angeles Clippers',
    LAL:	'Los Angeles Lakers',
    MEM:	'Memphis Grizzlies',
    MIA:	'Miami Heat',
    MIL:	'Milwaukee Bucks',
    MIN:	'Minnesota Timberwolves',
    NO:	  'New Orleans Pelicans',
    NY:	'New York Knicks',
    OKC:	'Oklahoma City Thunder',
    ORL:	'Orlando Magic',
    PHI:	'Philadelphia 76ers',
    PHO:	'Phoenix Suns',
    POR:	'Portland Trail Blazers',
    SAC:	'Sacramento Kings',
    SA:	'San Antonio Spurs',
    TOR:	'Toronto Raptors',
    UTA:	'Utah Jazz',
    WAS:	'Washington Wizards'
  }

  return map[s];
}

function teamImage(s) {
  return abbToName(s).replace(/ /g, '-').toLowerCase();
}

function generateEmail(req, res) {

  var emailBody = `
  <!doctype html>
  <html>
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Email Title</title>
    <style>
    </style>
  </head>
  <body class="">
    <div style="text-align:center;">
    <form method="GET" action="https://script.google.com/macros/s/AKfycbz-nSyZ_IWqauMcO3QJrvQRJm_nFDDtfw6LWD8ADF06NLQ4glLW/exec" style="display:table; margin:0 auto;">
      <table style="border-collapse:collapse;">
        <tbody>
          <tr>
            <th></th>
            <th>Home</th>
            <th>Away</th>
            <th>Line</th>
          </tr>
  `;

  var emailBottom = `
            </tbody>
          </table>
          <button type="submit">Submit</button>
        </form>
        </div>
      </body>
    </html>
  `;

  scrapeSchedule(function (games) {
    for (var i = 0; i < games.length; i++) {
      var currGame = games[i];

      var team1 = currGame.team1;
      var team2 = currGame.team2;
      var gameTime = currGame.time;

      var team1Image = teamImage(team1);
      var team2Image = teamImage(team2);

      var spread1 = currGame.spread1;
      var spread2 = currGame.spread2;

      var spread = spread1;
      var favored = team1;

      if (parseFloat(spread1) > parseFloat(spread2)) {
        spread = spread2;
        favored = team2;
      }

      var gameId = 'game' + i;

      var gameHtml = `
        <tr style="border-bottom: 1pt solid black;">
          <td style="padding:20px;">
            ${gameTime} EST
          </td>
          <td style="padding:20px;">
            <label for=${team1}>
            <table style="text-align:center; border:1px solid black; border-radius:10px;">
              <tr><td><input type="radio" id=${team1} name=${gameId} value=${team1}></td></tr>
              <tr>
                <td>

                  <img src="http://loodibee.com/wp-content/uploads/nba-${team1Image}-logo-300x300.png" width="50px" height="50px"></img>

                </td>
              </tr>
              <tr><td><span>${team1}</span></td></tr>
            </table>
            </label>
          </td>
          <td style="padding:20px;">
            <label for=${team2}>
            <table style="text-align:center; border:1px solid black; border-radius:10px;">
              <tr><td><input type="radio" id=${team2} name=${gameId} value=${team2}></td></tr>
              <tr>
                <td>

                  <img src="http://loodibee.com/wp-content/uploads/nba-${team2Image}-logo-300x300.png" width="50px" height="50px"></img>

                </td>
              </tr>
              <tr><td><span>${team2}</span></td></tr>
            </table>
            </label>
          </td>
          <td style="padding:20px; text-align:center; border-left: 1px solid black;">
            ${favored}
            <br>
            ${spread}
          </td>
        </tr>
        \n
      `

      emailBody += gameHtml;

    }

    emailBody += emailBottom;
    return res.send({status: 'success', email: emailBody});
  });
}

// --------------------------------------------------------------
// --------------------------------------------------------------

// The exported functions, which can be accessed in index.js.
module.exports = {
  getAllPeople: getAllPeople,
  getFriends: getFriends,
  generateEmail: generateEmail
}
