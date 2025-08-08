#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const validateJsonData = () => {
  const publicDir = path.join(__dirname, '../../public');
  const files = ['cyware_news.json', 'cyber_news_insights.json'];
  
  console.log('🔍 Validating ML Pipeline JSON Data Files...\n');
  
  files.forEach(filename => {
    const filePath = path.join(publicDir, filename);
    
    console.log(`📄 Checking ${filename}:`);
    
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ File not found: ${filename}`);
      return;
    }
    
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(data);
      
      if (filename === 'cyware_news.json') {
        if (!Array.isArray(parsed)) {
          console.log(`   ❌ Expected array, got ${typeof parsed}`);
          return;
        }
        
        console.log(`   ✅ Valid JSON array with ${parsed.length} articles`);
        
        // Validate article structure
        const sampleArticle = parsed[0];
        if (sampleArticle) {
          const requiredFields = ['title', 'summary', 'link', 'date'];
          const missingFields = requiredFields.filter(field => !sampleArticle[field]);
          
          if (missingFields.length > 0) {
            console.log(`   ⚠️  Sample article missing fields: ${missingFields.join(', ')}`);
          } else {
            console.log(`   ✅ Article structure looks good`);
          }
        }
      } else if (filename === 'cyber_news_insights.json') {
        if (typeof parsed !== 'object') {
          console.log(`   ❌ Expected object, got ${typeof parsed}`);
          return;
        }
        
        console.log(`   ✅ Valid JSON object`);
        
        // Check for expected insight categories
        const expectedCategories = ['incidents_by_sector', 'apts_involved', 'strategic_issues'];
        const presentCategories = expectedCategories.filter(cat => parsed[cat]);
        
        console.log(`   ✅ Found ${presentCategories.length}/${expectedCategories.length} insight categories`);
      }
      
    } catch (error) {
      console.log(`   ❌ Invalid JSON: ${error.message}`);
    }
    
    console.log('');
  });
  
  console.log('✨ JSON validation complete!\n');
};

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateJsonData();
}

export default validateJsonData;