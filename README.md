<h1>📱 Social Media Application</h1>

  <p>This is a full-stack social media web application built with <strong>React.js</strong> on the frontend and <strong>Spring Boot</strong> on the backend, with features such as authentication, posting, commenting, and user profile management.</p>

  <h2>🧱 Project Structure</h2>
  <ul>
    <li><strong>Frontend:</strong> React.js project (located in <code>Frontend/</code>)</li>
    <li><strong>Backend:</strong> Spring Boot project (located in <code>Backend/social-media-application/</code>)</li>
  </ul>

  <h2>🛠️ Tech Stack</h2>
  <ul>
    <li><strong>Frontend:</strong> React.js, HTML, CSS</li>
    <li><strong>Backend:</strong> Spring Boot, Java, REST APIs</li>
    <li><strong>Database:</strong> PostgreSQL</li>
    <li><strong>Cloud Services:</strong> Cloudinary for image uploads</li>
  </ul>

  <h2>📌 Features</h2>
  <ul>
    <li>User Registration and Login (JWT-based authentication)</li>
    <li>Create and View Posts (with Image upload)</li>
    <li>Follow and Unfollow users</li>
    <li>Comment on Posts</li>
    <li>View User Profile</li>
    <li>View Home Feed</li>
    <li>AI based Tag Recommendation</li>
  </ul>

  <h2>🌐 API Endpoints</h2>
  <h3>AuthController</h3>
  <ul>
    <li><code>POST /api/auth/register</code> – Register a new user</li>
    <li><code>POST /api/auth/login</code> – Login and receive JWT</li>
  </ul>

  <h3>UserController</h3>
  <ul>
    <li><code>GET /api/user/{username}</code> – Get user details</li>
    <li><code>PUT /api/user/{id}</code> – Update user profile</li>
  </ul>

  <h3>PostController</h3>
  <ul>
    <li><code>POST /api/post</code> – Create a new post</li>
    <li><code>GET /api/post/all</code> – Get all posts</li>
    <li><code>GET /api/post/{id}</code> – Get post by ID</li>
  </ul>

  <h3>CommentController</h3>
  <ul>
    <li><code>POST /api/comment</code> – Add a comment</li>
    <li><code>GET /api/comment/post/{postId}</code> – Get comments for a post</li>
  </ul>

  <h2>📁 Example Project Tree</h2>
  <pre>
Frontend/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   ├── App.js
│   └── ...
Backend/
└── social-media-application/
    ├── src/main/java/com/project/social_media_application/
    │   ├── controller/
    │   ├── config/
    │   └── ...
    ├── pom.xml
    └── ...
  </pre>

  <h2>🚀 Getting Started</h2>
  <h3>Frontend</h3>
  <pre>
cd Frontend
npm install
npm start
  </pre>

  <h3>Backend</h3>
  <pre>
cd Backend/social-media-application
./mvnw spring-boot:run
  </pre>
