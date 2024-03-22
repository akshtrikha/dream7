import express from "express";
import axios from "axios";
import fs from "fs";

import { batsmenPointsCard, bowlersPointsCard } from "./utils/score-engine.js";

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.post("/submit-teams", (req, res) => {
  console.log("POST /submit-teams");
  const payload = req.body;

  try {
    const json = JSON.stringify(payload);
    fs.writeFileSync("match_data/usersData.json", json);
    return res.status(200).json({ message: "ok" });
  } catch (err) {
    console.log(err);
    return res.status(500).send({ message: err });
  }
});

app.get("/players", async (req, res) => {
  const matchId = req.query.matchId;
  console.log("GET /players");
  console.log("matchId: " + matchId);

  const options = {
    method: "GET",
    url: `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}`,
    headers: {
      "X-RapidAPI-Key": process.env.XRapidAPIKey,
      "X-RapidAPI-Host": process.env.XRapidAPIHost,
    },
  };

  try {
    const response = await axios.request(options);

    const team1Players = response.data.matchInfo.team1.playerDetails;
    const team2Players = response.data.matchInfo.team2.playerDetails;

    let players = { batsmen: [], bowlers: [], allRounders: [] };
    team1Players.forEach((player) => {
      if (player.role.toLowerCase().includes("allrounder")) {
        players.allRounders.push({ id: player.id, name: player.name });
      } else if (player.role.toLowerCase().includes("batsman")) {
        players.batsmen.push({ id: player.id, name: player.name });
      } else if (player.role.toLowerCase().includes("bowler")) {
        players.bowlers.push({ id: player.id, name: player.name });
      }
    });

    team2Players.forEach((player) => {
      if (player.role.toLowerCase().includes("allrounder")) {
        players.allRounders.push({ id: player.id, name: player.name });
      } else if (player.role.toLowerCase().includes("batsman")) {
        players.batsmen.push({ id: player.id, name: player.name });
      } else if (player.role.toLowerCase().includes("bowler")) {
        players.bowlers.push({ id: player.id, name: player.name });
      }
    });

    fs.writeFileSync("match_data/players.json", JSON.stringify(players));

    return res.status(200).json(players);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
});

app.get("/match/:id", async (req, res) => {
  const matchId = req.params.id;
  console.log(`/GET match/${matchId}`);

  const options = {
    method: "GET",
    url: `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}`,
    headers: {
      "X-RapidAPI-Key": process.env.XRapidAPIKey,
      "X-RapidAPI-Host": process.env.XRapidAPIHost,
    },
  };

  try {
    const response = await axios.request(options);
    // console.log(response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error });
  }
});

app.get("/result", async (req, res) => {
  console.log("/GET result");

  const matchId = req.query.matchId;
  console.log(matchId);
  const options = {
    method: "GET",
    url: `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/hscard`,
    headers: {
      "X-RapidAPI-Key": process.env.XRapidAPIKey,
      "X-RapidAPI-Host": process.env.XRapidAPIHost,
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);

    const matchData = {
      teamData1: response.data.scoreCard[0],
      teamData2: response.data.scoreCard[1],
    };

    fs.writeFileSync("match_data/allMatchData.json", JSON.stringify(matchData));
    // console.log(matchData)

    const batsmenPoints = batsmenPointsCard(
      matchData.teamData1.batTeamDetails.batsmenData
    );
    const bowlersPoints = bowlersPointsCard(
      matchData.teamData1.bowlTeamDetails.bowlersData
    );

    // const writeabledata = JSON.stringify
    fs.writeFileSync(
      "match_data/playersPoints.json",
      JSON.stringify({ batsmenPoints, bowlersPoints })
    );

    let usersData = fs.readFileSync("match_data/usersData.json");
    usersData = JSON.parse(usersData);
    let finalScore = [];

    for (const user in usersData) {
      let points = 0;
      const team = usersData[user];
      for (let i = 0; i < team.length; i++) {
        let player = team[i];

        for (let j = 0; j < batsmenPoints.length; j++) {
          let playerPointsObj = batsmenPoints[j];
          if (playerPointsObj.id === player) {
            points += playerPointsObj.points;
          }
        }

        for (let j = 0; j < bowlersPoints.length; j++) {
          let playerPointsObj = bowlersPoints[j];
          if (playerPointsObj.id === player) {
            points += playerPointsObj.points;
          }
        }
      }

      finalScore.push({ user, points });
    }

    res.status(200).json(finalScore);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});