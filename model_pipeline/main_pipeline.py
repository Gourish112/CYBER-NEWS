import os
import json
import re
import requests
import joblib
import spacy
from flask import Flask, jsonify
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from urllib.parse import urlparse
from sentence_transformers import SentenceTransformer
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from collections import defaultdict
from dateutil import parser as date_parser
# Load environment variables
load_dotenv()
API_KEY = os.getenv("API_KEY")
SEARCH_ENGINE_ID = os.getenv("CSE_ID")

# Load models
classifier = joblib.load("cyber_platform_classifier.pkl")
encoder = joblib.load("cyber_sbert_encoder.pkl")
nlp = spacy.load("en_core_web_sm")

app = Flask(__name__)
# Google Programmable Search API
SEARCH_QUERIES = [
    "latest cyber incidents",
    "CVE exploit blog",
    "APT threat report site",
    "cybersecurity advisories",
]
def normalize_date(text):
    try:
        return date_parser.parse(text).strftime("%Y-%m-%d %H:%M")
    except Exception:
        return ""
def search_google(query):
    url = f"https://www.googleapis.com/customsearch/v1?q={query}&key={API_KEY}&cx={SEARCH_ENGINE_ID}"
    res = requests.get(url)
    if res.status_code != 200:
        print("Google API error:", res.text)
        return []
    return res.json().get("items", [])

def classify_platforms(results):
    platforms = {}
    for item in results:
        title = item.get("title")
        link = item.get("link")
        if not title or not link:
            continue
        domain = urlparse(link).netloc.replace("www.", "")
        vec = encoder.encode([title])
        pred = classifier.predict(vec)[0]
        if pred == 1:
            platforms[domain] = {"scrape": True, "type": "auto"}
    return platforms

def save_platform_config(config):
    with open("platform_config.json", "w") as f:
        json.dump(config, f, indent=2)

# Article scrapers
def scrape_hackernews():
    url = "https://thehackernews.com/"
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "html.parser")
    articles = []
    for card in soup.find_all("div", class_="body-post"):
        title = card.find("h2", class_="home-title").text.strip()
        snippet = card.find("div", class_="home-desc").text.strip()
        link = card.find("a")["href"]
        date_tag = card.find("span", class_="h-datetime")
        date = normalize_date(date_tag.text.strip()) if date_tag else ""
        articles.append({
            "source": "The Hacker News",
            "title": title,
            "snippet": snippet,
            "url": link,
            "date": date
        })
    return articles

def scrape_certin():
    options = Options()
    options.add_argument("--headless=new")
    driver = webdriver.Chrome(options=options)
    driver.get("https://www.cert-in.org.in/")
    articles = []
    try:
        cards = driver.find_elements(By.CLASS_NAME, "cy-card__title")
        for card in cards[:10]:
            title = card.text.strip()
            link = card.find_element(By.TAG_NAME, "a").get_attribute("href")
            articles.append({
                "source": "CERT-In",
                "title": title,
                "snippet": "CERT-In advisory",
                "url": link,
                "date": ""
            })
    finally:
        driver.quit()
    return articles

def scrape_malwarebazaar():
    url = "https://bazaar.abuse.ch/browse/"
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "html.parser")
    rows = soup.find_all("tr")[1:11]
    articles = []
    for row in rows:
        cells = row.find_all("td")
        if len(cells) < 2:
            continue
        title = cells[1].text.strip()
        articles.append({
            "source": "MalwareBazaar",
            "title": title,
            "snippet": "IOC sample",
            "url": url,
            "date": ""
        })
    return articles

def scrape_bleepingcomputer():
    url = "https://www.bleepingcomputer.com/news/security/"
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "html.parser")
    articles = []
    for item in soup.select("div.bc_latest_news li"):
        link = item.find("a")
        if link:
            title = link.text.strip()
            href = link["href"]
            articles.append({
                "source": "BleepingComputer",
                "title": title,
                "snippet": "",
                "url": href,
                "date": ""
            })
    return articles

def scrape_talos():
    url = "https://blog.talosintelligence.com/"
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "html.parser")
    articles = []
    for post in soup.select(".post-title.entry-title a"):
        title = post.text.strip()
        link = post["href"]
        articles.append({
            "source": "Cisco Talos",
            "title": title,
            "snippet": "",
            "url": link,
            "date": ""
        })
    return articles

def scrape_krebs():
    url = "https://krebsonsecurity.com/"
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "html.parser")
    articles = []
    for post in soup.select("h2.entry-title a"):
        title = post.text.strip()
        link = post["href"]
        articles.append({
            "source": "Krebs on Security",
            "title": title,
            "snippet": "",
            "url": link,
            "date": ""
        })
    return articles
