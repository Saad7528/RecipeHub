# RecipeHub — Recipe Sharing Platform

Welcome to **RecipeHub**, a full-stack recipe sharing web application built with **Next.js (App Router)**, **Tailwind CSS v4**, and **MongoDB**. Food enthusiasts can publish recipes, browse and search culinary creations, save favorites, purchase paid signature dishes, and upgrade to premium membership for unlimited uploads.

---

## 🌟 Key Features
- **Responsive Premium UI/UX**: Exquisite dark & light theme toggle, smooth page-transitions with Framer Motion, and celebratory payment triggers.
- **Role-Based Authentication**: Secure custom JWT session tokens stored in HttpOnly cookies, Google SSO options, and edge-native routing guards.
- **Interactive Recipe Details**: Likes counter, favorites bookmarker, and custom abuse-reports modals.
- **Stripe Payments Integration**: Checkout sessions supporting individual recipe purchases and Premium Account memberships ($19.99).
- **User Dashboard**: Statistics logs, recipes management, profile editor, and locked uploads checking.
- **Admin Dashboard**: Consolidated overview charts, block/unblock members manager, recipe moderator, reports panel, and Stripe transactions logs.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
- **Database**: MongoDB (Mongoose models)
- **Authentication**: JWT (HttpOnly cookies via Universal jose library)
- **Payments**: Stripe Checkout APIs (with development mock fallbacks)
- **Image Hosting**: ImgBB API uploads
- **Celebrations**: Canvas Confetti

---

## 💻 Setup & Installation

### 1. Clone the repository and install dependencies
```bash
git clone https://github.com/Saad7528/RecipeHub.git
cd recipehub
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory and append:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/recipehub
JWT_SECRET=your_jwt_secret_key_here
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key_here

# STRIPE CREDENTIALS (Optional - falls back to Mock local checkout if missing/blank)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# BASE URL (for production redirects)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Database Seeding (Crucial for Reviewers)
Start the development server:
```bash
npm run dev
```
Then, visit the seed route to automatically wipe and populate the database with default accounts and 6 sample recipes of varying difficulty, category, and pricing:
👉 **[http://localhost:3000/api/seed?clean=true](http://localhost:3000/api/seed?clean=true)**

---

## 🔐 Reviewer Login Credentials
Once the seeding script completes, use the following credentials to evaluate specific roles:

### 👑 Admin Credentials
- **Email**: `admin_chef@recipehub.com`
- **Password**: `Admin123`

### 🍳 Premium Chef Credentials
- **Email**: `chef_test@recipehub.com`
- **Password**: `User1234`

### 🥑 Standard Foodie Credentials
- **Email**: `foodie_test@recipehub.com`
- **Password**: `User1234`

---

## 🧪 Build and Lint Checks
Validate code correctness prior to production delivery:
- Run ESLint check: `npm run lint`
- Compile production bundle: `npm run build`
