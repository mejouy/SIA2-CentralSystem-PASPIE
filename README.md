# Smart City Central System

## Deployment

### Frontend
- Deploy the [central-system](central-system) app on Vercel.
- Set the environment variable:
  - `VITE_API_BASE_URL=https://your-backend-url.vercel.app`

### Backend
- Deploy the [server](server) app on Vercel.
- Set the environment variables:
  - `MONGODB_URI=<your_mongodb_atlas_connection_string>`
  - `NODE_ENV=production`

### Frontend API base URL
- For a same-project Vercel deployment, `VITE_API_BASE_URL` may be left unset because the frontend will call `/api/...` on the same origin.
- If you want an explicit value, set:
  - `VITE_API_BASE_URL=https://<your-app>.vercel.app`

### Database
- Use MongoDB Atlas for production.
