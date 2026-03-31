const fs = require("fs");
const path = require("path");

// Topic keywords for analysis
const TOPIC_KEYWORDS = {
  academics: [
    "academics",
    "classes",
    "professors",
    "teaching",
    "courses",
    "rigorous",
    "challenging",
    "intellectual",
    "research",
    "learning",
  ],
  campus_life: [
    "campus",
    "residential college",
    "dorm",
    "housing",
    "activities",
    "clubs",
    "extracurricular",
  ],
  community: [
    "community",
    "people",
    "students",
    "friendly",
    "welcoming",
    "diversity",
    "inclusive",
    "supportive",
  ],
  facilities: [
    "facilities",
    "gym",
    "library",
    "resources",
    "infrastructure",
    "food",
    "dining",
  ],
  location: ["city", "new haven", "location", "safe", "area", "environment"],
  financial: [
    "financial aid",
    "scholarship",
    "funding",
    "tuition",
    "afford",
    "cost",
    "expensive",
    "low-income",
  ],
  mental_health: [
    "stress",
    "mental health",
    "wellness",
    "support",
    "counseling",
    "pressure",
  ],
  negative: ["problem", "issue", "concern", "difficult", "lacking", "insufficient"],
};

class UniversityDataLoader {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.universities = {};
  }

  extractRating(text) {
    const match = text.match(/Rating (\d) out of 5/);
    return match ? parseInt(match[1]) : null;
  }

  extractTopics(reviewText) {
    const topics = {};
    const lowerText = reviewText.toLowerCase();

    for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
      const mentionedKeywords = keywords.filter((keyword) =>
        lowerText.includes(keyword)
      );
      if (mentionedKeywords.length > 0) {
        topics[topic] = mentionedKeywords;
      }
    }

    return topics;
  }

  getSentiment(rating) {
    if (rating >= 4) return "positive";
    if (rating === 3) return "neutral";
    return "negative";
  }

  loadData() {
    const files = fs.readdirSync(this.dataDir).filter((f) => f.endsWith(".csv"));

    files.forEach((file) => {
      const filePath = path.join(this.dataDir, file);
      const universityName = file.replace("niche_", "").replace(".csv", "");

      const content = fs.readFileSync(filePath, "utf8");
      const lines = content.split("\n");

      const reviews = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(",");
        if (parts.length < 3) continue;

        const ratingStr = parts[0];
        const reviewText = parts[2];

        if (!ratingStr || !reviewText) continue;

        const rating = this.extractRating(ratingStr);
        if (rating === null) continue;

        const topics = this.extractTopics(reviewText);
        const sentiment = this.getSentiment(rating);

        reviews.push({
          rating,
          sentiment,
          topics,
          text: reviewText.substring(0, 200), // Store first 200 chars
          rawText: reviewText,
        });
      }

      if (reviews.length > 0) {
        this.universities[universityName] = {
          name: universityName,
          reviews,
          stats: this.calculateStats(reviews),
        };
      }
    });

    return this.universities;
  }

  calculateStats(reviews) {
    const stats = {
      totalReviews: reviews.length,
      averageRating:
        reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length,
      sentimentBreakdown: {
        positive: reviews.filter((r) => r.sentiment === "positive").length,
        neutral: reviews.filter((r) => r.sentiment === "neutral").length,
        negative: reviews.filter((r) => r.sentiment === "negative").length,
      },
      topicFrequency: this.getTopicFrequency(reviews),
    };
    return stats;
  }

  getTopicFrequency(reviews) {
    const frequency = {};
    reviews.forEach((review) => {
      Object.keys(review.topics).forEach((topic) => {
        frequency[topic] = (frequency[topic] || 0) + 1;
      });
    });
    return frequency;
  }

  getUniversitySummary(universityName) {
    if (!this.universities[universityName]) return null;

    const uni = this.universities[universityName];
    return {
      name: uni.name,
      averageRating: uni.stats.averageRating.toFixed(2),
      totalReviews: uni.stats.totalReviews,
      sentiment: uni.stats.sentimentBreakdown,
      strengths: this.getTopStrengths(universityName),
      reviewHighlights: this.getReviewHighlights(universityName),
    };
  }

  getTopStrengths(universityName) {
    const uni = this.universities[universityName];
    const topicFreq = uni.stats.topicFrequency;

    return Object.entries(topicFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([topic, freq]) => ({
        topic: topic.replace(/_/g, " "),
        mentioned: freq,
      }));
  }

  getReviewHighlights(universityName) {
    const uni = this.universities[universityName];
    const fiveStarReviews = uni.reviews.filter((r) => r.rating === 5).slice(0, 2);
    return fiveStarReviews.map((r) => r.text);
  }
}

module.exports = UniversityDataLoader;