def scrape_all_articles(platform_config):
    articles = []
    for domain, meta in platform_config.items():
        if not meta.get("scrape"): continue
        t = meta.get("type")
        if "hackernews" in domain or t == "hackernews":
            articles.extend(scrape_hackernews())
        elif "cert-in" in domain or t == "cert":
            articles.extend(scrape_certin())
        elif "abuse.ch" in domain or t == "malwarebazaar":
            articles.extend(scrape_malwarebazaar())
        elif "bleepingcomputer" in domain or t == "bleeping":
            articles.extend(scrape_bleepingcomputer())
        elif "talosintelligence" in domain or t == "talos":
            articles.extend(scrape_talos())
        elif "krebsonsecurity" in domain or t == "krebs":
            articles.extend(scrape_krebs())
    return articles

# Entity extraction and categorization
sectors = ["finance", "healthcare", "government", "education", "energy", "defense", "military", "telecom", "transport", "manufacturing", "retail"]

def extract_entities(text):
    doc = nlp(text)
    return {
        "CVE": re.findall(r"CVE-\d{4}-\d{4,7}", text, re.I),
        "APT": re.findall(r"APT[ -]?\d{1,3}", text, re.I),
        "Sector": [s for s in sectors if s in text.lower()],
        "ORG": list(set([ent.text for ent in doc.ents if ent.label_ == "ORG"])),
        "GPE": list(set([ent.text for ent in doc.ents if ent.label_ == "GPE"]))
    }
def calculate_threat_level(text, entities):
    text = text.lower()

    # Entity-based logic
    if entities.get("CVE"):
        if len(entities["CVE"]) > 1 or "10.0" in text or "critical" in text:
            return "critical"
        return "high"
    if entities.get("APT"):
        return "high"

    # Keyword-based heuristics
    critical_indicators = [
        "zero-day", "critical vulnerability", "nation-state", "supply chain attack",
        "critical infrastructure", "emergency patch", "actively exploited", "root access"
    ]
    high_indicators = [
        "ransomware", "data breach", "apt", "targeted attack", "exploit",
        "sophisticated malware", "espionage", "privilege escalation"
    ]
    medium_indicators = [
        "trojan", "worm", "spyware", "credential theft", "man-in-the-middle"
    ]
    low_indicators = [
        "patch", "update", "advisory", "awareness", "minor issue", "best practice"
    ]

    for word in critical_indicators:
        if word in text:
            return "critical"
    for word in high_indicators:
        if word in text:
            return "high"
    for word in medium_indicators:
        if word in text:
            return "medium"
    for word in low_indicators:
        if word in text:
            return "low"

    return "medium"  # default fallback


def categorize_article(text):
    text = text.lower()
    if any(k in text for k in ["alert", "breaking", "urgent", "warning"]):
        return "Breaking News"
    elif any(k in text for k in ["apt", "malware", "threat", "ttp", "ioc"]):
        return "Threat Intelligence"
    elif any(k in text for k in ["breach", "leak", "data exposure", "exfiltration"]):
        return "Data Breaches"
    elif any(k in text for k in ["compliance", "gdpr", "hipaa", "nist", "regulation"]):
        return "Policy & Compliance"
    elif any(k in text for k in ["vulnerability", "exploit", "poc", "cve", "disclosure"]):
        return "Security Research"
    elif any(k in text for k in ["company", "market", "acquisition", "announcement", "partner"]):
        return "Industry News"
    return "Uncategorized"
import re
from collections import Counter
import spacy

nlp = spacy.load("en_core_web_sm")

def extract_tags(text):
    text = text.lower()

    # Define a list of cybersecurity keywords to look for
    keyword_tags = [
        "ransomware", "phishing", "malware", "apt", "cve", "exploit", "zero-day",
        "ddos", "vulnerability", "data breach", "threat actor", "patch", "leak",
        "exfiltration", "supply chain", "breach", "trojan", "botnet", "payload"
    ]

    found_keywords = [kw for kw in keyword_tags if kw in text]

    # Use SpaCy to extract named entities (ORG, PRODUCT, etc.)
    doc = nlp(text)
    named_entities = set(ent.text.lower() for ent in doc.ents if ent.label_ in ['ORG', 'PRODUCT', 'GPE'])

    # Merge keywords + entities, remove duplicates, filter out short/stop words
    combined_tags = set(found_keywords + list(named_entities))
    clean_tags = [tag.strip() for tag in combined_tags if len(tag) > 2 and not re.match(r'^\d+$', tag)]

    return list(clean_tags[:5])  # Return top 5 tags for brevity

def enrich_articles(articles):
    enriched_articles = []
    for article in articles:
        full_text = article["title"] + " " + article.get("summary", article.get("snippet", ""))
        entities = extract_entities(full_text)
        enriched = {
            "title": article["title"],
            "summary": article.get("summary", article.get("snippet", "")),
            "link": article.get("link", article.get("url", "")),
            "source": article.get("source", "Unknown"),
            "date": article.get("date", ""),  
            "entities": extract_entities(full_text),
            "category": categorize_article(full_text),
            "threatLevel": calculate_threat_level(full_text, entities),  # ✅ Important!
            "tags": extract_tags(full_text)
        }
        enriched_articles.append(enriched)
    return enriched_articles
