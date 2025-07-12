import path from 'path'
import { fileURLToPath } from 'url'
import { Provider } from 'ltijs'
import session from 'express-session'
import express from 'express'

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
    appRoute: '/launch',
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
      redirectUris: ['https://lti.csbasics.in/', 'https://lti.csbasics.in/launch'], // Additional redirection URLs. The main URL is added by default.
      customParameters: {}, // Custom parameters.
      autoActivate: true // Whether or not dynamically registered Platforms should be automatically activated. Defaults to false.
    }
  }
)

// Add session middleware
lti.app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}))

// 2. Define behavior when the tool is launched
lti.onConnect(async (token, req, res) => {
  // Extract user and context information from LTI token
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
  
  // Store LTI data in session for the frontend to access
  req.session.userInfo = userInfo
  req.session.contextInfo = contextInfo
  req.session.resourceInfo = resourceInfo
  req.session.ltik = token
  
  // Create a session transfer mechanism for the frontend
  const sessionData = {
    userInfo,
    contextInfo,
    resourceInfo,
    timestamp: Date.now()
  }
  
  // Store in a temporary session transfer
  if (!global.sessionTransfer) {
    global.sessionTransfer = new Map()
  }
  
  const transferId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  global.sessionTransfer.set(transferId, sessionData)
  
  // Clean up expired sessions (older than 5 minutes)
  setTimeout(() => {
    global.sessionTransfer.delete(transferId)
  }, 5 * 60 * 1000)
  
  // Redirect to the frontend URL with session transfer ID
  res.redirect(`https://lti.csbasics.in/lti-launch?transferId=${transferId}`)
})

