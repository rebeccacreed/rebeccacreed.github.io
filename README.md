Welcome to my site! It is a work-in-progress. See below relevant information about the tools on my site.

University Recommendation Chatbot

An interactive Node.js chatbot that analyzes student reviews from your university data and provides personalized recommendations.

## Features

✨ **Smart Analysis**
- Parses CSV files containing student reviews
- Extracts sentiment and topics from reviews
- Ranks universities by rating, strengths, and relevance

💬 **Interactive Queries**
- Ask about specific universities
- Compare universities side-by-side
- Find universities best for particular topics
- Discover universities matching your interests

## Project Structure

```
├── universityDataLoader.js   # Loads and analyzes CSV data
├── chatbot.js                # Interactive chatbot interface
├── README.md                 # This file
└── university data/          # Your CSV files with reviews
    ├── niche_yaleuni.csv
    ├── niche_ucla.csv
    └── ... (other universities)
```

## Installation

No additional dependencies needed! Uses Node.js built-in modules.

```bash
# Navigate to the project directory
cd C:\Users\rcree\.vscode\learning

# Run the chatbot
node chatbot.js
```

## Usage Examples

Once the chatbot starts, try these commands:

### Get Info About a University
```
You: Tell me about Yale
You: About UCLA?
```

### Compare Universities
```
You: Compare Yale and UCLA
You: How does UCLA compare to Vanderbilt?
```

### Find Best by Topic
```
You: Which university has the best academics?
You: Show me universities with strong community
You: Strongest financial aid?
```

### List All Universities
```
You: List all universities
You: Show me all
```

### General Search
```
You: I want a school with good professors
You: Looking for diverse campus
You: Strong research opportunities?
```

### Exit
```
You: Exit
```

## How It Works

### Data Parsing
The `UniversityDataLoader` reads CSV files and extracts:
- **Rating**: 1-5 star ratings from reviews
- **Topics**: Academics, campus life, community, facilities, location, financial aid, mental health
- **Sentiment**: Positive (4-5 stars), Neutral (3 stars), Negative (1-2 stars)

### Scoring
Universities are ranked based on:
1. Average rating across all reviews
2. Frequency of positive mentions of specific topics
3. Relevance to user queries

### Topics Analyzed
- **Academics** - Classes, professors, teaching quality
- **Campus Life** - Residential experience, clubs, events
- **Community** - Friendliness, diversity, inclusivity
- **Facilities** - Gym, library, dining, infrastructure
- **Location** - City environment, safety
- **Financial Aid** - Scholarships, affordability
- **Mental Health** - Stress support, wellness resources

## Customization

### Add More Universities
Simply add CSV files to the `university data/` folder following the same format as existing files.

### Modify Topics
Edit the `TOPIC_KEYWORDS` object in `universityDataLoader.js` to add or change topics.

### Adjust Sentiment Thresholds
Modify the `getSentiment()` method to change how ratings map to sentiment.

## Example Output

```
🤖 Chatbot: 📊 **yale**
Average Rating: ⭐ 4.56/5 (45 reviews)
Sentiment: 38 positive, 5 neutral, 2 negative

Top Strengths:
  • academics (mentioned 42 times)
  • community (mentioned 38 times)
  • campus life (mentioned 35 times)

Highlight:
  "Yale is incredible overall!..."
```

## Troubleshooting

### "Cannot find module" error
Make sure you're running the chatbot from the correct directory:
```bash
cd C:\Users\rcree\.vscode\learning
node chatbot.js
```

### No universities found
Ensure CSV files are in the `university data/` subfolder and follow the format of the existing files.

### Limited results
The chatbot's accuracy improves with more reviews. Consider adding more university CSV files.

## Future Enhancements

🚀 Potential improvements:
- Add natural language processing (NLP) for better understanding
- Implement machine learning for better ranking
- Add filters by major, location, cost range
- Export recommendations to file
- Web-based interface
- Real-time data updates from Niche API

## License

Project for learning purposes. Use freely!
