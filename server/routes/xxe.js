const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');
const { DOMParser } = require('xmldom');
const logger = require('../utils/logger');
const auth = require('../middleware/auth');

// A04: Insecure Design - XXE Vulnerability
// This route intentionally has an XML External Entity vulnerability

/**
 * @route POST /api/xxe/parse
 * @desc Parse an XML document with XXE vulnerabilities
 * @access Private
 */
router.post('/parse', auth, async (req, res) => {
  try {
    if (!req.body.xml) {
      return res.status(400).json({ error: 'XML data is required' });
    }

    const xml = req.body.xml;
    
    // Vulnerable XML parsing - no entity restrictions
    const parser = new DOMParser({
      errorHandler: {
        warning: (w) => logger.warn(w),
        error: (e) => logger.error(e),
        fatalError: (e) => logger.error(e),
      }
    });
    
    // A04, A06: Insecure parsing of XML that allows XXE
    const doc = parser.parseFromString(xml, 'text/xml');
    
    // Extract data from parsed XML
    const result = {};
    const rootNode = doc.documentElement;
    
    // A simple traversal of the XML nodes
    if (rootNode && rootNode.childNodes) {
      for (let i = 0; i < rootNode.childNodes.length; i++) {
        const node = rootNode.childNodes[i];
        if (node.nodeType === 1) { // Element node
          result[node.nodeName] = node.textContent;
        }
      }
    }
    
    res.json(result);
    
  } catch (error) {
    logger.error(`XXE parsing error: ${error.message}`);
    res.status(500).json({ error: 'XML parsing failed' });
  }
});

/**
 * @route POST /api/xxe/convert
 * @desc Convert XML to JSON with XXE vulnerabilities
 * @access Private
 */
router.post('/convert', auth, async (req, res) => {
  try {
    if (!req.body.xml) {
      return res.status(400).json({ error: 'XML data is required' });
    }

    const xml = req.body.xml;
    
    // A04, A06: Vulnerable XML to JSON conversion
    // No validation or entity restrictions
    const parser = new xml2js.Parser({
      explicitArray: false,
      // Intentionally allowing external entity expansion
      xmlnsExplicitlyAllowed: true
    });
    
    parser.parseString(xml, (err, result) => {
      if (err) {
        logger.error(`XML to JSON conversion error: ${err.message}`);
        return res.status(400).json({ error: 'Invalid XML format' });
      }
      
      res.json(result);
    });
    
  } catch (error) {
    logger.error(`XXE conversion error: ${error.message}`);
    res.status(500).json({ error: 'XML conversion failed' });
  }
});

/**
 * @route GET /api/xxe/example
 * @desc Get example XML with XXE vulnerability
 * @access Public
 */
router.get('/example', (req, res) => {
  // This provides an example of an XML with XXE for demonstration
  const example = `
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE foo [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
}>
<user>
  <username>admin</username>
  <password>password123</password>
  <info>&xxe;</info>
</user>
`;

  res.json({ example });
});

module.exports = router;
    <name>Sample Product 2</name>
    <description>Another sample product</description>
    <price>29.99</price>
    <category>sample</category>
    <stock>5</stock>
  </product>
</products>`;
  
  res.header('Content-Type', 'application/xml').send(sampleXml);
});

module.exports = router;
