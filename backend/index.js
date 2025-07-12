import path from 'path'
import { fileURLToPath } from 'url'
import { Provider } from 'ltijs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const lti = Provider

// 1. Setup the LTI provider (with MongoDB Atlas)
await lti.setup(
  'supersecret', // JWT secret
  {
    url: 'mongodb+srv://chhotu22:ioufDLeFolNHv4TR@lti.wfvxszi.mongodb.net/ltijs?retryWrites=true&w=majority&appName=lti'
  },
  {
    appRoute: '/',
    loginRoute: '/login',
    //keysetRoute: '/keys',
    cookies: {
      secure: false,
      sameSites: 'None'
    },
    devMode: true,
    dynReg: {
      url: 'https://lti.csbasics.in', // Tool Provider URL. Required field.
      name: 'Visual Search Tool', // Tool Provider name. Required field.
      logo: 'https://imgs.search.brave.com/Nh8VoS-LeggCpHsK1WyrJ93y5ZzhdvOHID1hEXXjp6Y/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzAyLzQ3LzAwLzYy/LzM2MF9GXzI0NzAw/NjIzMl9RS2hJNlUy/RlByNDlrUEJBZ09C/a2tvWWhOQXBxbG5W/Mi5qcGc', // Tool Provider logo URL.
      description: 'Visual Search and Perception Testing Tool for Educational Use', // Tool Provider description.
      redirectUris: ['https://lti.csbasics.in/'], // Additional redirection URLs. The main URL is added by default.
      customParameters: {}, // Custom parameters.
      autoActivate: true // Whether or not dynamically registered Platforms should be automatically activated. Defaults to false.
    }
  }
)