// Add a root route handler specifically for LTI dynamic registration and specific requests
lti.app.get('/', (req, res) => {
  // Only handle specific LTI-related requests
  if (req.query.openid_configuration || req.headers.accept?.includes('application/json')) {
    // Handle dynamic registration
    return res.json({
      issuer: 'https://lti.csbasics.in',
      authorization_endpoint: 'https://lti.csbasics.in/login',
      token_endpoint: 'https://lti.csbasics.in/token',
      jwks_uri: 'https://lti.csbasics.in/keys',
      registration_endpoint: 'https://lti.csbasics.in/register',
      scopes_supported: [
        'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem',
        'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly',
        'https://purl.imsglobal.org/spec/lti-ags/scope/score'
      ],
      response_types_supported: ['id_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      claims_supported: [
        'sub',
        'iss',
        'aud',
        'exp',
        'iat',
        'nonce'
      ],
      'https://purl.imsglobal.org/spec/lti-tool-configuration': {
        domain: 'lti.csbasics.in',
        description: 'Visual Search LTI Tool',
        target_link_uri: 'https://lti.csbasics.in/launch',
        custom_parameters: {},
        claims: ['iss', 'sub', 'aud', 'exp', 'iat', 'nonce'],
        messages: [
          {
            type: 'LtiResourceLinkRequest',
            target_link_uri: 'https://lti.csbasics.in/launch',
            label: 'Visual Search Tool'
          }
        ]
      }
    })
  }
  
  // For other root requests, show access denied message
  res.status(403).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Access Restricted - LTI Tool</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; text-align: center; }
            .warning { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #ffc107; }
            .info { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔍 Visual Search LTI Tool</h1>
            <p>Learning Tools Interoperability (LTI) 1.3 Tool</p>
        </div>
        
        <div class="warning">
            <h3>⚠️ Access Restricted</h3>
            <p>This tool can only be accessed through your Learning Management System (LMS).</p>
            <p>Direct access to this URL is not permitted.</p>
        </div>
        
        <div class="info">
            <h3>📋 For Instructors</h3>
            <p>To use this tool in your course:</p>
            <ul>
                <li>Log into your Moodle course</li>
                <li>Add an external tool activity</li>
                <li>Configure with the LTI settings provided by your administrator</li>
            </ul>
        </div>
        
        <div class="info">
            <h3>📚 About</h3>
            <p>This visual search tool provides interactive perception testing and learning activities integrated with your LMS gradebook.</p>
        </div>
    </body>
    </html>
  `)
})

// Serve the frontend application only for valid LTI launches
lti.app.get('/lti-launch', (req, res) => {
  const transferId = req.query.transferId
  
  if (!transferId) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Invalid Access - LTI Tool</title>
          <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .error { background: #f8d7da; padding: 20px; border-radius: 5px; border-left: 4px solid #dc3545; }
          </style>
      </head>
      <body>
          <div class="error">
              <h1>❌ Invalid Access</h1>
              <p>This page can only be accessed through a valid LTI launch from your LMS.</p>
              <p>Please access this tool through your Moodle course.</p>
          </div>
      </body>
      </html>
    `)
  }
  
  // Verify the transfer ID exists
  if (!global.sessionTransfer || !global.sessionTransfer.has(transferId)) {
    return res.status(403).send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Session Expired - LTI Tool</title>
          <style>
              body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
              .error { background: #f8d7da; padding: 20px; border-radius: 5px; border-left: 4px solid #dc3545; }
          </style>
      </head>
      <body>
          <div class="error">
              <h1>⏰ Session Expired</h1>
              <p>Your LTI session has expired or is invalid.</p>
              <p>Please launch the tool again from your Moodle course.</p>
          </div>
      </body>
      </html>
    `)
  }
  
  // Serve a simple frontend HTML that will load the Next.js app
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Visual Search LTI Tool</title>
        <style>
            body { margin: 0; font-family: Arial, sans-serif; }
            #loading { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                flex-direction: column; 
            }
            .spinner { 
                border: 4px solid #f3f3f3; 
                border-top: 4px solid #3498db; 
                border-radius: 50%; 
                width: 40px; 
                height: 40px; 
                animation: spin 2s linear infinite; 
            }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
    </head>
    <body>
        <div id="loading">
            <div class="spinner"></div>
            <p>Loading Visual Search Tool...</p>
        </div>
        
        <script>
            // Get session data and initialize the app
            const urlParams = new URLSearchParams(window.location.search);
            const transferId = urlParams.get('transferId');
            
            if (transferId) {
                // Fetch session data from backend
                fetch('/api/session-transfer/' + transferId)
                    .then(response => response.json())
                    .then(sessionData => {
                        if (sessionData.error) {
                            document.getElementById('loading').innerHTML = 
                                '<h2>❌ Session Error</h2><p>' + sessionData.error + '</p>';
                            return;
                        }
                        
                        // Store session data for the app
                        sessionStorage.setItem('ltiSessionData', JSON.stringify(sessionData));
                        
                        // Hide loading and show app
                        document.getElementById('loading').style.display = 'none';
                        
                        // Initialize the visual search app
                        initVisualSearchApp(sessionData);
                    })
                    .catch(error => {
                        console.error('Session transfer failed:', error);
                        document.getElementById('loading').innerHTML = 
                            '<h2>❌ Loading Error</h2><p>Failed to load the application.</p>';
                    });
            } else {
                document.getElementById('loading').innerHTML = 
                    '<h2>❌ Invalid Access</h2><p>Missing session information.</p>';
            }
            
            function initVisualSearchApp(sessionData) {
                // Create the main app container
                const appContainer = document.createElement('div');
                appContainer.id = 'visual-search-app';
                document.body.appendChild(appContainer);
                
                // Simple visual search app implementation
                appContainer.innerHTML = \`
                    <div style="padding: 20px;">
                        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                            <h2>🔍 Visual Search Tool</h2>
                            <p><strong>Welcome, \${sessionData.userInfo.name || 'Student'}!</strong></p>
                            <p>Course: \${sessionData.contextInfo.title || 'Unknown Course'}</p>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3>🎯 Visual Search Exercise</h3>
                            <p>This is a placeholder for the visual search application.</p>
                            <p>The full Next.js visual search app will be integrated here.</p>
                            
                            <div style="margin: 20px 0;">
                                <button onclick="startVisualSearch()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                                    Start Visual Search Test
                                </button>
                            </div>
                            
                            <div id="search-area" style="display: none; border: 2px dashed #ccc; height: 300px; margin: 20px 0; display: flex; align-items: center; justify-content: center;">
                                <p>Visual search interface will appear here</p>
                            </div>
                        </div>
                    </div>
                \`;
            }
            
            function startVisualSearch() {
                const searchArea = document.getElementById('search-area');
                searchArea.style.display = 'flex';
                searchArea.innerHTML = '<p>🔍 Visual search test would start here...</p>';
                
                // This is where we would integrate the actual visual search game
                console.log('Starting visual search with session data:', 
                    JSON.parse(sessionStorage.getItem('ltiSessionData')));
            }
        </script>
    </body>
    </html>
  `)
})

