# Middleware Documentation

## Tổng quan

Middleware này cung cấp authentication và authorization layer cho ứng dụng Next.js sử dụng Supabase Auth.

## Tính năng

### 🔐 Authentication
- Kiểm tra session người dùng với Supabase Auth
- Redirect tự động đến trang đăng nhập khi chưa xác thực
- Xử lý lỗi session một cách an toàn

### 👑 Admin Role Management
- Kiểm tra admin role thông qua email environment variable
- Route protection cho admin-only routes
- Bypass whitelist check cho admin users

### 📝 Whitelist Management
- Kiểm tra whitelist database để xác định quyền truy cập
- Tự động allow access cho admin users
- Xử lý lỗi database một cách graceful

### 🛡️ Security Features
- Input validation và sanitization
- Case-insensitive email comparison
- Secure error handling
- Rate limiting protection

## Cấu hình

### Environment Variables
```bash
NEXT_PUBLIC_ADMIN_EMAIL=your-admin@email.com
```

### Route Configuration
```typescript
const ROUTES_CONFIG = {
  PUBLIC: [
    '/',
    '/sign-in',
    '/sign-up', 
    '/api/auth',
    '/api/health'
  ],
  ADMIN: [
    '/admin',
    '/api/admin',
    '/api/users'
  ],
  WHITELIST: [
    '/dashboard',
    '/quizzes',
    '/api/quizzes'
  ]
}
```

## Logic Protection

### 1. Public Routes
- Không cần authentication
- Cho phép truy cập trực tiếp

### 2. Protected Routes
- Yêu cầu session hợp lệ
- Redirect đến `/sign-in` nếu chưa đăng nhập

### 3. Whitelist Routes
- Yêu cầu session hợp lệ
- Kiểm tra whitelist database
- Allow admin users mà không cần whitelist

### 4. Admin Routes
- Yêu cầu admin email
- Bypass tất cả checks khác

## User Context Headers

Middleware tự động thêm các headers:

```typescript
{
  'x-user-id': 'uuid',
  'x-user-email': 'user@email.com',
  'x-is-admin': 'true/false',
  'x-is-whitelisted': 'true/false',
  'x-auth-method': 'supabase'
}
```

## Error Responses

### API Routes
```json
{
  "error": {
    "message": "Authentication required",
    "code": "AUTH_REQUIRED",
    "status": 401
  }
}
```

### Page Routes
- Redirect responses cho protected pages
- Custom error pages cho unauthorized access

## Testing

### Unit Tests
```bash
npm run test middleware.test.ts
```

### Integration Tests
```bash
npm run test:middleware
```

### Manual Testing
1. Test protected routes không đăng nhập
2. Test admin routes với user thường
3. Test whitelist routes với user không trong whitelist
4. Test admin bypass functionality

## Performance Optimization

- Early return cho public routes
- Parallel whitelist checking
- Efficient route matching
- Minimal database queries

## Security Considerations

1. **Environment Variables**: Đảm bảo admin email được bảo vệ
2. **Database Security**: Whitelist table có proper RLS
3. **Error Handling**: Không leak sensitive information
4. **Session Validation**: Robust session checking

## Troubleshooting

### Common Issues

1. **Infinite Redirects**
   - Kiểm tra session state
   - Verify route configuration

2. **Admin Not Working**
   - Verify environment variable
   - Check email case sensitivity

3. **Whitelist Not Working**
   - Check database connection
   - Verify RLS policies

4. **Headers Missing**
   - Verify middleware execution
   - Check route matching

### Debug Mode
```typescript
// Thêm logging vào middleware để debug
console.log('Middleware check:', { pathname, user: session?.user?.email })
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database RLS policies set up
- [ ] Whitelist table populated
- [ ] Admin email configured
- [ ] Routes properly configured
- [ ] Error pages created
- [ ] Tests passing
- [ ] Performance optimized

## Future Enhancements

- [ ] Role-based permissions system
- [ ] Session refresh handling
- [ ] Rate limiting integration
- [ ] Audit logging
- [ ] Multi-tenant support