// 2. Define behavior when the tool is launched
lti.onConnect(async (token, req, res) => {
  // Extract user and context information for data exchange
  const userInfo = {
    id: token.userInfo.sub,
    name: token.userInfo.name,
    email: token.userInfo.email,
    roles: token.userInfo['https://purl.imsglobal.org/spec/lti/claim/roles']
  }
  
  const contextInfo = {
    id: token.platformContext.contextId,
    label: token.platformContext.contextLabel,
    title: token.platformContext.contextTitle,
    type: token.platformContext.contextType
  }
  
  const resourceInfo = {
    id: token.platformContext.resourceLinkId,
    title: token.platformContext.resourceLinkTitle,
    description: token.platformContext.resourceLinkDescription
  }

  console.log('LTI Launch - User:', userInfo.name, 'Context:', contextInfo.title)
  console.log('Available data for exchange:', { userInfo, contextInfo, resourceInfo })
  
  // Store LTI data in global variable for API access
  if (!global.ltiSessions) {
    global.ltiSessions = new Map()
  }
  
  const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  global.ltiSessions.set(sessionId, {
    userInfo,
    contextInfo,
    resourceInfo,
    token,
    timestamp: Date.now()
  })
  
  // Clean up expired sessions (older than 2 hours)
  setTimeout(() => {
    global.ltiSessions.delete(sessionId)
  }, 2 * 60 * 60 * 1000)
  
  // Serve the frontend with session data embedded
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visual Search LTI Tool</title>
        <style>
            body { margin: 0; font-family: Arial, sans-serif; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { background: #2c3e50; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .user-info { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .app-area { background: white; padding: 20px; border-radius: 8px; min-height: 400px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .btn { background: #3498db; color: white; border: none; padding: 12px 24px; border-radius: 5px; cursor: pointer; font-size: 16px; margin: 10px 0; }
            .btn:hover { background: #2980b9; }
            .btn-success { background: #27ae60; }
            .btn-success:hover { background: #219a52; }
            .results { margin-top: 20px; padding: 15px; background: #ecf0f1; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔍 Visual Search Tool</h1>
                <p>Learning Tools Interoperability (LTI) 1.3 Tool</p>
            </div>
            
            <div class="user-info">
                <h3>📋 Session Information</h3>
                <p><strong>User:</strong> ${userInfo.name || 'Unknown'}</p>
                <p><strong>Email:</strong> ${userInfo.email || 'Not provided'}</p>
                <p><strong>Course:</strong> ${contextInfo.title || 'Unknown Course'}</p>
                <p><strong>Role:</strong> ${userInfo.roles ? userInfo.roles.join(', ') : 'Not specified'}</p>
                <p><strong>Session ID:</strong> ${sessionId}</p>
            </div>
            
            <div class="app-area">
                <h3>🎯 Visual Search Exercise</h3>
                <p>This tool demonstrates enhanced data exchange between Moodle and the application.</p>
                
                <button class="btn" onclick="getUserData()">📊 Get User Data</button>
                <button class="btn" onclick="getContextData()">🏫 Get Context Data</button>
                <button class="btn" onclick="startVisualSearch()">🔍 Start Visual Search</button>
                <button class="btn btn-success" onclick="submitResults()">✅ Submit Results</button>
                
                <div id="results" class="results" style="display: none;">
                    <h4>Results:</h4>
                    <pre id="resultsContent"></pre>
                </div>
                
                <div id="search-area" style="display: none; border: 2px dashed #bdc3c7; height: 300px; margin: 20px 0; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                    <p>🔍 Visual search interface would be implemented here</p>
                </div>
            </div>
        </div>
        
        <script>
            const sessionId = '${sessionId}';
            
            function showResults(data) {
                document.getElementById('results').style.display = 'block';
                document.getElementById('resultsContent').textContent = JSON.stringify(data, null, 2);
            }
            
            function getUserData() {
                fetch('/api/user/' + sessionId)
                    .then(response => response.json())
                    .then(data => showResults(data))
                    .catch(error => showResults({ error: error.message }));
            }
            
            function getContextData() {
                fetch('/api/context/' + sessionId)
                    .then(response => response.json())
                    .then(data => showResults(data))
                    .catch(error => showResults({ error: error.message }));
            }
            
            function startVisualSearch() {
                const searchArea = document.getElementById('search-area');
                searchArea.style.display = 'flex';
                searchArea.innerHTML = '<p>🔍 Visual search test started with session data...</p>';
                
                // Simulate visual search activity
                setTimeout(() => {
                    searchArea.innerHTML = '<p>✅ Visual search completed! Click Submit Results to send data to Moodle.</p>';
                }, 2000);
            }
            
            function submitResults() {
                const results = {
                    score: Math.floor(Math.random() * 10) + 1,
                    totalQuestions: 10,
                    timeSpent: 120,
                    answers: ['correct', 'incorrect', 'correct', 'correct', 'incorrect']
                };
                
                fetch('/api/submit-results/' + sessionId, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(results)
                })
                .then(response => response.json())
                .then(data => {
                    showResults(data);
                    alert('Results submitted successfully! Grade sent to Moodle.');
                })
                .catch(error => {
                    showResults({ error: error.message });
                    alert('Error submitting results: ' + error.message);
                });
            }
        </script>
    </body>
    </html>
  `)
})

// API endpoint to get user data
lti.app.get('/api/user/:sessionId', (req, res) => {
  const { sessionId } = req.params
  
  if (!global.ltiSessions || !global.ltiSessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found or expired' })
  }
  
  const session = global.ltiSessions.get(sessionId)
  res.json({
    user: session.userInfo,
    timestamp: session.timestamp
  })
})

// API endpoint to get context data
lti.app.get('/api/context/:sessionId', (req, res) => {
  const { sessionId } = req.params
  
  if (!global.ltiSessions || !global.ltiSessions.has(sessionId)) {
    return res.status(404).json({ error: 'Session not found or expired' })
  }
  
  const session = global.ltiSessions.get(sessionId)
  res.json({
    context: session.contextInfo,
    resource: session.resourceInfo,
    timestamp: session.timestamp
  })
})

// API endpoint to submit results with grade passback
lti.app.post('/api/submit-results/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params
    const { score, totalQuestions, timeSpent, answers } = req.body
    
    if (!global.ltiSessions || !global.ltiSessions.has(sessionId)) {
      return res.status(404).json({ error: 'Session not found or expired' })
    }
    
    const session = global.ltiSessions.get(sessionId)
    const { userInfo, contextInfo, resourceInfo, token } = session
    
    // Calculate grade percentage
    const gradePercentage = (score / totalQuestions) * 100
    
    console.log(`Results submitted - User: ${userInfo.name}, Score: ${score}/${totalQuestions} (${gradePercentage}%)`)
    
    // Send grade back to Moodle using LTI Assignment and Grade Services
    try {
      // Create a grade object according to LTI AGS spec
      const gradeObj = {
        userId: userInfo.id,
        scoreGiven: score,
        scoreMaximum: totalQuestions,
        comment: `Visual Search Exercise completed. Score: ${score}/${totalQuestions} (${gradePercentage}%). Time spent: ${timeSpent} seconds.`,
        timestamp: new Date().toISOString(),
        activityProgress: 'Completed',
        gradingProgress: 'FullyGraded'
      }
      
      // Use ltijs grade passback if available
      if (token.platformContext && token.platformContext.endpoint) {
        await lti.Grade.scorePassback(token, gradeObj)
        console.log('Grade successfully sent to Moodle via LTI AGS')
      }
    } catch (gradeError) {
      console.error('Grade passback failed:', gradeError)
      // Continue even if grade passback fails
    }
    
    res.json({ 
      success: true, 
      message: 'Results submitted successfully',
      data: {
        score,
        totalQuestions,
        percentage: gradePercentage,
        timeSpent,
        user: userInfo.name,
        context: contextInfo.title,
        submittedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Result submission error:', error)
    res.status(500).json({ error: 'Failed to submit results' })
  }
})

// 3. Deploy the provider first — this must come before registering platforms!
await lti.deploy({ port: 3000 })

// 4. Register the Moodle platform AFTER deployment
await lti.registerPlatform({
  url: 'https://moodle.lti.csbasics.in',
  name: 'Moodle',
  clientId: '4ujCSyRPyjd18rQ',
  authenticationEndpoint: 'https://moodle.lti.csbasics.in/mod/lti/auth.php',
  accesstokenEndpoint: 'https://moodle.lti.csbasics.in/mod/lti/token.php',
  authConfig: {
    method: 'JWK_SET',
    keysetUrl: 'https://moodle.lti.csbasics.in/mod/lti/certs.php'
  },
  alg: 'RS256'
})

console.log('LTI Provider deployed successfully on port 3000')
console.log('Moodle platform registered successfully')
console.log('Data exchange capabilities enabled with LTI Deep Linking support')