def generate_insights(enriched_articles):
    from collections import Counter, defaultdict

    # Define expected values to always include in the output
    expected_threats = ["Ransomware", "Data Breaches", "Phishing", "Malware", "APT", "Vulnerability"]
    expected_sectors = ["Healthcare", "Finance", "Government", "Retail", "Technology", "Energy"]
    expected_strategic = ["Data Breaches", "Ransomware", "Phishing", "Supply Chain", "Zero-Day"]
    expected_apts = ["APT29", "APT41", "Lazarus Group", "APT28", "Carbanak"]
    expected_severities = ["critical", "high", "medium", "low", "unknown"]

    # Keyword mappings
    threat_keywords = {
        "ransomware": "Ransomware",
        "breach": "Data Breaches",
        "phishing": "Phishing",
        "malware": "Malware",
        "apt": "APT",
        "vulnerability": "Vulnerability",
    }
    strategic_keywords = ["supply chain", "zero-day", "phishing", "ransomware", "data breach"]

    # Initialize counters
    total_articles = len(enriched_articles)
    threat_types = defaultdict(int)
    sectors_count = defaultdict(int)
    strategic_issues = defaultdict(int)
    apt_groups = defaultdict(int)
    severity_distribution = Counter()
    trending_tags = Counter()

    for article in enriched_articles:
        text = (article.get("title", "") + " " + article.get("summary", "")).lower()

        # Count threat types from text
        for keyword, label in threat_keywords.items():
            if keyword in text:
                threat_types[label] += 1

        # Count sectors from NER
        for sector in article.get("entities", {}).get("Sector", []):
            sectors_count[sector.title()] += 1

        # Count strategic issues
        for keyword in strategic_keywords:
            if keyword in text:
                strategic_issues[keyword.title()] += 1

        # Count APTs
        for apt in article.get("entities", {}).get("APT", []):
            apt_normalized = apt.upper().replace(" ", "")
            apt_groups[apt_normalized] += 1

        # Count severity levels (default to 'unknown')
        level = article.get("threatLevel", "unknown").lower()
        severity_distribution[level] += 1

        # Count tags
        for tag in article.get("tags", []):
            trending_tags[tag.lower()] += 1

    # Fill missing expected keys with 0
    for t in expected_threats:
        threat_types.setdefault(t, 0)
    for s in expected_sectors:
        sectors_count.setdefault(s, 0)
    for s in expected_strategic:
        strategic_issues.setdefault(s, 0)
    for a in expected_apts:
        apt_groups.setdefault(a, 0)
    for sev in expected_severities:
        severity_distribution.setdefault(sev, 0)

    # Final dictionary
    return {
        "total_articles": total_articles,
        "threat_types": dict(threat_types),
        "incidents_by_sector": dict(sectors_count),
        "strategic_issues": dict(strategic_issues),
        "apts_involved": dict(apt_groups),
        "severity_distribution": dict(severity_distribution),
        "trending_tags": [{"tag": k, "count": v} for k, v in trending_tags.most_common(10)]
    }

@app.route("/run", methods=["GET"])
def run_pipeline():
    # Step 1: Google programmable search
    all_results = []
    for query in SEARCH_QUERIES:
        results = search_google(query)
        all_results.extend(results)

    # Step 2: ML-based classification
    platform_config = classify_platforms(all_results)

    # Step 3: Add known legit platforms manually
    KNOWN_CYBER_PLATFORMS = {
        "thehackernews.com": "hackernews",
        "cert-in.org.in": "cert",
        "bazaar.abuse.ch": "malwarebazaar",
        "bleepingcomputer.com": "bleeping",
        "blog.talosintelligence.com": "talos",
        "krebsonsecurity.com": "krebs"
    }

    for domain, ptype in KNOWN_CYBER_PLATFORMS.items():
        platform_config[domain] = {"scrape": True, "type": ptype, "source": "known"}

    # Step 4: Save platform config (for inspection/debugging)
    save_platform_config(platform_config)

    # Step 5: Scrape from all platforms marked `scrape: True`
    raw_articles = scrape_all_articles(platform_config)

    # Step 6: Save raw scraped articles
    with open("public\all_articles.json", "w", encoding="utf-8") as f:
        json.dump(raw_articles, f, indent=2)

    # Step 7: Enrich articles with category + entities
    enriched = enrich_articles(raw_articles)

    # Step 8: Save enriched article set
    with open("public\cyware_news.json", "w", encoding="utf-8") as f:
        json.dump(enriched, f, indent=2)

    insights = generate_insights(enriched)

    with open("public\cyber_news_insights.json", "w", encoding="utf-8") as f:
        json.dump(insights, f, indent=2)

    return {
        "status": "✅ Completed",
        "platforms": len(platform_config),
        "articles_scraped": len(raw_articles),
        "articles_enriched": len(enriched),
        "insights_generated": True
    }

if __name__ == "__main__":
    result = run_pipeline()
    print(json.dumps(result))
    
