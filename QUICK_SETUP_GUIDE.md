# 🚀 Quick Setup Guide - EcoQuest

## ✅ What I've Done For You

1. **Fixed TypeScript errors** - All build errors resolved
2. **Fixed authentication flow** - School admins will now be created correctly
3. **Created .env.local template** - Ready for your Supabase credentials
4. **Fixed routing issues** - Proper redirects to admin dashboard

## 🔧 Next Steps (Required)

### Step 1: Set Up Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** and create a new project
3. **Wait for project to be ready** (takes 2-3 minutes)
4. **Go to Settings → API** in your Supabase dashboard
5. **Copy your credentials:**
   - Project URL (looks like: `https://abcdefghijklmnop.supabase.co`)
   - anon/public key (starts with `eyJ...`)

### Step 2: Update Environment File

Edit the `.env.local` file in your project root and replace the placeholder values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### Step 3: Set Up Database Schema

Run these commands in your terminal:

```bash
# Link to your Supabase project (replace with your project reference)
npx supabase link --project-ref YOUR_PROJECT_REF

# Push the database schema
npx supabase db push

# Or manually run the SQL in your Supabase dashboard:
# Copy the contents of create_tables_manually.sql and run it in SQL Editor
```

### Step 4: Restart Development Server

```bash
npm run dev
```

## 🧪 Test the Authentication Flow

1. **Go to your app** (usually http://localhost:5173)
2. **Click "Register Your School"**
3. **Sign in with email** (magic link)
4. **Fill out school registration form**
5. **Should redirect to school admin dashboard** ✅

## 🔍 Troubleshooting

### If school accounts still act as students:

1. **Check browser console** for errors
2. **Verify .env.local** has correct Supabase credentials
3. **Check Supabase dashboard** - ensure tables exist
4. **Look at Debug Data component** on home page

### If you see "Supabase not configured":

1. **Restart your dev server** after updating .env.local
2. **Check .env.local file** exists and has correct values
3. **Verify VITE_ prefix** in environment variable names

## 📊 Database Schema

The app expects these tables:
- `schools` - School information
- `user_profiles` - User authentication and roles
- `school_admins` - School administrator records
- `teachers` - Teacher records
- `classes` - Class information
- `students` - Student records
- `assignments` - Challenges and assignments
- `submissions` - Student submissions and scores
- `achievement_unlocks` - Student achievements

## 🎯 Expected User Flow

1. **School Admin**: Register school → Admin dashboard → Invite teachers
2. **Teacher**: Accept invitation → Teacher dashboard → Create classes → Invite students
3. **Student**: Join with class code → Student dashboard → Play games/learn

## 🆘 Need Help?

- Check the **Debug Data** component on the home page
- Look at browser console for error messages
- Verify Supabase project is active and accessible
- Ensure all environment variables are set correctly

---

**Once you complete these steps, your authentication flow will work perfectly!** 🎉
