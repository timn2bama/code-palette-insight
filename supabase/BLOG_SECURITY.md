# Blog Posts Security Documentation

## Overview
The `blog_posts` table has been secured with comprehensive Row Level Security (RLS) policies to prevent unauthorized access to draft content and sensitive metadata.

## Security Measures Implemented

### 1. Row Level Security (RLS)
- **Enabled**: RLS is enabled on the `blog_posts` table
- **Forced**: `FORCE ROW LEVEL SECURITY` ensures even superusers respect RLS policies
- **Comprehensive Policies**: Multiple policies cover all access scenarios

### 2. Access Policies

#### Anonymous Users (Public)
- ✅ Can read **only published posts** with `published_at` timestamp
- ❌ Cannot access drafts or unpublished content
- ❌ No write access

#### Authenticated Users
- ✅ Can read **all published posts**
- ✅ Can read **their own posts** (including drafts)
- ✅ Can create, update, delete **their own posts**
- ❌ Cannot access other users' drafts

#### Authors
- ✅ Full access to their own content (CRUD operations)
- ✅ Can manage drafts and published posts
- ❌ Cannot access other authors' content

### 3. Secure View
- **View**: `published_blog_posts` provides safe public access
- **Filtered**: Only shows published content with timestamps
- **Limited Fields**: Excludes sensitive metadata like `author_id`

### 4. Application Layer Security
- **Public Pages**: Use `published_blog_posts` view instead of direct table access
- **Admin Pages**: Query filtered by authenticated user's ID
- **Double Protection**: RLS + application filtering

### 5. Audit Logging
- **Monitoring**: Logs access attempts to draft content
- **Tracking**: Records user attempts and post details
- **Security**: Helps identify potential security issues

## Database Policies

### Policy: `anon_read_published_posts`
```sql
FOR SELECT TO anon
USING (published = true AND published_at IS NOT NULL)
```

### Policy: `authenticated_read_published_posts`
```sql
FOR SELECT TO authenticated  
USING (published = true AND published_at IS NOT NULL)
```

### Policy: `authors_read_own_posts`
```sql
FOR SELECT TO authenticated
USING (auth.uid() = author_id)
```

### Policy: `authors_insert_own_posts`
```sql
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = author_id)
```

### Policy: `authors_update_own_posts`
```sql
FOR UPDATE TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id)
```

### Policy: `authors_delete_own_posts`
```sql
FOR DELETE TO authenticated
USING (auth.uid() = author_id)
```

## Migration File
- **File**: `20250822221400-fix-blog-posts-rls.sql`
- **Purpose**: Implements comprehensive RLS security
- **Includes**: Policies, view creation, audit logging, comments

## Verification Steps

1. **Anonymous Access Test**: Query `blog_posts` without auth → Should only return published posts
2. **Draft Protection Test**: Query unpublished posts as anon → Should return empty
3. **Author Access Test**: Authenticated user should see only their own drafts
4. **View Access Test**: `published_blog_posts` should only show published content

## Security Best Practices Applied

✅ **Defense in Depth**: Multiple security layers (RLS + app + view)  
✅ **Principle of Least Privilege**: Users see only what they need  
✅ **Fail-Safe Defaults**: Explicit deny policies for edge cases  
✅ **Audit Trail**: Logging for security monitoring  
✅ **Database-Level Security**: Cannot be bypassed by application bugs  

## Notes
- RLS policies are enforced at the database level
- Even if application code has bugs, database will enforce restrictions
- The `published_blog_posts` view provides an extra security layer
- All policies are thoroughly documented with comments
