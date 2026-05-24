# Backend Authentication API

## Roles
- SUPER_ADMIN
- HOSPITAL
- BLOOD_BANK
- OXYGEN_SUPPLIER

## APIs
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/profile` (Bearer token required)

## Standard Response Format
Success:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {}
}
```

Error:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

## Example Payloads
Register:
```json
{
  "name": "City Hospital",
  "email": "hospital@example.com",
  "password": "StrongPass123",
  "role": "HOSPITAL"
}
```

Login:
```json
{
  "email": "hospital@example.com",
  "password": "StrongPass123"
}
```

Profile Response `data` includes user details:
```json
{
  "id": "...",
  "name": "City Hospital",
  "email": "hospital@example.com",
  "role": "HOSPITAL",
  "createdAt": "...",
  "updatedAt": "..."
}
```

## Notes
- Passwords are hashed with bcrypt.
- JWT access token is validated via `authenticate` middleware.
- Role checks are enforced with `authorizeRoles(...)` middleware.
- Structure is refresh-ready with access/refresh token utility methods.
