const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get nearby hospitals
router.get('/hospitals', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ 
        error: 'Missing parameters',
        message: 'Latitude and longitude are required' 
      });
    }

    const response = await axios.get('https://api.geoapify.com/v2/places', {
      params: {
        categories: 'healthcare.hospital', // Removed healthcare.clinic
        filter: `circle:${lon},${lat},5000`,
        limit: 20,
        apiKey: process.env.GEOAPIFY_API_KEY
      }
    });

    // Add error logging
    console.log('Geoapify Response:', {
      status: response.status,
      data: response.data
    });

    res.json(response.data);
  } catch (error) {
    console.error('Hospital Search Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    res.status(500).json({
      error: 'Failed to fetch hospitals',
      message: error.response?.data?.message || error.message
    });
  }
});

// Reverse geocoding
router.get('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const response = await axios.get('https://api.geoapify.com/v1/geocode/reverse', {
      params: {
        lat,
        lon,
        apiKey: process.env.GEOAPIFY_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error in reverse geocoding:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get location details' });
  }
});

// IP location (your existing endpoint)
router.get('/ip-location', async (req, res) => {
  try {
    if (!process.env.GEOAPIFY_API_KEY) {
      throw new Error('Geoapify API key is not configured');
    }

    const response = await axios.get('https://api.geoapify.com/v1/ipinfo', {
      params: {
        apiKey: process.env.GEOAPIFY_API_KEY
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Geolocation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });

    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid API key configuration',
        message: 'Please check the Geoapify API key configuration'
      });
    }

    res.status(500).json({ 
      error: 'Geolocation service error',
      message: error.message
    });
  }
});

module.exports = router;