# Cyber Incident Insights and Feed Generator
**Live Preview:** [Click here to explore Cyber News](https://cyber-news-tau.vercel.app/)  
## Overview

The **Cyber Incident Insights and Feed Generator** is a framework and website designed to collect and analyze real-time information related to cyber threats and incidents in the Indian cyberspace. It aims to enhance the protection of **Critical Information Infrastructure (CIIs)** by generating valuable insights for stakeholders to mitigate risks and address cyber threats proactively.

---

## 🛠 Features

- **Automated Platform Discovery** — ML model to detect relevant cyber threat-sharing platforms.
- **Web Crawling & Scraping** — Modular pipeline to extract incident reports from multiple sources.
- **Data Classification** — Categorizes incidents into types such as:
  - Breaking News
  - Threat Intelligence
  - Data Breaches
  - Policy & Compliance
  - Security Research
  - Industry News
- **Entity Extraction** — Identifies key entities (Sectors, APT groups, Threat Types, etc.).
- **Insights Dashboard** — Interactive visualization of incidents by category, timeline, and severity.
- **No Paid APIs** — Designed using only free and open-source tools.

---

## Project Objectives

1. **Platform Discovery (ML-powered)**  
   - Use Machine Learning to identify platforms that publish or act as intermediaries for sharing cyber incident activities relevant to Indian cyberspace.

2. **Cyber Incident Feed Generator**  
   - Design a scalable crawling/scraping framework to collect incident data from identified platforms, including:
     - Cybersecurity news sites
     - Paste sites
     - Forums
     - Social media platforms
     - Developer communities
     - Any other relevant public sources

3. **Structured Incident Database**  
   - Store extracted cyber incident data in a well-defined schema to facilitate efficient querying and analysis.

4. **Insights & Visualization**  
   - Generate actionable insights from the collected data, such as:
     - Incident distribution by sector
     - Advanced Persistent Threat (APT) activity
     - Strategic issue trends
   - Provide visual dashboards for better situational awareness.

---

## Screenshots

### Feed Generator
![Home Page]()

### Cyber Incident Insights
![Cyber Incident Insights](https://github.com/Gourish112/CYBER-NEWS/blob/78778a413938934d22ba80e32917c9ca79199be3/insights.png)

![Cyber Incident Insights](https://github.com/Gourish112/CYBER-NEWS/blob/78778a413938934d22ba80e32917c9ca79199be3/issues.png)


---

## Technologies Used

- **Programming Language:** Python
- **Web Crawling/Scraping:** BeautifulSoup, Scrapy, Requests, Selenium 
- **Machine Learning/NLP:** Scikit-learn, spaCy, Transformers
- **Database:** MongoDB (NoSQL for flexibility) 
- **Backend:** Flask/FastAPI (for API access to data and automation)
- **Frontend:** React.js and Vite(for the dashboard)

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Gourish112/CYBER-NEWS.git

2. Install the dependencies(for model):
   ```bash
   pip install -r requirements.txt
   
3. Configure settings:
   Update config.json with database credentials, crawling frequency and ML model paths

4. Run Frontend:
   ```bash
   cd project
   npm install
   npm run dev

5. Run backend:
   ```bash
   cd project
   npm install
   npm run server

## How It Works

1. **Data Collection**:
   - The system crawls forums, social media, and other platforms to identify cyber incidents.

2. **Data Storage**:
   - Scraped data is structured and stored in a relational database.

3. **Insights Generation**:
   - Machine learning models analyze and classify incidents into categories (e.g., phishing, malware, etc.).

4. **Visualization**:
   - Data is displayed in an intuitive dashboard for stakeholders to easily assess sector-specific vulnerabilities and threats.

---

## Future Enhancements
- Integration with real-time streaming APIs (Twitter, Mastodon) for threat signals.

- Advanced NLP for automated incident summarization.

- Multi-language support for regional cyber incident detection.

- Predictive analytics for emerging threats.
  
## Contributions

Contributions are welcome! Here’s how you can contribute:

- Report bugs or issues in the [Issues](https://github.com/Gourish112/CYBER-NEWS/issues) section.
- Submit a pull request for new features or improvements.

---

## Acknowledgements

- This project follows the guidelines provided by **NCIIPC** to enhance cybersecurity in India's critical sectors.
- Special thanks to the open-source community for the tools and frameworks used in this project.

## Contact
Email: gourishbhatia2004@gmail.com
