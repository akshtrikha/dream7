import express from "express";
import axios from "axios";

import { batsmenPointsCard, bowlerPointsCard } from "./utils/score-engine.js";

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.get("/players", async (req, res) => {
  const matchId = req.query.matchId;
  console.log("GET /players")
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

    return res.status(200).json(players)

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
      "X-RapidAPI-Key": "a77584eb69msh69fb7d597d14f23p16e353jsn16a8a0f9a186",
      "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
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
      "X-RapidAPI-Key": "a77584eb69msh69fb7d597d14f23p16e353jsn16a8a0f9a186",
      "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    // console.log(response.data);

    const matchData = {
      teamData1: response.data.scoreCard[0],
      teamData2: response.data.scoreCard[1],
    };

    const batsmenPoints = batsmenPointsCard(
      matchData.teamData1.batTeamDetails.batsmenData
    );
    const bowlerPoints = bowlerPointsCard(
      matchData.teamData1.bowlTeamDetails.bowlersData
    );

    res.status(200).json(matchData);
  } catch (error) {
    console.error(error);
    return res.status(500).send(error);
  }
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
