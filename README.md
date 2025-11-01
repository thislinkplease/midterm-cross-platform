# Midterm Cross-Platform User Management App

A cross-platform mobile and web application built with **Expo (React Native)** and **Supabase**.  
This project demonstrates a complete user management system supporting authentication, profile editing, image upload, and admin-level control — running seamlessly on **Android, iOS, and Web**.

---

## 🚀 Overview

This application provides:
- Secure **email/password authentication** with Supabase.
- Role-based access (Admin vs. Normal User).
- **User CRUD** operations (create, read, update, delete).
- Profile photo upload using **Supabase Storage**.
- Integration with a **Supabase Edge Function** for privileged admin actions.
- Cross-platform support via Expo Router navigation.

---

## 🧰 Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | [Expo](https://expo.dev/) (React Native) |
| Navigation | [Expo Router](https://expo.github.io/router/docs) |
| Backend | [Supabase](https://supabase.com/) |
| Storage | Supabase Storage |
| Authentication | Supabase Auth |
| Server Functions | Supabase Edge Functions |
| Image Handling | Expo Image Picker, Expo File System |
| UI | React Native, Lucide Icons |
| Language | TypeScript |

---

## ⚙️ Features

### 👥 Authentication
- Register and login via Supabase Auth.
- Persistent session handling through `AuthProvider`.
- Role check via admin email (`admin@gmail.com`).

### 🧑 User Management
- Display all users (for admin).
- Edit or delete users with expandable user cards.
- Add new users through a secure Edge Function.

### 🧾 Profile Management
- Users can view and update their own profile.
- Upload and display profile pictures.
- Change username, email, or password securely.

### 🗂️ Supabase Integration
- Database table `users` with enforced Row Level Security.
- Public storage bucket `user-images` for avatars.
- Edge Function `admin-create-user` for server-side user creation.

---

## 🏗️ Project Structure

    app/
    ├── (auth)/ → Login & Signup screens
    ├── (tabs)/ → Admin views (Home, Profile, Edit User)
    ├── (user)/ → Normal user views (Profile)
    ├── _layout.tsx → Global layout with AuthProvider
    components/
    ├── SearchBar.tsx → Search users
    ├── UserCard.tsx → Display user info & actions
    ├── FAB.tsx → Floating Action Button
    lib/
    ├── supabase.ts → Supabase client initialization
    services/
    ├── userService.ts → Database + Storage interaction layer
    ├── auth.ts → Role checks (admin/user)

## 🧩 Supabase Setup

1. Create a new [Supabase](https://supabase.com/) project.
2. Create a table `users`:
   ```sql
   create table users (
     username text,
     email text primary key,
     password text,
     image text
   );
3. Enable Row Level Security (RLS) and create policies:

    - Admin can access all rows.

    - Users can view everyone but only modify their own.

4. Create a storage bucket named user-images.

    - Public read access.

    - Authenticated users can upload/delete.

5. Deploy the Edge Function admin-create-user:

    supabase functions deploy admin-create-user


## ⚡ Installation & Run

1. Clone the repository

    git clone https://github.com/thislinkplease/Midterm-Cross-Platform.git
    cd Midterm-Cross-Platform

2. Install dependencies

    npm install

3. Configure environment

    Add Supabase keys inside app.json (or use .env):

        "extra": {
        "EXPO_PUBLIC_SUPABASE_URL": "https://<your-project-id>.supabase.co",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "<your-anon-key>"
        }

4. Start development

    npm run start
    Then press:

        w for Web

        a for Android

        i for iOS

## 🧠 How It Works

1. Auth Flow

    - User logs in or signs up via Supabase Auth.

    - The session is stored and synced with the users table (upsertAuthUserToTable()).

2. Admin Flow

    - Admin logs in → redirected to (tabs) view.

    - Can see all users, add new ones through the Edge Function, and manage profiles.

3. Profile Flow

    - Regular user logs in → redirected to (user)/profile.

    - Can view/update profile and upload new avatar via Supabase Storage.

4. Image Upload

    - Uses expo-file-system.uploadAsync() to send files directly to Supabase Storage.

    - Works on both Android and iOS (no Blob dependency).

## 🔒 Security Notes

    - Service Role Key is used only inside the Edge Function (never on client).

    - Row Level Security (RLS) ensures each user can only modify their own data.

    - All storage uploads require authentication and are linked to user sessions.

## 🧑‍💻 Author
    - Developed by Kieran Trinh
    - Cross-platform mobile development using Expo + Supabase for the Midterm Project.