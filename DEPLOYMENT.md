# 🚀 Fuel.io Production Deployment Guide

Complete guide to deploy your multiplayer game to production with multiple hosting options.

---

## 📋 **Pre-Deployment Checklist**

Before deploying, ensure:
- ✅ Game works locally (`npm run dev`)
- ✅ Code is committed to Git
- ✅ GitHub repository is created (needed for most platforms)

---

## 🎯 **Option 1: Render.com (Easiest - FREE)**

### **Why Render?**
- ✅ **Free tier** (750 hours/month)
- ✅ Auto-deploy from GitHub
- ✅ Built-in SSL (HTTPS)
- ✅ Zero configuration needed

### **Step-by-Step Deployment:**

#### **1. Push to GitHub:**
```bash
cd /Users/arnav/iogame-1

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - Fuel.io MVP"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/fuel-io.git
git branch -M main
git push -u origin main
```

#### **2. Deploy on Render:**

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account
4. Select your `fuel-io` repository
5. Configure:
   ```
   Name: fuel-io
   Region: Oregon (or closest to you)
   Branch: main
   Runtime: Node
   Build Command: npm install && npm run build --workspace=client
   Start Command: npm run start --workspace=server
   Instance Type: Free
   ```
6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   ```
7. Click **"Create Web Service"**

#### **3. Wait for Deployment (5-10 minutes)**
- Render will build and deploy automatically
- You'll get a URL like: `https://fuel-io-xxxxx.onrender.com`

#### **4. Test Your Game:**
- Open the Render URL in 2+ browser tabs
- Play the game!

### **⚠️ Render Free Tier Notes:**
- Spins down after 15 minutes of inactivity
- First load after sleep takes ~30 seconds
- Perfect for demos and portfolio

---

## 🎯 **Option 2: Railway.app (Easy - $5/month)**

### **Why Railway?**
- ✅ No sleep/spin-down (always active)
- ✅ Better performance than free tiers
- ✅ Simple configuration
- ✅ $5/month for hobby projects

### **Step-by-Step Deployment:**

#### **1. Push to GitHub** (same as Option 1)

#### **2. Deploy on Railway:**

1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `fuel-io` repository
4. Railway auto-detects Node.js
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   ```
6. Click **"Deploy"**

#### **3. Configure Domain:**
- Railway gives you: `fuel-io-production.up.railway.app`
- Or add custom domain (optional)

#### **4. Test:**
- Click the generated URL
- Open in 2+ tabs and play!

### **💰 Railway Pricing:**
- $5/month base
- Free $5 credit each month
- Pay only for usage beyond free tier

---

## 🎯 **Option 3: DigitalOcean App Platform ($6-12/month)**

### **Why DigitalOcean?**
- ✅ Full control
- ✅ Scalable (can handle 100+ players)
- ✅ Production-grade infrastructure
- ✅ Easy to add database later

### **Step-by-Step Deployment:**

#### **1. Push to GitHub** (same as Option 1)

#### **2. Deploy on DigitalOcean:**

1. Go to [digitalocean.com](https://www.digitalocean.com/products/app-platform)
2. Sign up (get $200 credit for 60 days)
3. Click **"Create App"**
4. Connect GitHub repository
5. Configure:
   ```
   Name: fuel-io
   Type: Web Service
   Build Command: npm install && npm run build --workspace=client
   Run Command: npm run start --workspace=server
   HTTP Port: 3001
   Plan: Basic ($6/month)
   ```
6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   ```
7. Click **"Create Resources"**

#### **3. Get Your URL:**
- App will deploy to: `fuel-io-xxxxx.ondigitalocean.app`
- Add custom domain if desired

#### **4. Test:**
- Open URL in browser
- Start playing!

---

## 🎯 **Option 4: Self-Host with Docker (Advanced)**

For full control, deploy on your own VPS (DigitalOcean Droplet, AWS EC2, etc.)

### **Step 1: Build Docker Image**
```bash
cd /Users/arnav/iogame-1

# Build image
docker build -t fuel-io:latest .

# Test locally
docker run -p 3001:3001 -e NODE_ENV=production fuel-io:latest
```

### **Step 2: Deploy to VPS**

#### **DigitalOcean Droplet ($6/month):**
```bash
# On your VPS (Ubuntu):
sudo apt update
sudo apt install docker.io docker-compose -y

# Clone your repo
git clone https://github.com/YOUR_USERNAME/fuel-io.git
cd fuel-io

# Build and run
docker build -t fuel-io .
docker run -d -p 80:3001 --name fuel-io-game \
  -e NODE_ENV=production \
  --restart unless-stopped \
  fuel-io

# Check logs
docker logs -f fuel-io-game
```

#### **Access Game:**
- Get your server IP: `curl ifconfig.me`
- Open: `http://YOUR_IP/`
- For HTTPS, use Nginx + Let's Encrypt (see SSL section below)

---

## 🔒 **Adding SSL (HTTPS) - Optional but Recommended**

