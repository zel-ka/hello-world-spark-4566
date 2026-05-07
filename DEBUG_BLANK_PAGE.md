# Debugging Blank Page Issue

## 🔍 Step 1: Check Browser Console for Errors

1. **Open browser** → Press `F12` (or `Cmd+Option+I` on Mac)
2. **Click Console tab**
3. **Look for RED errors** (not warnings)
4. **Screenshot or copy the error message**

---

## ⚠️ Most Likely Issues

### Issue 1: "patients" table doesn't have `user_id` column
**Error message in console:** `column "user_id" does not exist`

**Cause:** Migration hasn't been run on Supabase

**Fix:** See "CRITICAL: Run Migrations" below

---

### Issue 2: Patient record doesn't exist for user
**Error message in console:** `No rows returned`

**Cause:** 
- Trigger `handle_new_user()` never ran when user was created
- User signed up BEFORE migrations were applied

**Fix:** See "CRITICAL: Run Migrations" below + re-signup if old account

---

### Issue 3: RLS Policy blocked query
**Error message in console:** `Policy violation` or `new row violates row-level security policy`

**Cause:** RLS policies not set up correctly

**Fix:** See "CRITICAL: Run Migrations" below

---

## 🚨 CRITICAL: Run Migrations ON Supabase (ONLY REAL FIX)

### Step 1: Open Supabase Dashboard
- Go to: https://app.supabase.com/projects
- **Login** with your account
- **Select project:** `health-compass` (ID: sfhiuxfkqisugljtosbz)

### Step 2: Navigate to SQL Editor
- Click **SQL Editor** in left sidebar
- Click **New Query** button

### Step 3: Copy Migration Script
- Open this file in VS Code: `SUPABASE_COMPLETE_MIGRATIONS.sql`
- Select ALL text (`Ctrl+A` / `Cmd+A`)
- Copy (`Ctrl+C` / `Cmd+C`)

### Step 4: Run in Supabase
- **Paste into SQL Editor** window
- **Click "RUN"** button (or press `Cmd+Enter`)
- ⏳ Wait 10-20 seconds
- ✅ Should show "SUCCESS" or green checkmark

### Step 5: Verify Tables
- Go to **Table Editor** (left sidebar)
- Click **patients** table
- Should see new columns: `user_id`, `patient_code`
- Should see rows with `user_id` populated

---

## ✅ After Migrations - Testing

### Test 1: New User Signup
1. Go to app: http://localhost:5173
2. **Signup tab**:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Full Name: `Test User`
   - Click **Signup**
3. **Confirm email** (check your email)
4. **Sign in again** with new credentials
5. **Should see:**
   - Auto-redirect to `/patient`
   - Patient dashboard with form to add vitals (NOT blank page)

### Test 2: Existing Patient Sign In
1. Sign in with **existing patient email**
2. **Should see:**
   - Auto-redirect to `/patient`
   - Patient dashboard with form (NOT blank page)

### Test 3: Check Browser Console
1. Open `F12` → **Console tab**
2. **Should see NO red errors**
3. Only blue info messages okay

---

## 🐛 If Still Blank After Migrations

**Follow this checklist:**

- [ ] Migrations ran without errors in Supabase
- [ ] User exists in `auth.users` (check **Authentication** tab in Supabase)
- [ ] Patient record exists in `patients` table with `user_id` linked
- [ ] User has role in `user_roles` table (should show "patient")
- [ ] Browser console shows NO red errors

**If ALL checked but still blank:**
- [ ] Try signing out completely
- [ ] Clear browser cache: `Ctrl+Shift+Delete` → Clear all
- [ ] Close and reopen browser
- [ ] Try incognito/private window

**Still stuck?**
- Run these SQL queries in Supabase SQL Editor to verify:
  ```sql
  -- Check if user exists
  SELECT id, email FROM auth.users LIMIT 5;
  
  -- Check if patient records exist
  SELECT id, user_id, patient_code FROM public.patients LIMIT 5;
  
  -- Check user roles
  SELECT user_id, role FROM public.user_roles LIMIT 5;
  ```

---

## 📋 Quick Reference

| Issue | Solution |
|-------|----------|
| Blank page + red console error | Run migrations on Supabase |
| "user_id" column not found | Run migrations |
| "No rows returned" error | Run migrations + re-signup |
| Policy violation error | Run migrations |
| Still blank after migrations | Clear cache + restart browser |

