import { motion } from 'framer-motion';
import { Shield, Mail, Twitter, Linkedin, Github, ExternalLink } from 'lucide-react';
import React, { useState, useEffect } from 'react';
const Footer: React.FC = () => {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const footerLinks = {
  project: [
    { name: 'About CyberWatch', url: 'https://github.com/Gourish112/CYBER-NEWS',type: "external" },
    { name: 'Solo Developer', url: 'https://www.linkedin.com/in/gourish-bhatia-56b10424b',type: "external" },
    { name: 'Contribute', url: 'https://github.com/Gourish112/CYBER-NEWS',type: "external" },
    { name: 'Contact Me', url: 'mailto:gourishbhatia2004@gmail.com' },
  ]
  };
  const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/gourish-bhatia-56b10424b', color: 'hover:text-blue-600' },
    { name: 'GitHub', icon: Github, href: 'https://github.com/Gourish112/', color: 'hover:text-gray-400' },
    { name: 'Email', icon: Mail, href: 'mailto:gourishbhatia2004@gmail.com', color: 'hover:text-cyber-green' },
  ];
  const handleSubscribe = async () => {
  if (!email || !email.includes('@')) {
    setMessage('⚠️ Please enter a valid email.');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (response.ok) {
      setMessage('✅ Subscribed successfully!');
      setEmail('');
    } else {
      setMessage(`⚠️ ${result.message}`);
    }
  } catch (err) {
    console.error('Subscribe error:', err);
    setMessage('❌ Failed to subscribe. Please try again.');
  }
};

  return (
    <footer className="bg-gray-900 dark:bg-black text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-4">Stay Ahead of Cyber Threats</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Get the latest cybersecurity news, threat intelligence, and expert analysis delivered to your inbox weekly.
            </p>
            
            <div className="max-w-md mx-auto">
              <div className="flex space-x-4">
                <input
                  type="email"
                  value={email}
  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyber-green focus:border-transparent text-white placeholder-gray-400"
                  aria-label="Email address for newsletter"
                />
                <motion.button
                  className="px-6 py-3 bg-cyber-green text-black font-semibold rounded-lg hover:bg-cyber-green/90 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubscribe}
                >
                  Subscribe
                </motion.button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <Shield className="h-8 w-8 text-cyber-green" />
                <div className="absolute inset-0 animate-pulse-glow rounded-full"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyber-green to-cyber-blue bg-clip-text text-transparent">
                CyberWatch
              </span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm">
              Your trusted source for cybersecurity news, threat intelligence, and expert analysis. 
              Keeping you informed about the evolving digital threat landscape.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className={`p-3 rounded-lg bg-gray-800 text-gray-400 ${social.color} transition-colors duration-200`}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-4 capitalize">
                {category === 'project' ? 'Project' :
                category === 'resources' ? 'Resources' :
                category === 'legal' ? 'Legal' : 'Info'}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <motion.a
                      href={link.url}
                      className="text-gray-400 hover:text-cyber-green transition-colors duration-200 flex items-center space-x-1 group"
                      whileHover={{ x: 3 }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>{link.name}</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-gray-800 pt-8 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© 2025 CyberWatch. All rights reserved.</span>
              <span className="hidden md:inline">|</span>
              <span className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-cyber-green" />
                <span>Secured by industry-standard encryption</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>Made with ❤️ for the cybersecurity community</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;