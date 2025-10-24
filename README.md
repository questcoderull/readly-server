# Readly Server - Backend API

This is the backend server for the Readly blog platform. It provides RESTful APIs for managing blogs, comments, and wishlists with secure authentication using Firebase Admin SDK.

## Technology Stack

### Core Technologies

- Node.js - JavaScript runtime environment
- Express.js - Web application framework
- MongoDB - NoSQL database for data storage
- Firebase Admin SDK - Server-side authentication and authorization

### Middleware and Utilities

- CORS - Cross-Origin Resource Sharing support
- dotenv - Environment variable management

## Features

### Authentication and Security

- Firebase token verification for protected routes
- Email-based authorization to ensure users can only access their own data
- Secure API endpoints with proper error handling

### Blog Management

- Create, read, update blog posts
- Search blogs by title
- Filter blogs by category
- Fetch featured blogs
- Fetch user-specific blogs

### Comment System

- Add comments to blog posts
- Fetch all comments
- Fetch user-specific comments
- Fetch comments for specific blogs

### Wishlist Management

- Add blogs to wishlist
- Remove blogs from wishlist
- Fetch user wishlist
- Prevent duplicate wishlist entries

## API Endpoints

### Public Endpoints

#### Get All Blogs

```
GET /blogs
Query Parameters: search, category
Description: Fetch all blogs with optional search and category filters
```

#### Get Single Blog

```
GET /blogs/:id
Description: Fetch a specific blog by ID
```

#### Get Featured Blogs

```
GET /featured-blogs
Description: Fetch the 6 most recent blogs
```

#### Create Blog

```
POST /blogs
Body: { title, photo, category, descriptionShort, descriptionLong, authorName, authorEmail, authorPhoto }
Description: Create a new blog post
```

#### Update Blog

```
PUT /blogs/:id
Body: Blog data to update
Description: Update an existing blog post
```

#### Get All Comments

```
GET /comments
GET /all-comments
Description: Fetch all comments from all blogs
```

#### Add Comment

```
POST /comments
Body: { blogId, userName, userPhoto, userEmail, comment, createdAt }
Description: Add a comment to a blog post
```

### Protected Endpoints

These endpoints require Firebase authentication token in the Authorization header.

#### Get User's Blogs

```
GET /my-blogs
Headers: Authorization: Bearer <firebase-token>
Query Parameters: email
Description: Fetch all blogs created by the authenticated user
```

#### Get User's Comments

```
GET /my-comments
Headers: Authorization: Bearer <firebase-token>
Query Parameters: email
Description: Fetch all comments made by the authenticated user
```

#### Get User's Wishlist

```
GET /wishlist
Headers: Authorization: Bearer <firebase-token>
Query Parameters: email
Description: Fetch the authenticated user's wishlist
```

#### Add to Wishlist

```
POST /wishlist
Body: { blogId, title, category, authorName, email }
Description: Add a blog to the user's wishlist
```

#### Remove from Wishlist

```
DELETE /wishlist/:id
Description: Remove a blog from the wishlist
```

## Database Schema

### Blogs Collection

```javascript
{
  _id: ObjectId,
  title: String,
  photo: String,
  category: String,
  descriptionShort: String,
  descriptionLong: String,
  authorName: String,
  authorEmail: String,
  authorPhoto: String,
  createdAt: Date
}
```

### Comments Collection

```javascript
{
  _id: ObjectId,
  blogId: String,
  userName: String,
  userPhoto: String,
  userEmail: String,
  comment: String,
  createdAt: Date
}
```

### Wishlist Collection

```javascript
{
  _id: ObjectId,
  blogId: String,
  title: String,
  category: String,
  authorName: String,
  email: String
}
```

## Installation and Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database (local or Atlas)
- Firebase project with Admin SDK credentials

### Steps

1. Clone the repository

```bash
cd readly-server
```

2. Install dependencies

```bash
npm install
```

