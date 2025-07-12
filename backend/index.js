import path from 'path'
import { fileURLToPath } from 'url'
import { Provider } from 'ltijs'
import session from 'express-session'

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
  
  // Create a session transfer mechanism
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
  
  // Redirect to frontend with transfer ID
  // Always redirect to the same domain in production
  const frontendUrl = 'https://lti.csbasics.in'
  res.redirect(`${frontendUrl}/lti-launch?transferId=${transferId}`)
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
        target_link_uri: 'https://lti.csbasics.in/',
        custom_parameters: {},
        claims: ['iss', 'sub', 'aud', 'exp', 'iat', 'nonce'],
        messages: [
          {
            type: 'LtiResourceLinkRequest',
            target_link_uri: 'https://lti.csbasics.in/',
            label: 'Visual Search Tool'
          }
        ]
      }
    })
  }
  
  // For other root requests, let the frontend handle them
  return res.status(404).json({ 
    error: 'This endpoint is for LTI dynamic registration only. Please access the tool through your LMS.',
    lti_info: 'https://lti.csbasics.in/info'
  })
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
