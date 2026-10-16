# Deploy "Interior Design" to Vercel

## 1. Push this folder to GitHub
Create a new GitHub repo and upload all these files (not node_modules).

## 2. Import into Vercel
Go to vercel.com -> Add New Project -> import the repo.
Vercel auto-detects Vite/Nitro. Build command `vite build`, output auto-configured.

## 3. Add the AI key
Project Settings -> Environment Variables:
- Name: `LOVABLE_API_KEY`
- Value: your Lovable AI key
Add for Production, Preview and Development, then redeploy.

Without this key everything works except the AI buttons (Analyse quote / Draft message).

## 4. Deploy and open the URL
All images and fonts are bundled in the repo, so nothing breaks on Vercel.
Data is stored per browser (localStorage); a shared backend would be the next step for real cross-device use.
