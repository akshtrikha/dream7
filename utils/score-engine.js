export const scoreRules = {
  batting: {
    run: 1,
    boundaryBonus: 1,
    sixBonus: 2,
    thirtyRunBonus: 4,
    halfCenturyBonus: 8,
    centuryBonus: 16,
    dismissalForDuck: -2,
  },
  bowling: {
    wicket: 25,
    bonus: 8, // LBW/Bowled
    threeWicketBonus: 4,
    fourWicketBonus: 8,
    fiveWicketBonus: 16,
    maidenOver: 12,
  },
  fieldingPoints: {
    catch: 8,
    threeCatchBonus: 4,
    stumping: 12,
    runOutDirectHit: 12,
    runOutNotADirectHit: 6,
  },
  others: {
    //! Count as factor
    captain: 2,
    viceCaptain: 1.5,
    inAnnouncedLineups: 4,
    playingSubstitute: 4, //! Concussion, COVID-19, X-Factor, or Impact Player
  },
  economyRatePoints: {
    below5: 6, // below 5
    below6: 4, // between 5 and 5.99
    below7: 2, // between 7 and 7
    above10: -2, // between 10 and 11
    above11: -4, // between 11.01 and 12
    above12: -6, // above 12
  },
  strikeRate: {
    //! Min. 10 balls played. Per 100 balls
    above170: 6, // above 170
    above150: 4, // between 150.01 nd 170
    above130: 2, // between 130-150
    below70: -2, // between 60-70
    below60: -4, // between 50-50.99
    below50: -6, // below 50
  },
};

export const batsmenPointsCard = function (batsmenData) {
  let pointsCard = [];
  for (const batsmanKey in batsmenData) {
    const batsman = batsmenData[batsmanKey];
    const name = batsman.batName;
    const id = batsman.batId;
    const runs = batsman.runs;
    const fours = batsman.fours;
    const sixes = batsman.sixes;
    const ballsFaced = batsman.balls;
    const strikeRate = batsman.strikeRate;

    let points =
      runs +
      fours * scoreRules.batting.boundaryBonus +
      sixes * scoreRules.batting.sixBonus;

    if (runs >= 100) points += scoreRules.batting.centuryBonus;
    else if (runs >= 50) points += scoreRules.batting.halfCenturyBonus;
    else if (runs >= 30) points += scoreRules.batting.thirtyRunBonus;
    else if (runs === 0) points -= scoreRules.batting.dismissalForDuck;

    if (ballsFaced >= 10) {
      if (strikeRate >= 170) points += scoreRules.strikeRate.above170;
      else if (strikeRate >= 150) points += scoreRules.strikeRate.above150;
      else if (strikeRate >= 130) points += scoreRules.strikeRate.above130;
      else if (strikeRate <= 50) points += scoreRules.strikeRate.below50;
      else if (strikeRate <= 60) points += scoreRules.strikeRate.below60;
      else if (strikeRate <= 70) points += scoreRules.strikeRate.below70;
    }
    // console.log(points)

    pointsCard.push({ id, name, points });
  }

  // console.log(pointsCard)
  return pointsCard;
};

export const bowlersPointsCard = function (bowlerData) {
  let pointsCard = [];
  for (const bowlerKey in bowlerData) {
    const bowler = bowlerData[bowlerKey];
    const name = bowler.bowlName;
    const id = bowler.bowlerId;
    const wickets = bowler.wickets;
    const maidens = bowler.maidens;
    const economy = bowler.economy;

    let points = wickets * scoreRules.bowling.wicket;
    if (wickets >= 5) points += scoreRules.bowling.fiveWicketBonus;
    else if (wickets >= 4) points += scoreRules.bowling.fourWicketBonus;
    else if (wickets >= 3) points += scoreRules.bowling.threeWicketBonus;

    points += maidens * scoreRules.bowling.maidenOver;

    if (economy >= 12) points += scoreRules.economyRatePoints.above12;
    else if (economy >= 11) points += scoreRules.economyRatePoints.above11;
    else if (economy >= 10) points += scoreRules.economyRatePoints.above10;
    else if (economy < 5) points += scoreRules.economyRatePoints.below5;
    else if (economy < 6) points += scoreRules.economyRatePoints.below6;
    else if (economy < 7) points += scoreRules.economyRatePoints.below7;

    pointsCard.push({ id: id, name, points: points });
  }

  // console.log(pointsCard)
  return pointsCard;
};
