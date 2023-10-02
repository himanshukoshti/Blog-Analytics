const express = require('express')
const bodyParser = require('body-parser')
const blogRoutes = require('./Routes/blogRoutes')

const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(bodyParser.json())

// Routes
app.use('/api', blogRoutes)

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})