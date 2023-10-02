const express = require('express')
const blogController = require('../Controllers/blogController')

const router = express.Router()

// Blog analytics route
router.get('/blog-stats', blogController.getBlogStats)

// Blog search route
router.get('/blog-search', blogController.searchBlogs)

module.exports = router