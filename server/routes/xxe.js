const express = require('express');
const router = express.Router();
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const { checkEnv } = require('../utils/helpers');
const auth = require('../middleware/auth');

// XXE Vulnerable XML parser
router.post('/parse', (req, res) => {
  if (!checkEnv('ENABLE_XXE')) {
    return res.status(403).json({ error: 'XXE feature is disabled' });
  }
  
  const { xml } = req.body;
  
  if (!xml) {
    return res.status(400).json({ error: 'XML string required' });
  }
  
  // A03: XXE Injection vulnerability - No disabling of external entities
  const parser = new xml2js.Parser({
    explicitArray: false,
    // A03: XXE - Should have { disableEntityReferences: true } here
  });
  
  parser.parseString(xml, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    res.json({
      message: 'XML parsed successfully',
      result
    });
  });
});

// Import products from XML
router.post('/import/products', auth, (req, res) => {
  if (!checkEnv('ENABLE_XXE')) {
    return res.status(403).json({ error: 'XXE feature is disabled' });
  }
  
  // Check if user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  
  // Get XML from request
  let xmlData;
  
  if (req.files && req.files.xmlFile) {
    // From file upload
    xmlData = req.files.xmlFile.data.toString();
  } else if (req.body.xml) {
    // From JSON body
    xmlData = req.body.xml;
  } else {
    return res.status(400).json({ error: 'XML data required (either as file or in request body)' });
  }
  
  // A03: XXE Injection vulnerability - Unsafe XML parsing
  const parser = new xml2js.Parser({
    // A03: XXE - Missing entity reference protection
  });
  
  parser.parseString(xmlData, (err, result) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    try {
      const products = result.products.product;
      
      if (!products || !Array.isArray(products)) {
        return res.status(400).json({ error: 'Invalid product data format' });
      }
      
      // Process products
      res.json({
        message: `${products.length} products parsed successfully`,
        products
      });
      
    } catch (err) {
      res.status(400).json({ error: 'Invalid XML structure' });
    }
  });
});

// Export sample XML (for demonstration)
router.get('/sample', (req, res) => {
  if (!checkEnv('ENABLE_XXE')) {
    return res.status(403).json({ error: 'XXE feature is disabled' });
  }
  
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE products [
  <!ELEMENT products (product*)>
  <!ELEMENT product (name, description, price, category, stock)>
  <!ELEMENT name (#PCDATA)>
  <!ELEMENT description (#PCDATA)>
  <!ELEMENT price (#PCDATA)>
  <!ELEMENT category (#PCDATA)>
  <!ELEMENT stock (#PCDATA)>
]>
<products>
  <product>
    <name>Sample Product 1</name>
    <description>This is a sample product</description>
    <price>19.99</price>
    <category>sample</category>
    <stock>10</stock>
  </product>
  <product>
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
