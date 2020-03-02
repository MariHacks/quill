var _ = require('underscore');
var async = require('async');
var User = require('../models/User');

// In memory stats.
var stats = {};
function calculateStats(){
  console.log('Calculating stats...');
  var newStats = {
    lastUpdated: 0,

    total: 0,
    demo: {
      gender: {
        M: 0,
        F: 0,
        O: 0,
        N: 0
      },
      year: {
        '2016': 0,
        '2017': 0,
        '2018': 0,
        '2019': 0,
      }
    },

    teams: {},
    verified: 0,
    submitted: 0,
    admitted: 0,
    confirmed: 0,
    declined: 0,

    confirmedFemale: 0,
    confirmedMale: 0,
    confirmedOther: 0,
    confirmedNone: 0,

    shirtSizes: {
      'XS': 0,
      'S': 0,
      'M': 0,
      'L': 0,
      'XL': 0,
      'XXL': 0,
      'None': 0
    },

    dietaryRestrictions: {},

    schools: {},
    schoolsCheckedIn: {},

    checkedIn: 0,
    checkedInM: 0,
    checkedInF: 0,
    checkedInO: 0,
    checkedInN: 0,
  };

  User
    .find({})
    .exec(function(err, users){
      if (err || !users){
        throw err;
      }

      newStats.total = users.length;

      async.each(users, function(user, callback){

        // Add to the gender
        newStats.demo.gender[user.profile.gender] += 1;

        // Count verified
        newStats.verified += user.verified ? 1 : 0;

        // Count submitted
        newStats.submitted += user.status.completedProfile ? 1 : 0;

        // Count accepted
        newStats.admitted += user.status.admitted ? 1 : 0;

        // Count confirmed
        newStats.confirmed += user.status.confirmed ? 1 : 0;

        newStats.confirmedFemale += user.status.confirmed && user.profile.gender == "F" ? 1 : 0;
        newStats.confirmedMale += user.status.confirmed && user.profile.gender == "M" ? 1 : 0;
        newStats.confirmedOther += user.status.confirmed && user.profile.gender == "O" ? 1 : 0;
        newStats.confirmedNone += user.status.confirmed && user.profile.gender == "N" ? 1 : 0;

        // Count declined
        newStats.declined += user.status.declined ? 1 : 0;

        // Count graduation years
        if (user.profile.graduationYear){
          newStats.demo.year[user.profile.graduationYear] += 1;
        }

        // Grab the team name if there is one
        // if (user.teamCode && user.teamCode.length > 0){
        //   if (!newStats.teams[user.teamCode]){
        //     newStats.teams[user.teamCode] = [];
        //   }
        //   newStats.teams[user.teamCode].push(user.profile.name);
        // }

        // Count shirt sizes
        if (user.confirmation.shirtSize in newStats.shirtSizes){
          newStats.shirtSizes[user.confirmation.shirtSize] += 1;
        }

        // Dietary restrictions
        if (user.confirmation.dietaryRestrictions){
          user.confirmation.dietaryRestrictions.forEach(function(restriction){
            if (!newStats.dietaryRestrictions[restriction]){
              newStats.dietaryRestrictions[restriction] = 0;
            }
            newStats.dietaryRestrictions[restriction] += 1;
          });
        }

        newStats.schools[user.profile.school] =
          !!newStats.schools[user.profile.school] + 1;

        // Count checked in
        if (user.status.checkedIn) {
          newStats.checkedIn += 1;

          switch (user.profile.gender) {
            case "M": newStats.checkedInM += 1; break;
            case "F": newStats.checkedInF += 1; break;
            case "N": newStats.checkedInN += 1; break;
            case "O": newStats.checkedInO += 1; break;
          }

          if (!(user.profile.school in newStats.schoolsCheckedIn))
            newStats.schoolsCheckedIn[user.profile.school] = 0;

          newStats.schoolsCheckedIn[user.profile.school] += 1;
        }

        callback(); // let async know we've finished
      }, function() {
        // Transform dietary restrictions into a series of objects
        var restrictions = [];
        _.keys(newStats.dietaryRestrictions)
          .forEach(function(key){
            restrictions.push({
              name: key,
              count: newStats.dietaryRestrictions[key],
            });
          });
        newStats.dietaryRestrictions = restrictions;

        // Likewise, transform the teams into an array of objects
        // var teams = [];
        // _.keys(newStats.teams)
        //   .forEach(function(key){
        //     teams.push({
        //       name: key,
        //       users: newStats.teams[key]
        //     });
        //   });
        // newStats.teams = teams;

        console.log('Stats updated!');
        newStats.lastUpdated = new Date();
        stats = newStats;
      });
    });

}

// Calculate once every five minutes.
calculateStats();
setInterval(calculateStats, 300000);

var Stats = {};

Stats.getUserStats = function(){
  return stats;
};

module.exports = Stats;