// Add /launch route for LTI launches (Moodle sometimes uses this)
lti.app.get('/launch', (req, res) => {
  // This should be handled by the LTI library, but if it gets here, 
  // show a message indicating it should be accessed via LTI
  res.status(403).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>LTI Launch Required - Visual Search Tool</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { background: #f8d7da; padding: 20px; border-radius: 5px; border-left: 4px solid #dc3545; }
        </style>
    </head>
    <body>
        <div class="error">
            <h1>❌ Invalid Launch Access</h1>
            <p>This URL is for LTI launches only.</p>
            <p>Please access this tool through your Moodle course, not directly in the browser.</p>
            <p>The tool must be launched from your LMS with proper authentication.</p>
        </div>
    </body>
    </html>
  `)
})

// Add a simple info route for direct access
lti.app.get('/info', (req, res) => {
  res.json({
    name: 'LTI Visual Search Provider',
    description: 'This is an LTI 1.3 tool that provides visual search functionality.',
    version: '1.0.0',
    launch_url: 'https://lti.csbasics.in/',
    registration_url: 'https://lti.csbasics.in/register',
    note: 'This tool should be launched from your LMS (Moodle). Direct access is not intended for end users.'
  })
})

// Session transfer endpoint for frontend
lti.app.get('/api/session-transfer/:transferId', (req, res) => {
  const { transferId } = req.params
  
  if (!global.sessionTransfer) {
    global.sessionTransfer = new Map()
  }
  
  const sessionData = global.sessionTransfer.get(transferId)
  if (sessionData) {
    global.sessionTransfer.delete(transferId) // One-time use
    res.json(sessionData)
  } else {
    res.status(404).json({ error: 'Session not found or expired' })
  }
})

// API Endpoints for data exchange
lti.app.get('/api/user', (req, res) => {
  if (!req.session.userInfo) {
    return res.status(401).json({ error: 'Not authenticated via LTI' })
  }
  res.json({
    user: req.session.userInfo,
    context: req.session.contextInfo,
    resource: req.session.resourceInfo
  })
})

lti.app.post('/api/submit-quiz', async (req, res) => {
  try {
    const { score, totalQuestions, answers } = req.body
    const { userInfo, resourceInfo, ltik } = req.session
    
    if (!userInfo || !resourceInfo) {
      return res.status(401).json({ error: 'Not authenticated via LTI' })
    }
    
    // Calculate grade percentage
    const gradePercentage = (score / totalQuestions) * 100
    
    // Store quiz result in database (you can expand this)
    console.log(`Quiz submitted - User: ${userInfo.name}, Score: ${score}/${totalQuestions}`)
    
    // Send grade back to Moodle if Grade Service is available
    if (ltik && ltik.platformContext && ltik.platformContext.endpoint) {
      try {
        const gradeObj = {
          userId: userInfo.id,
          scoreGiven: score,
          scoreMaximum: totalQuestions,
          comment: `Quiz completed with ${score} correct answers out of ${totalQuestions}`
        }
        
        await lti.Grade.scorePassback(ltik, gradeObj)
        console.log('Grade successfully sent to Moodle')
      } catch (gradeError) {
        console.error('Grade passback failed:', gradeError)
      }
    }
    
    res.json({ 
      success: true, 
      message: 'Quiz submitted successfully',
      score: score,
      percentage: gradePercentage
    })
  } catch (error) {
    console.error('Quiz submission error:', error)
    res.status(500).json({ error: 'Failed to submit quiz' })
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
