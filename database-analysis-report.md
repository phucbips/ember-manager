# Báo Cáo Phân Tích Database Schema - Ember Manager System

**Ngày phân tích:** 2025-11-05  
**Hệ thống:** Ember Manager - Next.js Application với Supabase Database  
**Phiên bản database:** 2 migrations (001, 002)

## 📋 Tổng Quan Database Structure

Hệ thống Ember Manager sử dụng **Supabase** làm database chính với kiến trúc phân tầng:
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Clerk (external auth service)
- **ORM/Client:** Supabase JavaScript Client
- **Framework:** Next.js API Routes

## 🔍 1. User Models và Relationships

### 1.1 Core User Tables

#### `auth.users` (Supabase Built-in)
```sql
- id: UUID (Primary Key)
- email: TEXT
- raw_user_meta_data: JSONB
- created_at, updated_at: TIMESTAMP
```

#### `users` (Custom User Profile)
```sql
- id: UUID (PK, FK → auth.users)
- email: TEXT (UK)
- role: user_role (admin/moderator/user/guest)
- status: user_status (active/inactive/suspended/pending)
- first_name, last_name, avatar_url: TEXT
- last_login_at: TIMESTAMP
- login_count: INTEGER
- created_at, updated_at: TIMESTAMP
- created_by, updated_by: UUID (FK → users)
```

### 1.2 User Relationship Analysis

**Strengths:**
- ✅ Clean one-to-one relationship giữa `auth.users` và `users`
- ✅ Self-referencing relationships cho audit trail (created_by, updated_by)
- ✅ Comprehensive user profile data
- ✅ Proper foreign key constraints với CASCADE delete

**Issues Found:**
- ⚠️ `owner_id` trong bảng `quizzes` store Clerk user ID as TEXT thay vì UUID reference
- ⚠️ Mix giữa Supabase auth và legacy whitelist system

## 🛡️ 2. Role-Based Permissions Structure

### 2.1 Permission System Design

#### `role_permissions` Table
```sql
- id: UUID (PK)
- role: user_role (ENUM)
- resource: TEXT (quizzes, users, admin)
- action: TEXT (read, write, delete, admin)
- is_allowed: BOOLEAN
- created_at: TIMESTAMP
```

#### Predefined Roles
```typescript
admin: Full access to all resources
moderator: Read/write quizzes, read users  
user: Read/write quizzes, limited user access
guest: Read-only quizzes
```

### 2.2 Permission Implementation

**Strengths:**
- ✅ Granular permission system với resource-action matrix
- ✅ Database-level permission checking function (`check_user_permission`)
- ✅ Role-based access control (RBAC) pattern
- ✅ Caching layer cho performance (adminCache)

**Issues Found:**
- ⚠️ Permission system chưa được integrate đầy đủ với RLS policies
- ⚠️ Some API endpoints still use old whitelist checking logic
- ⚠️ Inconsistent permission checking between old và new systems

## 📝 3. Quiz/Content Management Models

### 3.1 Quiz Content Structure

#### `quizzes` Table
```sql
- id: UUID (PK)
- title: TEXT
- embed_code: TEXT (HTML iframe/script)
- quiz_url: TEXT (Source URL)
- created_at: TIMESTAMP
- owner_id: TEXT (Clerk user ID - NOT UUID FK)
- owner_email: TEXT (Denormalized, optional)
```

### 3.2 Quiz Management Features

**Strengths:**
- ✅ Flexible embed code support (iframe, script, etc.)
- ✅ Source URL extraction và validation
- ✅ Proper timestamps và audit trail
- ✅ Owner tracking cho content management

**Issues Found:**
- ⚠️ `owner_id` should be UUID FK to users table, not TEXT
- ⚠️ Missing content metadata (description, tags, category)
- ⚠️ No version control cho embed code changes
- ⚠️ Missing content approval workflow

**Missing Tables:**
```sql
-- Recommended additions:
quiz_categories (id, name, description, created_at)
quiz_tags (id, name, created_at)
quiz_metadata (quiz_id, description, tags, category_id, visibility)
quiz_analytics (quiz_id, views, shares, avg_time_spent)
```

## 🔐 4. Session Management

### 4.1 Session Tracking

#### `user_sessions` Table
```sql
- id: UUID (PK)
- user_id: UUID (FK → users)
- session_token: TEXT (UK)
- device_info: JSONB
- ip_address: INET
- last_activity: TIMESTAMP
- expires_at: TIMESTAMP
- created_at: TIMESTAMP
```

### 4.2 Session Features

**Strengths:**
- ✅ Comprehensive session tracking
- ✅ Device information và IP logging
- ✅ Automatic expiration handling
- ✅ Login counting và last activity tracking

**Issues Found:**
- ⚠️ Session management scattered across multiple services
- ⚠️ No cleanup mechanism cho expired sessions
- ⚠️ Missing concurrent session limits
- ⚠️ No session revocation functionality

**Missing Session Features:**
```sql
-- Recommended additions:
session_cleanup_schedule (automatic cleanup)
concurrent_sessions_limit (user_settings)
session_revocation_list (revoked_tokens)
```

## 🔍 5. Missing Table Definitions & Incomplete Schemas

### 5.1 Whitelist System (Legacy)

#### `whitelist` Table
```sql
- email: TEXT (PK)
- added_at: TIMESTAMP
- domain: TEXT (optional)
- owner_id: TEXT (optional)
```

**Status:** ✅ Migration script exists nhưng table vẫn còn trong database
**Migration Note:** `002_user_roles_system.sql` có code để migrate whitelist → users nhưng whitelist table chưa được drop

