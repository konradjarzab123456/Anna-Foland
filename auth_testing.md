# Auth Testing Playbook — Studio site (JWT admin auth)

## Environment
- Backend: FastAPI on 0.0.0.0:8001, all routes under /api
- DB: MongoDB via MONGO_URL, DB_NAME from /app/backend/.env
- Collections: users (unique email index), login_attempts, contact_messages, site_content
- Admin seeded on startup from ADMIN_EMAIL / ADMIN_PASSWORD in /app/backend/.env
- Credentials live in /app/memory/test_credentials.md

## Endpoints
- POST /api/auth/login {email, password} -> sets httpOnly cookies + returns {user, access_token}
- POST /api/auth/logout -> clears cookies
- GET  /api/auth/me -> current admin (cookie or Bearer)
- POST /api/auth/refresh -> new access token from refresh cookie
- GET  /api/content -> {data: <site json or null>}
- PUT  /api/content {data: {...}} -> ADMIN ONLY, upserts singleton doc
- POST /api/contact {name, email, phone?, service?, message} -> public
- GET  /api/messages -> ADMIN ONLY, list of contact messages

## Steps
1. MongoDB check:
   mongosh "$MONGO_URL" --eval 'db.getSiblingDB(process.env.DB_NAME).users.find({role:"admin"}).pretty()'
   Verify bcrypt hash starts with $2b$.
2. Login (Bearer friendly: response body carries access_token):
   TOKEN=$(curl -s -X POST "$API_URL/api/auth/login" -H "Content-Type: application/json" \
     -d '{"email":"admin@studio.pl","password":"admin123"}' | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
3. Authenticated calls:
   curl -s "$API_URL/api/auth/me" -H "Authorization: Bearer $TOKEN"
   curl -s "$API_URL/api/messages" -H "Authorization: Bearer $TOKEN"
4. Content flow:
   curl -s "$API_URL/api/content"          # null data before first save
   curl -s -X PUT "$API_URL/api/content" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"data":{"siteName":"X"}}'
5. Negative: PUT /api/content without token -> 401; wrong password 5x -> 429 lockout.
