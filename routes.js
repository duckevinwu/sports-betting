// Code below for testing in production

// read .env file config
require('dotenv').config();

var config = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
}

const axios = require("axios");
const cheerio = require("cheerio");
var mysql = require('mysql');
var randToken = require('rand-token');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

var emails = [];

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

        gameObj.id = 'game' + i;

        var gameDate = $('.event-card-header [data-role="localtime"]', game).data('value');
        var gameDateObject = new Date(gameDate);

        gameObj.utc = gameDate;
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

      if (games.length > 0) {
        saveGames(games);
      }

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

// save the games into the database
function saveGames(gamesArr) {

  var date = getCurrDate();
  var league = 'nba';
  var games = JSON.stringify(gamesArr);

  var checkQuery = `
    SELECT *
    FROM Games
    WHERE date = ? AND league = ?
  `;
  connection.query(checkQuery, [date, league], function(err, rows, fields) {
    if (err) console.log(err);
    else {
      if (!rows.length) {
        var insertQuery = `
          INSERT INTO Games (date, league, games)
          VALUES (?, ?, ?)
        `;
        connection.query(insertQuery, [date, league, games], function(err, rows, fields) {
          if (err) console.log(err);
          else {
            console.log('success');
          }
        });
      }
    }
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
  var day = date.getDate();

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

  if (formattedDate[0] === '0') {
    formattedDate = formattedDate.substring(1);
  }

  return formattedDate;
}

function abbToName(s) {
  // var map = {
  //   ATL:	'Atlanta Hawks',
  //   BKN:	'Brooklyn Nets',
  //   BOS:	'Boston Celtics',
  //   CHA:	'Charlotte Hornets',
  //   CHI:	'Chicago Bulls',
  //   CLE:	'Cleveland Cavaliers',
  //   DAL:	'Dallas Mavericks',
  //   DEN:	'Denver Nuggets',
  //   DET:	'Detroit Pistons',
  //   GS:	'Golden State Warriors',
  //   HOU:	'Houston Rockets',
  //   IND:	'Indiana Pacers',
  //   LAC:	'Los Angeles Clippers',
  //   LAL:	'Los Angeles Lakers',
  //   MEM:	'Memphis Grizzlies',
  //   MIA:	'Miami Heat',
  //   MIL:	'Milwaukee Bucks',
  //   MIN:	'Minnesota Timberwolves',
  //   NO:	  'New Orleans Pelicans',
  //   NY:	'New York Knicks',
  //   OKC:	'Oklahoma City Thunder',
  //   ORL:	'Orlando Magic',
  //   PHI:	'Philadelphia 76ers',
  //   PHO:	'Phoenix Suns',
  //   POR:	'Portland Trail Blazers',
  //   SAC:	'Sacramento Kings',
  //   SA:	'San Antonio Spurs',
  //   TOR:	'Toronto Raptors',
  //   UTA:	'Utah Jazz',
  //   WAS:	'Washington Wizards'
  // }
  var map = {
    GS:	  'GSW',
    NO:	  'NOP',
    NY:	  'NYK',
    PHO:  'PHX',
    SA:	  'SAS'
  }

  if (map[s]) {
    return map[s];
  }

  return s;
}

function teamImage(s) {
  // return abbToName(s).replace(/ /g, '-').toLowerCase();
  return abbToName(s);
}

function generateGames(callback) {

  var emailBody = "";
  var gamesTop = `
    <table style="border-collapse:collapse; margin-bottom:30px;">
      <tbody>
        <tr>
          <th></th>
          <th style="color:#347FC4;">Home</th>
          <th style="color:#d4af37;">Away</th>
          <th style="color:white;">Spread</th>
        </tr>
  `;

  var gamesBot = `
    </tbody>
  </table>
  <button class="submitButton" type="submit" style="margin-bottom:30px; background-color:transparent; border: 2px solid #34a6df; padding:15px 32px; border-radius:10px; color:white; font-size:14px;">Submit</button>
  `;

  scrapeSchedule(function (games) {

    if (games.length === 0) {
      emailBody += '<p style="color:white;">No games today</p>'
    } else {
      for (var i = 0; i < games.length; i++) {
        var currGame = games[i];

        var team1 = abbToName(currGame.team1);
        var team2 = abbToName(currGame.team2);
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
          <tr style="border-bottom: 1pt solid gray;">
            <td style="padding:20px; color:silver">
              ${gameTime} EST
            </td>
            <td style="padding:20px;">
              <label for="${team1}">
              <table class="teamTag-home" style="text-align:center; border-radius:10px; background-color:rgba(52,127,196,0.5);">
                <tr><td><input type="radio" id="${team1}" name="${gameId}" value="${team1}"></td></tr>
                <tr>
                  <td>

                    <img src="https://www.nba.com/assets/logos/teams/secondary/web/${team1Image}.png" width="50px" height="40px"></img>

                  </td>
                </tr>
                <tr><td><span style="color:white;">${team1}</span></td></tr>
              </table>
              </label>
            </td>
            <td style="padding:20px;">
              <label for="${team2}">
              <table class="teamTag-away" style="text-align:center; border-radius:10px; background-color:rgba(212,175,55,0.5);">
                <tr><td><input type="radio" id="${team2}" name="${gameId}" value="${team2}"></td></tr>
                <tr>
                  <td>

                    <img src="https://www.nba.com/assets/logos/teams/secondary/web/${team2Image}.png" width="50px" height="40px"></img>

                  </td>
                </tr>
                <tr><td><span style="color:white;">${team2}</span></td></tr>
              </table>
              </label>
            </td>
            <td style="padding:20px; text-align:center; border-left: 1px solid gray;">
              <span style="color:white;">${favored}</span>
              <br>
              <span style="color:white;">${spread}</span>
            </td>
          </tr>
          \n
        `

        emailBody += gameHtml;
      }
      emailBody = gamesTop + emailBody + gamesBot;
    }
    callback(emailBody);
  });
}

function generateEmail(req, res) {
  var yesterday = getDateYesterday();
  var rankDate = (new Date(yesterday)).getTime();

  generateGames(function(emailBody) {
    var playersQuery = `
      SELECT p.player_id, p.email, p.token, r.score, r.rank, r.payout, r.f2p
      FROM Player p LEFT JOIN (SELECT * FROM Rank WHERE date = ?) r ON p.player_id = r.player;
    `;

    connection.query(playersQuery, [rankDate], function(err, rows, fields) {
      if (err) {
        console.log(err);
        return res.send({status: 'fail', message: 'retrieve all players error'});
      } else {
        for (var i = 0; i < rows.length; i++) {
          var currPlayer = rows[i];

          var emailTop = `
          <!doctype html>
            <html lang="en">
            <head>
              <meta name="viewport" content="width=device-width" />
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
              <title>Email Title</title>
              <style>
                .teamTag-home:hover {
                  transition:0.2s;
                  cursor:pointer;
                  background-color:rgba(52,127,196,0.8) !important;
                }
                .teamTag-away:hover {
                  transition:0.2s;
                  cursor:pointer;
                  background-color:rgba(212,175,55,0.8) !important;
                }
                .submitButton:hover {
                  background-color:#34a6df !important;
                  transition:0.2s;
                  cursor:pointer;
                }
              </style>
            </head>
            <body class="">
              <div style="text-align:center;">
              <form method="GET" action="https://script.google.com/macros/s/AKfycbz-nSyZ_IWqauMcO3QJrvQRJm_nFDDtfw6LWD8ADF06NLQ4glLW/exec" style="display:table; margin:0 auto; background-color:#121212; border-radius:10px;">
                <input type="hidden" name="email" value="${currPlayer.email}"/>
                <input type="hidden" name="token" value="${currPlayer.token}"/>
                <input type="hidden" name="id" value="${currPlayer.player_id}"/>
                <div style="display:table; margin: 0 auto;">
                  <table style="margin-top:20px;">
                    <tbody>
                      <tr>
                        <td><img src="https://i.ibb.co/TgG3h46/logo-1.png" width="150px" height="150px"></img></td>
                        <td>
                          <img src="https://i.ibb.co/nRsWXhS/text.png" width="150px"></img>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <hr style="border-color:white;"/>
              `;

              var yesterdaySection = `
                  <p style="font-size:20px; color:lightblue; letter-spacing:1px;">YESTERDAY</p>
                  <table style="margin:0 auto; margin-bottom:50px;">
                    <tr>
                      <td style="color:white;">Rank</td>
                      <td style="width:20px;"></td>
                      <td style="color:white;">Payout*</td>
                    </tr>
                    <tr>
                      <td style="border:1px solid white; width:100px; height:75px; border-radius:20px;">
                        <div><span style="font-size:30px; color:#34a6df">${currPlayer.rank}</span><span style="color:white;">/${rows.length}</span></div>
                      </td>
                      <td></td>
                      <td style="border:1px solid white; width:100px; height:75px; border-radius:20px;">
                        <div><span style="font-size:20px; color:#34a6df">+ $${(currPlayer.payout + currPlayer.f2p).toFixed(2)}</span></div>
                      </td>
                    </tr>
                  </table>
                  <p style="color:white;">*To redeem your payout, signup for <a href="/" style="color:gold;">Bluejay Pro</a>!</p>
                  <hr style="border-color:white;"/>
          `;

          if (currPlayer.score) {
            emailTop += yesterdaySection;
          }

          var emailTop2 = `
            </div>
            <p style="font-size:20px; color:lightblue; letter-spacing:1px;">TODAY</p>
          `;

          emailTop += emailTop2;

          var emailBottom = `
              </form>
              <p style="color:gray">Trouble viewing this email? Click <a href="/">here</a> to bet online!</p>
              <p style="color:gray"><a href="/">Unsubscribe</a> from Bluejay</p>
              </div>
            </body>
          </html>
          `;

          var finalEmail = emailTop + emailBody + emailBottom;

          var emailObject = {
            to: currPlayer.email,
            from: 'kevinwu97@gmail.com',
            subject: 'Daily Summary',
            text: 'text',
            html: finalEmail
          }

          emails.push(emailObject);

        }
        return res.send({message: 'emails successfully created', email: emails[0].html});
      }
    })


  })
}


// ----------------------------------------------------------
// -------------------- SEND EMAIL ----------------------
// ----------------------------------------------------------

function sendEmail(req, res) {
  sgMail.send(emails).then(() => {
    console.log('emails sent successfully!');
    return res.send({status: 'success'})
  }).catch(error => {
    console.log(error);
    return res.send({status: 'fail', message: error});
  });
}

// -----------------------------------------------------------

// signup
function emailSignup(req, res) {
  var email = req.body.email;
  var nickname = req.body.nickname;

  // check if user with that email exists
  var existsQuery = `
    SELECT *
    FROM Player
    WHERE email = ?;
  `;
  connection.query(existsQuery, [email],  function(err, rows, fields) {
    if (err) {
      console.log(err);
      return;
    }
    if (rows.length) {
      // user already exists
      return res.send({status: 'fail', message: 'user already exists'});
    } else {
      var token = randToken.generate(16);

      var query = `
        INSERT INTO Player (email, token, nickname)
        VALUES (?, ?, ?);
      `;
      connection.query(query, [email, token, nickname], function(err, rows, fields) {
        if (err) console.log(err);
        else {
          return res.send({status: 'success'})
        }
      });
    }
  });
}

// submit bet
function submitBet(req, res) {
  var params = req.body.params;
  var email = params.email;
  var pId = params.id;
  var date = getCurrDate();
  var league = 'nba';

  var prevSlip = {};

  // check to see if player has bet already
  var prevQuery = `
    SELECT slip
    FROM Bet
    WHERE player = ?
  `;
  connection.query(prevQuery, [pId], function(err, rows, fields) {
    if (err) console.log(err);
    else {
      if (rows.length) {
        prevSlip = JSON.parse(rows[0].slip);
      }

      // get today's games
      var gamesQuery = `
        SELECT games
        FROM Games
        WHERE date = ? AND league = ?
      `;

      connection.query(gamesQuery, [date, league], function(err1, rows1, fields1) {
        if (err1) console.log(err1);
        else {
          if (!rows1.length) {
            return res.send({message: 'no games today'})
          } else {

            // today's games
            var games = JSON.parse(rows1[0].games);

            games.forEach(function(game) {
              if ((new Date()) > (new Date(game.utc))) {
                return true;
              } else {
                var gameId = game.id;

                if (params[gameId]) {
                  prevSlip[gameId] = params[gameId];
                }
              }

            });

            prevSlip = JSON.stringify(prevSlip);

            // insert/update the bet in table
            var insertQuery = `
              INSERT INTO Bet (player, date, slip)
              VALUES (?, ?, ?)
              ON DUPLICATE KEY UPDATE date = VALUES(date), slip = VALUES(slip)
            `;

            connection.query(insertQuery, [pId, date, prevSlip], function(err2, rows2, fields2) {
              if (err2) {
                console.log(err2);
                return res.send({status: 'fail', message: 'failed inserting new bet'});
              } else {
                return res.send({status: 'success'})
              }
            })


          }
        }
      })

    }
  });
}

// ----------------------------------------------------------
// ---------------- UPDATE LEADERBOARD ----------------------
// ----------------------------------------------------------

function getDateYesterday() {
  var date = new Date();
  date.setDate(date.getDate() - 1);

  var year = date.getFullYear();
  var month = date.getMonth()+1;
  var day = date.getDate();

  if (day < 10) {
    day = '0' + day;
  }
  if (month < 10) {
    month = '0' + month;
  }

  var formattedDate = year + "-" + month + "-" + day;

  return formattedDate;
}



function scrapeResults(callback) {

  var yesterday = getDateYesterday();

  axios.get('https://www.scoresandodds.com/nba?date=' + yesterday)
    .then(function (response) {
      // handle success
      var pageData = response.data
      // console.log(response.data)
      const $ = cheerio.load(pageData)

      var games = [];

      $('.event-card-table').each((i, game) => {

        var gameObj = {};

        gameObj.id = 'game' + i;

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

        var result = $('[data-side="away"] .event-card-score', game);
        var team1Win = $(result).hasClass('win');

        if (team1Win) {
          gameObj.winner = team1;
        } else {
          gameObj.winner = team2;
        }

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

// calculate the score for each person based on bets yesterday
function calculateRank(req, res) {

  var yesterday = getDateYesterday();
  var scores = [];

  scrapeResults(function (results) {

    var playersQuery = `
      SELECT *
      FROM Player p LEFT JOIN (SELECT * FROM Bet WHERE date = ?) b ON p.player_id = b.player
    `;

    connection.query(playersQuery, [yesterday], function(err, rows, fields) {
      if (err) {
        return res.send({status: 'fail', message: err})
      } else {
        var playerList = rows;

        playerList.forEach(function(player) {
          var pScore = {
            id: player.player_id,
            score: 0.0,
            payout: 0.0
          };

          if (!(player.slip)) {
            // didn't submit bets yesterday
            scores.push(pScore);
            return true;
          }

          var pSlip = JSON.parse(player.slip);
          var total = 0.0;

          results.forEach(function(game) {
            var pSelection = pSlip[game.id];
            if (pSelection) {
              if (pSelection === game.winner) {
                var spread = parseFloat(game.spread1);
                if (game.winner !== game.team1) {
                  spread = parseFloat(game.spread2);
                }

                // calculate total
                if (spread <= 0) {
                  // favorite
                  spread = Math.abs(spread);
                  var favScore = Math.max((6.0 - (0.1 * spread) - (0.1 * Math.pow(spread, 2))), 0.1);
                  total += favScore;
                } else {
                  spread = Math.abs(spread);
                  total += (6.0 + (0.1 * Math.pow(spread, 2)));
                }

              }
            }
          })

          pScore.score = total;

          var baseline = 3.0 * results.length;

          pScore.payout = Math.max(0.0, (total - baseline) / baseline);
          scores.push(pScore);

        });

        // after all scores are calculated, sort them
        scores.sort(function(a, b){return b.score - a.score});

        // iterate through scores array and generate query
        var rankDate = (new Date(yesterday)).getTime();
        var values = [];

        for (var i = 0; i < scores.length; i++) {
          var currScore = scores[i];
          var currVal = [];

          currVal[0] = currScore.id;
          currVal[1] = rankDate;
          currVal[2] = currScore.score;
          currVal[3] = i + 1;
          currVal[4] = currScore.payout

          if (i === 0) {
            currVal[5] = 1.0;
          } else {
            currVal[5] = 0.0;
          }

          values.push(currVal);
        }

        var insertQuery = "INSERT INTO `Rank` (player, date, score, rank, payout, f2p) VALUES ?";

        // run the query on the db
        connection.query(insertQuery, [values], function(err1, rows1, fields1) {
          if (err1) {
            console.log(err1);
            return res.send({status: 'fail', message: 'insertion failed'});
          } else {
            return res.send({status: 'success'});
          }
        })

      }
    })

  })
}


//unsubscribe
function unsubscribe(req, res) {
  var email = req.body.email;
  var token = req.body.token;

  var deleteQuery = `
    DELETE FROM Player
    WHERE email = ? AND token = ?
  `

  connection.query(deleteQuery, [email, token], function(err, rows, fields) {
    if (err) {
      console.log(err);
      return res.send({status: 'fail', message: 'delete failed'})
    } else {
      return res.send({status: 'success'});
    }
  })
}


// check if email and token are valid
function validateUser(req, res) {
  var email = req.params.email;
  var token = req.params.token;

  var checkQuery = `
    SELECT *
    FROM Player
    WHERE email = ? AND token = ?
  `

  connection.query(checkQuery, [email, token], function(err, rows, fields) {
    if (err) {
      console.log(err);
      return res.send({status: 'fail', message: 'query failed'})
    } else {
      if (!rows.length) {
        return res.send({status: 'fail', message: 'invalid combination'})
      } else {
        res.send({status: 'success'})
      }
    }
  })
}

// get game data from database
function getGames(req, res) {
  var currDate = getCurrDate();
  var league = 'nba';

  var gamesQuery = `
    SELECT *
    FROM Games
    WHERE date = ? AND league = ?
  `

  connection.query(gamesQuery, [currDate, league], function(err, rows, fields) {
    if (err) {
      return res.send({status: 'fail', message: 'error retrieving games'})
    } else {
      if (rows.length) {
        return res.send({status: 'success', games: JSON.parse(rows[0].games)});
      } else {
        return res.send({status: 'fail', message: 'no games'})
      }

    }
  })
}

// get user data from yesterday
function getRankYesterday(req, res) {
  var yesterday = getDateYesterday();
  var rankDate = (new Date(yesterday)).getTime();

  var playerId = req.params.id;

  var query = `
    SELECT *
    FROM Rank
    WHERE player = ? AND date = ?
  `;

  connection.query(query, [playerId, rankDate], function(err, rows, fields) {
    if (err) {
      console.log(err);
      return res.send({status: 'fail', message: 'error retrieving player info'})
    } else {
      if (rows.length) {

        var totalQuery = `
          SELECT COUNT(*) AS total
          FROM Rank
          WHERE date = ?
        `;

        connection.query(totalQuery, [rankDate], function(err1, rows1, fields1) {
          if (err1) {
            console.log(err1);
            return res.send({status: 'fail', message: 'error retrieving total'})
          } else {
            if (rows.length) {
              return res.send({status: 'success', player: rows[0], total: rows1[0].total})
            } else {
              return res.send({status: 'fail', message: 'no rows'})
            }
          }
        })

      } else {
        return res.send({status: 'fail', message: 'did not bet yesterday'})
      }
    }
  })
}



// The exported functions, which can be accessed in index.js.
module.exports = {
  getAllPeople: getAllPeople,
  getFriends: getFriends,
  generateEmail: generateEmail,
  emailSignup: emailSignup,
  submitBet: submitBet,
  calculateRank: calculateRank,
  validateUser: validateUser,
  unsubscribe: unsubscribe,
  getGames: getGames,
  sendEmail: sendEmail,
  getRankYesterday: getRankYesterday
}