3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=3000
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
FB_SERVICE_KEY=your_base64_encoded_firebase_service_key
```

### Getting Firebase Service Key

1. Go to Firebase Console
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Download the JSON file
6. Convert the JSON to base64:
   ```bash
   cat serviceAccountKey.json | base64
   ```
7. Copy the base64 string to `FB_SERVICE_KEY` in `.env`

### MongoDB Connection

The server uses MongoDB Atlas connection string format:

```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

Update the connection string in `index.js` if using a different MongoDB setup.

4. Start the server

```bash
node index.js
```

The server will start on port 3000 (or the port specified in `.env`).

## Authentication Flow

### Firebase Token Verification

1. Client obtains Firebase ID token after user login
2. Client includes token in Authorization header: `Bearer <token>`
3. Server middleware `verifyFirebaseToken` validates the token
4. Server middleware `verifyTokenEmail` ensures the token email matches the requested email
5. If valid, the request proceeds; otherwise, 401 or 403 error is returned

### Middleware Functions

#### verifyFirebaseToken

Validates the Firebase ID token and decodes user information.

#### verifyTokenEmail

Compares the decoded token email with the query parameter email to prevent unauthorized access to other users' data.

## Error Handling

The API returns appropriate HTTP status codes:

- 200 - Success
- 401 - Unauthorized (invalid or missing token)
- 403 - Forbidden (email mismatch)
- 409 - Conflict (duplicate wishlist entry)
- 500 - Server error

## Deployment

### Deploying to Vercel

1. Install Vercel CLI

```bash
npm install -g vercel
```

2. Login to Vercel

```bash
vercel login
```

3. Deploy to production

```bash
vercel --prod
```

4. Configure environment variables in Vercel dashboard
   - Go to your project settings
   - Add all environment variables from `.env`
   - Redeploy if needed

### Important Notes for Deployment

- Ensure all environment variables are set in the deployment platform
- The Firebase service key must be base64 encoded
- MongoDB connection string should use proper credentials
- CORS is configured to allow all origins (adjust for production as needed)

## API Testing

### Using cURL

```bash
# Get all blogs
curl https://readly-server.vercel.app/blogs

# Get user's blogs (requires token)
curl -H "Authorization: Bearer <firebase-token>" \
  "https://readly-server.vercel.app/my-blogs?email=user@example.com"

# Add a blog
curl -X POST https://readly-server.vercel.app/blogs \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Blog","category":"Technology",...}'
```

### Using Postman

1. Import the API endpoints
2. Set Authorization header for protected routes
3. Use environment variables for base URL and token

## Performance Considerations

### Database Indexing

Consider adding indexes on frequently queried fields:

- `authorEmail` in blogs collection
- `userEmail` in comments collection
- `email` in wishlist collection
- `blogId` in comments and wishlist collections

### Caching

For production, consider implementing caching for:

- Featured blogs (rarely change)
- Blog details (update cache on modification)

## Security Best Practices

- Firebase tokens are verified on every protected request
- User email verification prevents unauthorized data access
- Environment variables protect sensitive credentials
- CORS should be configured to allow only trusted domains in production
- Rate limiting should be implemented for public endpoints

## Monitoring and Logging

The server logs:

- Decoded token information on authentication
- Server startup on specified port
- Database connection status

Consider adding:

- Request logging middleware
- Error tracking service integration
- Performance monitoring

## Troubleshooting

### Common Issues

**MongoDB Connection Error**

- Verify DB_USER and DB_PASS in .env
- Check MongoDB Atlas network access settings
- Ensure IP address is whitelisted

**Firebase Authentication Error**

- Verify FB_SERVICE_KEY is properly base64 encoded
- Ensure Firebase project has Auth enabled
- Check token expiration

**CORS Error**

- Verify frontend URL is allowed in CORS configuration
- Check request headers format

## Contributing

Contributions are welcome. Please ensure:

- Code follows existing patterns
- Environment variables are documented
- API endpoints are tested
- Error handling is implemented

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please open an issue in the repository.