### **For Render/Railway/DigitalOcean App Platform:**
- SSL is automatic and free!

### **For Self-Hosted (Docker on VPS):**

#### **Using Caddy (Easiest):**
```bash
# Install Caddy
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Configure Caddy (replace YOUR_DOMAIN.com)
sudo nano /etc/caddy/Caddyfile
```

Add:
```
YOUR_DOMAIN.com {
    reverse_proxy localhost:3001
}
```

```bash
sudo systemctl restart caddy
```

Now access: `https://YOUR_DOMAIN.com` (automatic SSL!)

---

## 📊 **Post-Deployment: Monitoring**

### **Check Server Health:**
```bash
# Your deployed URL + /health
https://your-app.onrender.com/health

# Should return:
{
  "status": "ok",
  "players": 0,
  "uptime": 123.45
}
```

### **Monitor Logs:**

**Render:**
- Dashboard → Your Service → Logs tab

**Railway:**
- Project → Deployments → View Logs

**DigitalOcean:**
- App → Runtime Logs

**Docker:**
```bash
docker logs -f fuel-io-game
```

### **Watch Real-Time Activity:**
Look for:
```
Player connected: abc123
Player joined. Total players: 2
Match starting!
Player abc123 rammed xyz789 and stole 12.5 fuel
Match ended!
```

---

## 🎨 **Custom Domain Setup**

### **Buy a Domain:**
- Namecheap.com (~$10/year)
- Google Domains
- Cloudflare

### **Configure DNS:**

**For Render/Railway/DigitalOcean:**
1. In platform dashboard, click "Add Custom Domain"
2. Add your domain: `fuel.io` or `play.yourdomain.com`
3. Platform provides DNS records (CNAME or A record)
4. Add records in your domain registrar's DNS settings
5. Wait 10-60 minutes for propagation

Example DNS record:
```
Type: CNAME
Name: play (or @)
Value: fuel-io-xxxxx.onrender.com
TTL: 3600
```

---

## 🚀 **Performance Optimization for Production**

### **1. Enable Gzip Compression:**
Already added in `server/src/index.ts`

### **2. Add Rate Limiting:**
```bash
npm install express-rate-limit --workspace=server
```

Add to server:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

### **3. Enable WebSocket Compression:**
In `server/src/index.ts`:
```typescript
const io = new SocketIOServer(httpServer, {
  cors: { ... },
  perMessageDeflate: true, // Enable compression
});
```

---

## 📈 **Scaling Beyond MVP**

### **When you get 100+ concurrent players:**

#### **1. Add Redis for Multi-Server Support:**
```bash
# Add Redis
npm install redis ioredis @socket.io/redis-adapter --workspace=server
```

#### **2. Horizontal Scaling:**
- Deploy multiple server instances
- Use Redis pub/sub to sync game state
- Load balancer distributes players

#### **3. Database for Persistence:**
```bash
# Add PostgreSQL
npm install @prisma/client prisma --workspace=server
```

Store:
- User accounts
- Match history
- Leaderboards
- Player statistics

---

## 🐛 **Troubleshooting Deployment Issues**

### **Build Fails:**
```bash
# Check Node version
node --version  # Should be 20+

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build --workspace=client
```

### **WebSocket Connection Fails:**
- Check CORS settings in `server/src/index.ts`
- Ensure CLIENT_URL environment variable matches your frontend URL
- Check firewall allows WebSocket connections

### **Game Loads but Players Can't Connect:**
- Verify Socket.IO URL in client matches server URL
- Check browser console (F12) for errors
- Test health endpoint: `https://your-app.com/health`

### **Slow Performance:**
- Upgrade server plan (more CPU/RAM)
- Enable gzip compression
- Optimize tick rate if needed (currently 60Hz)

---

## ✅ **Deployment Checklist**

Before going live:
- [ ] Game works perfectly locally
- [ ] Code pushed to GitHub
- [ ] Environment variables configured
- [ ] SSL/HTTPS enabled
- [ ] Custom domain setup (optional)
- [ ] Health endpoint responding
- [ ] Tested with 2+ players
- [ ] Logs show no errors
- [ ] Monitor resource usage

---

## 🎉 **You're Live!**

Share your game:
```
🎮 Play Fuel.io: https://your-game-url.com

Controls:
W/↑ - Accelerate
S/↓ - Brake
A/← - Turn Left
D/→ - Turn Right

Survive by managing fuel, collecting pickups, and ramming opponents!
```

---

## 📚 **Next Steps:**

1. **Add Analytics:** Google Analytics or Plausible
2. **Error Tracking:** Sentry for crash reports
3. **User Accounts:** Add authentication (JWT/OAuth)
4. **Leaderboards:** Track top players
5. **Multiple Arenas:** Let players choose game modes
6. **Mobile Support:** Add touch controls

---

**Questions? Issues?**
- Check server logs
- Test `/health` endpoint
- Verify environment variables
- Check WebSocket connection in browser DevTools

Good luck with your deployment! 🚀
