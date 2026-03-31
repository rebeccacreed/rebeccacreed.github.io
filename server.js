const express = require("express");
const cors = require("cors");
const path = require("path");
const UniversityDataLoader = require("./universityDataLoader");

const app = express();
app.use(cors());
app.use(express.json());

// Initialize the chatbot data
const dataDir = path.join(__dirname, "university data");
const loader = new UniversityDataLoader(dataDir);
const universities = loader.loadData();

// Create a simple chatbot response function (extracted from your chatbot class)
function processQuery(input) {
  const lower = input.toLowerCase();

  // Info about a single university
  if (lower.includes("about") || lower.includes("tell me")) {
    return getUniversityInfo(input);
  }

  // Compare universities
  if (lower.includes("compare")) {
    return compareUniversities(input);
  }

  // Best at something
  if (lower.includes("best") || lower.includes("strongest")) {
    return findBestByTopic(input);
  }

  // List all
  if (lower.includes("list") || lower.includes("all")) {
    return listAllUniversities();
  }

  // General input
  return findRelevantUniversities(input);
}

function extractUniversityName(input) {
  const lower = input.toLowerCase();
  for (const name of Object.keys(universities)) {
    if (lower.includes(name.toLowerCase())) {
      return name;
    }
  }
  return null;
}

function extractMultipleUniversities(input) {
  const names = [];
  const lower = input.toLowerCase();
  for (const name of Object.keys(universities)) {
    if (lower.includes(name.toLowerCase())) {
      names.push(name);
    }
  }
  return names;
}

function getUniversityInfo(input) {
  const uniName = extractUniversityName(input);

  if (!uniName) {
    return `I didn't catch a specific university. Available: ${Object.keys(universities).join(", ")}`;
  }

  const summary = loader.getUniversitySummary(uniName);
  if (!summary) {
    return `Sorry, I don't have data for ${uniName}.`;
  }

  let response = `📊 **${summary.name}**\n`;
  response += `Average Rating: ⭐ ${summary.averageRating}/5 (${summary.totalReviews} reviews)\n`;
  response += `Sentiment: ${summary.sentiment.positive} positive, ${summary.sentiment.neutral} neutral, ${summary.sentiment.negative} negative\n\n`;
  response += `Top Strengths:\n`;
  summary.strengths.forEach((s) => {
    response += `  • ${s.topic} (mentioned ${s.mentioned} times)\n`;
  });
  response += `\nHighlight:\n`;
  summary.reviewHighlights.forEach((h) => {
    response += `  "${h}..."\n`;
  });

  return response;
}

function compareUniversities(input) {
  const uniNames = extractMultipleUniversities(input);

  if (uniNames.length < 2) {
    return "Please specify at least 2 universities to compare.";
  }

  let response = "📈 **Comparison**\n\n";

  uniNames.forEach((name) => {
    const summary = loader.getUniversitySummary(name);
    if (summary) {
      response += `${name}: ⭐ ${summary.averageRating}/5 | `;
      response += `Positive: ${summary.sentiment.positive} | `;
      response += `Strengths: ${summary.strengths.map((s) => s.topic).join(", ")}\n`;
    }
  });

  return response;
}

function findBestByTopic(input) {
  const topics = [
    "academics",
    "campus_life",
    "community",
    "facilities",
    "financial",](#)

