const axios = require('axios')
const lodash = require('lodash')

const dotenv = require("dotenv")
dotenv.config({path: './config.env'})

// Replaced with actual API URL and API Secret
const API_URL = process.env.API_URL
const API_SECRET = process.env.API_SECRET

// Function to fetch blog data from the API
async function fetchBlogData() {
    try {
        const response = await axios.get(API_URL, {
            headers: {
            'x-hasura-admin-secret': API_SECRET,
            },
        });
        return response.data
    }catch (error) {
        throw error
    }
}

// Wraping the data retrieval function with memoization
const memoizedFetchBlogData = lodash.memoize(fetchBlogData)

// Function to calculate blog statistics
// API for Postman: http://localhost:3000/api/blog-stats
async function calculateBlogStats() {
    try {
        const blogData = await memoizedFetchBlogData()

        if (!Array.isArray(blogData.blogs)) {
            throw new Error('Invalid blog data format.')
        }

        // Calculating the total number of blogs
        const totalBlogs = blogData.blogs.length

        // Finding the blog with the longest title
        const longestTitleBlog = lodash.maxBy(blogData.blogs, (blog) => blog.title ? blog.title.length : 0)

        // Finding the number of blogs with "privacy" in the title
        const privacyBlogs = lodash.filter(blogData.blogs, (blog) =>
            blog.title && blog.title.toLowerCase().includes('privacy')
        )

        // Create an array of unique blog titles
        const uniqueBlogTitles = lodash.uniqBy(blogData.blogs, (blog) => blog.title)

        return {
            totalBlogs,
            longestTitle: longestTitleBlog ? longestTitleBlog.title : null,
            privacyBlogs: privacyBlogs.length,
            uniqueBlogTitles: uniqueBlogTitles.map((blog) => blog.title),
        };
    }catch (error) {
        throw error
    }
}

const memoizedCalculateBlogStats = lodash.memoize(calculateBlogStats)

// Controller function for /api/blog-stats route
async function getBlogStats(req, res) {
    try {
        const blogStats = await memoizedCalculateBlogStats()
        res.json(blogStats)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'An error occurred while fetching blog stats.' })
    }
}

// Controller function for /api/blog-search route
// API for Postman: http://localhost:3000/api/blog-search?query=privacy
function searchBlogs(req, res) {
    const query = req.query.query.toLowerCase()
    memoizedFetchBlogData().then((blogData) => {
        const matchingBlogs = lodash.filter(blogData.blogs, (blog) =>
        blog.title.toLowerCase().includes(query)
        )
        res.json(matchingBlogs)
    }).catch((error) => {
        console.error(error)
        res.status(500).json({ error: 'An error occurred while searching for blogs.' })
    })
}

module.exports = {
  getBlogStats,
  searchBlogs,
}