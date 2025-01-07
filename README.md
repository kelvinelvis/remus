# Remus: The Unlearning AI Agent

Remus is a dynamic AI-powered bot designed to post updates, interact with trends, and engage with users on Twitter every hour. What makes this bot unique is its **machine unlearning** capability, allowing it to gradually unlearn its personality and relearn a new one over time, enabling dynamic evolution and adaptability.

## Requirements

To run this project, you'll need:

- Node.js 16+
- A Twitter Developer account with API keys.
- Libraries listed in `package.json`.
- Basic understanding of JavaScript and APIs.

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/remus.git
cd remus
```

### 2. Install Dependencies

Use `npm` to install the required libraries:

```bash
npm install
```

### 3. Set Up Twitter API Keys

Create a `.env` file in the project directory and add your Twitter API credentials:
With fields found in `.env` file.

```bash
# Port to run server on
PORT=

#supabase database credentials
SUPABASE_URL=
SUPABASE_KEY=

# Twitter oauth2 client credentials
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=

# Twitter app and oauth1 crednetials
TWITTER_APP_KEY=
TWITTER_APP_SECRET=
TWITTER_ACCESS_TOKEN=
TWITTER_ACCESS_SECRET=

# agent account username
TWITTER_USERNAME=

# runwayml api key
RUNWAYML_API_SECRET=

# post interval in minutes
POST_INTERVAL=1

# openai api key
OPENAI_API_KEY=

# server host link
HOST=
```

### 4. Configure Agent Personality

Edit the `utils/constants.ts` file to define Remus's initial personality traits and posting behavior. Remus will unlearn and relearn its personality dynamically over time.

### 5. Run the Agent

Start Remus by running:

```bash
npm start
```

Remus will begin posting based on the schedule and configuration.

## Customization

You can modify the following components:

- **Content Generation**: Edit `contentGenerator.js` to customize how Remus generates posts.
- **Machine Unlearning Logic**: Adjust the unlearning and relearning mechanisms in `personalityUpdater.js`.
- **Scheduling**: Adjust the posting frequency in `index.ts`.

## Contribution Guidelines

We welcome contributions! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push the branch.
4. Open a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Enhance machine unlearning algorithms for more nuanced personality shifts.
- [ ] Add support for multimedia posts (images, videos).
- [ ] Implement sentiment analysis for trend engagement.
- [ ] Support for multiple languages.

## Support

If you encounter any issues, please open an [issue](https://github.com/elviskelvin/remus/issues) or reach out via Twitter: [@YourTwitterHandle](https://twitter.com/remusisreal).

---

### Disclaimer

Remus is designed for educational and entertainment purposes. Use responsibly and ensure compliance with Twitter's policies and guidelines.
