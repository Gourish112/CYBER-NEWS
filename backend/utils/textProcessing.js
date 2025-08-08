import natural from 'natural';
import Sentiment from 'sentiment';
import compromise from 'compromise';
import keyword from 'keyword-extractor';

const sentiment = new Sentiment();

export function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/\u2219/g, '') // Remove bullet points
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .trim();
}

export function extractTags(text) {
  if (!text) return [];
  
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Enhanced cybersecurity-specific keywords
  const cybersecurityTerms = [
    'malware', 'ransomware', 'phishing', 'apt', 'vulnerability', 'exploit',
    'breach', 'hack', 'cyber', 'security', 'threat', 'attack', 'ddos',
    'botnet', 'trojan', 'virus', 'worm', 'spyware', 'adware', 'rootkit',
    'zero-day', 'patch', 'firewall', 'antivirus', 'encryption', 'ssl',
    'tls', 'vpn', 'authentication', 'authorization', 'compliance',
    'gdpr', 'hipaa', 'pci', 'iso27001', 'nist', 'mitre', 'cve',
    'incident', 'response', 'forensics', 'siem', 'soc', 'threat-hunting',
    'iot', 'scada', 'industrial', 'critical-infrastructure', 'supply-chain',
    'social-engineering', 'insider-threat', 'data-loss', 'privacy',
    'cryptocurrency', 'blockchain', 'ai', 'machine-learning', 'deepfake'
  ];
  
  const tags = tokens.filter(token => 
    cybersecurityTerms.includes(token) && token.length > 2
  );
  
  return [...new Set(tags)]; // Remove duplicates
}

export function extractKeywords(text) {
  if (!text) return [];
  
  try {
    // Use keyword-extractor for better keyword extraction
    const extractionResult = keyword.extract(text, {
      language: 'english',
      remove_digits: true,
      return_changed_case: true,
      remove_duplicates: true
    });
    
    // Filter for cybersecurity relevance
    const cybersecurityKeywords = extractionResult.filter(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      return lowerKeyword.length > 3 && (
        lowerKeyword.includes('cyber') ||
        lowerKeyword.includes('security') ||
        lowerKeyword.includes('threat') ||
        lowerKeyword.includes('attack') ||
        lowerKeyword.includes('breach') ||
        lowerKeyword.includes('malware') ||
        lowerKeyword.includes('vulnerability')
      );
    });
    
    return cybersecurityKeywords.slice(0, 10); // Limit to top 10 keywords
  } catch (error) {
    console.error('Error extracting keywords:', error);
    return extractTags(text); // Fallback to tag extraction
  }
}

export function calculateThreatLevel(text) {
  if (!text) return 'medium';
  
  const lowerText = text.toLowerCase();
  
  // Critical indicators
  const criticalTerms = [
    'zero-day', 'critical vulnerability', 'nation-state', 'apt', 
    'supply chain attack', 'critical infrastructure', 'emergency patch',
    'actively exploited', 'widespread attack', 'global impact'
  ];
  if (criticalTerms.some(term => lowerText.includes(term))) {
    return 'critical';
  }
  
  // High indicators
  const highTerms = [
    'ransomware', 'data breach', 'exploit', 'malware campaign',
    'targeted attack', 'sophisticated', 'advanced persistent',
    'major breach', 'significant impact'
  ];
  if (highTerms.some(term => lowerText.includes(term))) {
    return 'high';
  }
  
  // Low indicators
  const lowTerms = [
    'patch', 'update', 'advisory', 'recommendation', 'awareness',
    'best practice', 'guidance', 'minor', 'low risk'
  ];
  if (lowTerms.some(term => lowerText.includes(term))) {
    return 'low';
  }
  
  return 'medium';
}

export function analyzeSentiment(text) {
  if (!text) return null;
  
  const result = sentiment.analyze(text);
  
  return {
    score: result.score,
    comparative: result.comparative,
    tokens: result.tokens,
    words: result.words,
    positive: result.positive,
    negative: result.negative
  };
}

export function generateSummary(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;
  
  try {
    // Use compromise for better text processing
    const doc = compromise(text);
    const sentences = doc.sentences().out('array');
    
    let summary = '';
    for (const sentence of sentences) {
      if (summary.length + sentence.length <= maxLength) {
        summary += sentence + ' ';
      } else {
        break;
      }
    }
    
    return summary.trim() || text.substring(0, maxLength) + '...';
  } catch (error) {
    // Fallback to simple truncation
    return text.substring(0, maxLength) + '...';
  }
}

export function extractEntities(text) {
  if (!text) return { organizations: [], locations: [], people: [] };
  
  try {
    const doc = compromise(text);
    
    return {
      organizations: doc.organizations().out('array'),
      locations: doc.places().out('array'),
      people: doc.people().out('array')
    };
  } catch (error) {
    console.error('Error extracting entities:', error);
    return { organizations: [], locations: [], people: [] };
  }
}

export function categorizeByIndustry(text) {
  if (!text) return 'general';
  
  const lowerText = text.toLowerCase();
  
  const industryKeywords = {
    healthcare: ['hospital', 'medical', 'health', 'patient', 'healthcare', 'clinic'],
    finance: ['bank', 'financial', 'fintech', 'payment', 'credit', 'trading', 'investment'],
    government: ['government', 'federal', 'state', 'public', 'agency', 'military', 'defense'],
    retail: ['retail', 'ecommerce', 'shopping', 'store', 'consumer', 'merchant'],
    technology: ['tech', 'software', 'cloud', 'saas', 'platform', 'startup'],
    energy: ['energy', 'power', 'utility', 'grid', 'oil', 'gas', 'nuclear'],
    education: ['school', 'university', 'education', 'student', 'academic', 'research'],
    manufacturing: ['manufacturing', 'factory', 'industrial', 'production', 'supply chain']
  };
  
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return industry;
    }
  }
  
  return 'general';
}