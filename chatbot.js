const readline = require("readline");
const UniversityDataLoader = require("./universityDataLoader");
const path = require("path");

class UniversityChatbot {
  constructor(dataDir) {
    this.loader = new UniversityDataLoader(dataDir);
    this.universities = this.loader.loadData();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  start() {
    console.log("\n🎓 Welcome to the University Recommendation Chatbot!");
    console.log("==================================================");
    console.log("I can help you find the best university based on student reviews.");
    console.log("Available universities:", Object.keys(this.universities).join(", "));
    console.log("\nYou can ask things like:");
    console.log('  - "Compare UCLA and Yale"');
    console.log('  - "Tell me about Yale"');
    console.log('  - "Which university has the best academics?"');
    console.log('  - "Show universities with strong community"');
    console.log('  - "Exit" to quit\n');

    this.promptUser();
  }

  promptUser() {
    this.rl.question("You: ", (input) => {
      if (input.toLowerCase() === "exit") {
        console.log("\nThank you for using the University Chatbot! Goodbye!");
        this.rl.close();
        return;
      }

      const response = this.processQuery(input);
      console.log(`\n🤖 Chatbot: ${response}\n`);
      this.promptUser();
    });
  }

  processQuery(input) {
    const lower = input.toLowerCase();

    // Info about a single university
    if (lower.includes("about") || lower.includes("tell me")) {
      return this.getUniversityInfo(input);
    }

    // Compare universities
    if (lower.includes("compare")) {
      return this.compareUniversities(input);
    }

    // Best at something
    if (lower.includes("best") || lower.includes("strongest")) {
      return this.findBestByTopic(input);
    }

    // List all
    if (lower.includes("list") || lower.includes("all")) {
      return this.listAllUniversities();
    }

    // General input
    return this.findRelevantUniversities(input);
  }

  getUniversityInfo(input) {
    const uniName = this.extractUniversityName(input);

    if (!uniName) {
      return `I didn't catch a specific university. Available: ${Object.keys(this.universities).join(", ")}`;
    }

    const summary = this.loader.getUniversitySummary(uniName);
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

  compareUniversities(input) {
    const uniNames = this.extractMultipleUniversities(input);

    if (uniNames.length < 2) {
      return "Please specify at least 2 universities to compare.";
    }

    let response = "📈 **Comparison**\n\n";

    uniNames.forEach((name) => {
      const summary = this.loader.getUniversitySummary(name);
      if (summary) {
        response += `${name}: ⭐ ${summary.averageRating}/5 | `;
        response += `Positive: ${summary.sentiment.positive} | `;
        response += `Strengths: ${summary.strengths.map((s) => s.topic).join(", ")}\n`;
      }
    });

    return response;
  }

  findBestByTopic(input) {
    const topics = [
      "academics",
      "campus_life",
      "community",
      "facilities",
      "financial",
    ];
    const foundTopic = topics.find((t) => input.toLowerCase().includes(t.replace(/_/g, " ")));

    if (!foundTopic) {
      return "I can evaluate universities by: academics, campus life, community, facilities, or financial aid.";
    }

    const ranked = Object.values(this.universities)
      .map((uni) => ({
        name: uni.name,
        mentions: uni.stats.topicFrequency[foundTopic] || 0,
        rating: uni.stats.averageRating,
      }))
      .sort((a, b) => b.mentions - a.mentions || b.rating - a.rating)
      .slice(0, 3);

    let response = `🏆 **Best for ${foundTopic.replace(/_/g, " ")}**\n\n`;
    ranked.forEach((uni, idx) => {
      response += `${idx + 1}. ${uni.name} - ⭐ ${uni.rating.toFixed(2)}/5 (${uni.mentions} mentions)\n`;
    });

    return response;
  }

  findRelevantUniversities(input) {
    const keywords = input.toLowerCase().split(" ");
    const scores = {};

    Object.values(this.universities).forEach((uni) => {
      let score = 0;
      uni.reviews.forEach((review) => {
        keywords.forEach((keyword) => {
          if (review.rawText.toLowerCase().includes(keyword)) {
            score += review.rating;
          }
        });
      });
      if (score > 0) {
        scores[uni.name] = score / Math.max(1, keywords.length);
      }
    });

    if (Object.keys(scores).length === 0) {
      return "I didn't find universities matching that description. Try asking about a specific university!";
    }

    const ranked = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    let response = `📚 **Universities matching "${input}"**\n\n`;
    ranked.forEach(([name, score], idx) => {
      const uni = this.universities[name];
      response += `${idx + 1}. ${name} - Score: ${(score * 100).toFixed(0)} | ⭐ ${uni.stats.averageRating.toFixed(2)}\n`;
    });

    return response;
  }

  listAllUniversities() {
    let response = "📚 **All Universities** (ranked by average rating)\n\n";
    const ranked = Object.values(this.universities).sort(
      (a, b) => b.stats.averageRating - a.stats.averageRating
    );

    ranked.forEach((uni, idx) => {
      response += `${idx + 1}. ${uni.name} - ⭐ ${uni.stats.averageRating.toFixed(2)}/5 (${uni.stats.totalReviews} reviews)\n`;
    });

    return response;
  }

  extractUniversityName(input) {
    const lower = input.toLowerCase();
    for (const name of Object.keys(this.universities)) {
      if (lower.includes(name.toLowerCase())) {
        return name;
      }
    }
    return null;
  }

  extractMultipleUniversities(input) {
    const names = [];
    const lower = input.toLowerCase();
    for (const name of Object.keys(this.universities)) {
      if (lower.includes(name.toLowerCase())) {
        names.push(name);
      }
    }
    return names;
  }
}

// Main entry point
const dataDir = path.join(__dirname, "university data");
const chatbot = new UniversityChatbot(dataDir);
chatbot.start();