### 5.2 Missing Critical Tables

#### User Preferences System
```sql
user_preferences:
- id: UUID (PK)
- user_id: UUID (FK)
- preference_key: TEXT
- preference_value: JSONB
- created_at, updated_at: TIMESTAMP
```
**Status:** ✅ Table exists với proper RLS policies

#### Activity Logging (Missing)
```sql
user_activities:
- id: UUID (PK)
- user_id: UUID (FK)
- action: TEXT
- resource_type: TEXT
- resource_id: TEXT
- metadata: JSONB
- ip_address: INET
- created_at: TIMESTAMP
```

#### Content Moderation (Missing)
```sql
content_moderation:
- id: UUID (PK)
- quiz_id: UUID (FK)
- moderator_id: UUID (FK)
- status: moderation_status
- reason: TEXT
- reviewed_at: TIMESTAMP
- created_at: TIMESTAMP
```

### 5.3 Audit Trail Issues

**Current State:**
- ✅ Basic timestamps trong tất cả tables
- ✅ Created_by, updated_by references
- ✅ Automatic trigger functions

**Missing Audit Features:**
- ⚠️ No comprehensive activity logging
- ⚠️ No content change history
- ⚠️ No permission change audit trail
- ⚠️ No data retention policies

## 🔧 6. Schema Consistency Issues

### 6.1 Naming Conventions
**Issues Found:**
- ⚠️ Mixed naming: `user_id` vs `owner_id` (consistency needed)
- ⚠️ Some columns use TEXT for IDs thay vì UUID
- ⚠️ Inconsistent timestamp field names

### 6.2 Data Type Mismatches
```sql
-- Current issues:
owner_id: TEXT (should be UUID)
owner_email: TEXT (redundant, can be derived)
```

### 6.3 Index Strategy
**Existing Indexes:**
```sql
✅ idx_quizzes_owner_id
✅ idx_quizzes_created_at  
✅ idx_users_email
✅ idx_users_role
✅ idx_user_sessions_user_id
```

**Missing Indexes:**
```sql
-- Recommended additions:
CREATE INDEX idx_quizzes_owner_email ON quizzes(owner_email);
CREATE INDEX idx_users_last_login ON users(last_login_at);
CREATE INDEX idx_user_preferences_user_key ON user_preferences(user_id, preference_key);
CREATE INDEX idx_role_permissions_resource_action ON role_permissions(resource, action);
```

## 📊 7. RLS (Row Level Security) Analysis

### 7.1 RLS Policies Status

#### Tables với RLS Enabled ✅
- `users` - Comprehensive policies
- `user_sessions` - User-specific access
- `role_permissions` - Public read access
- `user_preferences` - User-specific access
- `quizzes` - Mixed old/new policies
- `whitelist` - Legacy policies

#### RLS Policy Quality
**Strengths:**
- ✅ Granular access control
- ✅ Admin overrides
- ✅ User-specific policies
- ✅ Proper authentication checks

**Issues:**
- ⚠️ Inconsistent policies giữa old và new systems
- ⚠️ Some policies reference deprecated whitelist table
- ⚠️ No policy cho content moderation

## 🚀 8. Recommendations

### 8.1 Immediate Actions
1. **Fix Foreign Key References**
   - Update `quizzes.owner_id` to be proper UUID FK
   - Remove redundant `owner_email` field

2. **Complete Migration**
   - Execute whitelist → users migration
   - Drop deprecated `whitelist` table
   - Update API endpoints to use new permission system

3. **Add Missing Tables**
   - Implement user activity logging
   - Add content moderation workflow
   - Create analytics tracking

### 8.2 Performance Optimizations
1. **Index Optimization**
   - Add missing composite indexes
   - Optimize for common query patterns
   - Consider partitioning cho large tables

2. **Caching Strategy**
   - Expand adminCache usage
   - Add Redis cache layer cho permissions
   - Implement query result caching

### 8.3 Security Enhancements
1. **Session Security**
   - Add concurrent session limits
   - Implement session revocation
   - Add 2FA support

2. **Audit Trail**
   - Comprehensive activity logging
   - Data change tracking
   - Compliance reporting

### 8.4 Data Integrity
1. **Constraints**
   - Add CHECK constraints cho enum values
   - Add data validation triggers
   - Implement soft delete patterns

2. **Backup & Recovery**
   - Automated backup strategy
   - Point-in-time recovery
   - Data archival policies

## 📈 9. Migration Priority Matrix

| Priority | Task | Impact | Effort |
|----------|------|---------|---------|
| 🔴 Critical | Fix quizzes.owner_id FK | High | Low |
| 🔴 Critical | Complete whitelist migration | High | Medium |
| 🟡 High | Add activity logging | Medium | Medium |
| 🟡 High | Permission system integration | High | High |
| 🟢 Medium | Add content moderation | Low | High |
| 🟢 Low | Analytics table | Low | Medium |

## 🎯 10. Conclusion

Database schema có solid foundation với proper relationships và RLS policies. Tuy nhiên, cần addressing inconsistencies giữa old và new systems, complete migration từ whitelist sang role-based system, và add missing audit/analytics features.

**Overall Assessment:** 🟡 Good foundation with critical gaps to address

**Next Steps:** 
1. Complete migration 002
2. Fix foreign key references
3. Implement missing audit trail
4. Update API endpoints cho consistency

---
*Báo cáo được tạo tự động bởi Database Analysis Tool*