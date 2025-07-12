const express = require('express')
const session = require('express-session')
const next = require('next')
const port = process.env.PORT || 3001
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = express()
    
    // Add session middleware
    server.use(session({
        secret: 'your-session-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
    }))
    
    // Parse JSON bodies
    server.use(express.json())
    
    // LTI API endpoints
    server.post('/api/user', (req, res) => {
        // Store LTI data in session
        const { userInfo, contextInfo, resourceInfo } = req.body;
        req.session.userInfo = userInfo;
        req.session.contextInfo = contextInfo;
        req.session.resourceInfo = resourceInfo;
        res.json({ success: true });
    })
    
    server.get('/api/user', (req, res) => {
        if (!req.session.userInfo) {
            return res.status(401).json({ error: 'Not authenticated via LTI' })
        }
        res.json({
            user: req.session.userInfo,
            context: req.session.contextInfo,
            resource: req.session.resourceInfo
        })
    })
    
    server.post('/api/submit-results', async (req, res) => {
        try {
            const { results, gameData } = req.body
            const { userInfo, resourceInfo } = req.session
            
            if (!userInfo) {
                return res.status(401).json({ error: 'Not authenticated via LTI' })
            }
            
            // Store results in database (you can expand this)
            console.log(`Visual Search Results - User: ${userInfo.name}`, results)
            
            // You can add grade passback here if needed for the visual search results
            
            res.json({ 
                success: true, 
                message: 'Results submitted successfully',
                results: results
            })
        } catch (error) {
            console.error('Results submission error:', error)
            res.status(500).json({ error: 'Failed to submit results' })
        }
    })
    
    server.get('/api/hello', (req, res) => {
        res.json({ message: 'Hello from Express+Next.js!' })
    })
    
    server.all('*', (req, res) => {
        return handle(req, res)
    })
    
    server.listen(port, () => {
        console.log(`> Server running at http://localhost:${port}`)
    })
})
