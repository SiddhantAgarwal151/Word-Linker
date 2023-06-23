const fs = require("fs");
const readline = require("readline");
const { promisify } = require("util");
const { rankWordSimilarity } = require("./ParseWords");

const ACCURACY = 10000;

async function determineLowestScore(submittedValues) {
  let lowestScore = Infinity;
  let winner = null;

  for (const player in submittedValues) {
    const values = submittedValues[player];
    const score = values.reduce((sum, value) => sum + value, 0);
    if (score < lowestScore) {
      lowestScore = score;
      winner = player;
    }
  }

  return winner;
}

async function gameStart(numPlayers, difficultyLevel, numRounds) {
  const wordList = [];
  const fileStream = fs.createReadStream("test.csv");
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const words = line.trim().split(" ");
    wordList.push(...words);
  }

  let round = 1;
  while (round <= numRounds) {
    console.log(`\n--- Round ${round} ---`);

    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    const ranking = await rankWordSimilarity(randomWord, wordList);

    console.log("Random Word:", randomWord);
    console.log("Ranking:", ranking);

    const submittedValues = await storeInputs(numPlayers);
    console.log("Submitted Values:", submittedValues);

    const winner = await determineLowestScore(submittedValues);
    console.log("Winner:", winner);

    round++;
  }
}

async function storeInputs(numPlayers) {
  const playerValues = {};

  for (let player = 0; player < numPlayers; player++) {
    const playerName = `player${player}`;
    const playerValue = await new Promise((resolve) => {
      const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      readlineInterface.question(`Player ${player + 1}, enter your value: `, (value) => {
        readlineInterface.close();
        resolve(value);
      });
    });

    if (playerName in playerValues) {
      playerValues[playerName].push(playerValue);
    } else {
      playerValues[playerName] = [playerValue];
    }
  }

  return playerValues;
}

async function main() {
  const numPlayers = 2; // Set the number of players
  const difficultyLevel = 1; // Set the difficulty level
  const numRounds = 5; // Set the number of rounds

  try {
    await gameStart(numPlayers, difficultyLevel, numRounds);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
