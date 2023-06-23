const tf = require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');

const ACCURACY = 10000;

async function rankWordSimilarity(targetWord, wordList) {
  const similarityScores = {};

  const model = await use.load();

  const targetEmbedding = await model.embed(targetWord);
  const targetVector = await targetEmbedding.array();

  for (let offset = 0; offset < wordList.length; offset++) {
    const word = wordList[offset];
    const embedding = await model.embed(word);

    const vector = await embedding.array();

    const similarity = cosineSimilarity(targetVector, vector);
    similarityScores[word] = Math.floor(similarity * ACCURACY + offset);
  }

  const sortedScores = Object.entries(similarityScores).sort((a, b) => a[1] - b[1]);
  const sortedSimilarityScores = Object.fromEntries(sortedScores);

  return sortedSimilarityScores;
}

function cosineSimilarity(vec1, vec2) {
  const dotProduct = tf.matMul(vec1, vec2, false, true);
  const norm1 = tf.norm(vec1);
  const norm2 = tf.norm(vec2);
  const similarity = dotProduct.div(norm1.mul(norm2));
  return similarity.dataSync()[0];
}

module.exports = {
  rankWordSimilarity, // Export the rankWordSimilarity function
};

async function main() {
  const targetWord = 'cat';
  const wordList = ['dog', 'cat', 'rabbit', 'mouse'];

  try {
    const similarityScores = await rankWordSimilarity(targetWord, wordList);
    console.log(similarityScores);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
