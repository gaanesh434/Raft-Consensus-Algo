# 🚀 Deployment Guide

This guide covers various deployment options for the Raft Consensus System.

## 🌐 Frontend Deployment (Static Files)

### Netlify (Recommended)

**Current Live Demo:** https://unrivaled-rabanadas-f72813.netlify.app

1. **Automatic Deployment from Git**
   ```bash
   # Connect your GitHub repository to Netlify
   # Build command: npm run build:client
   # Publish directory: dist/client
   ```

2. **Manual Deployment**
   ```bash
   npm run build:client
   netlify deploy --prod --dir=dist/client
   ```

### Vercel

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configure vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/static-build",
         "config": {
           "distDir": "dist/client"
         }
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "/index.html"
       }
     ]
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### GitHub Pages

1. **Build configuration**
   ```yaml
   # .github/workflows/pages.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build:client
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist/client
   ```

## 🖥️ Backend Deployment

### Heroku

1. **Create Heroku app**
   ```bash
   heroku create your-raft-backend
   ```

2. **Configure environment**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set NPM_CONFIG_PRODUCTION=false
   ```

3. **Create Procfile**
   ```
   web: npm start
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

### Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy**
   ```bash
   railway login
   railway deploy
   ```

### Render

1. **Create render.yaml**
   ```yaml
   services:
     - type: web
       name: raft-backend
       env: node
       buildCommand: npm run build:server
       startCommand: npm start
       envVars:
         - key: NODE_ENV
           value: production
   ```

2. **Connect GitHub repository to Render**

### AWS EC2

1. **Launch EC2 instance**
   - Choose Ubuntu 20.04 LTS
   - Instance type: t3.medium or larger
   - Configure security group (port 5000, 80, 443)

2. **Install dependencies**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   ```

3. **Deploy application**
   ```bash
   # Clone repository
   git clone https://github.com/yourusername/raft-consensus-system.git
   cd raft-consensus-system
   
   # Install dependencies and build
   npm install
   npm run build
   
   # Start with PM2
   pm2 start dist/server.js --name raft-consensus
   pm2 startup
   pm2 save
   ```

## 🐳 Docker Deployment

### Single Container

```bash
# Build image
docker build -t raft-consensus .

# Run container
docker run -d \
  --name raft-consensus \
  -p 5000:5000 \
  -e NODE_ENV=production \
  raft-consensus
```

### Docker Compose (Recommended)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### Kubernetes Deployment

1. **Deployment manifest**
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: raft-consensus
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: raft-consensus
     template:
       metadata:
         labels:
           app: raft-consensus
       spec:
         containers:
         - name: raft-consensus
           image: raft-consensus:latest
           ports:
           - containerPort: 5000
           env:
           - name: NODE_ENV
             value: "production"
           resources:
             requests:
               memory: "512Mi"
               cpu: "250m"
             limits:
               memory: "1Gi"
               cpu: "500m"
   ```

2. **Service manifest**
   ```yaml
   apiVersion: v1
   kind: Service
   metadata:
     name: raft-consensus-service
   spec:
     selector:
       app: raft-consensus
     ports:
     - protocol: TCP
       port: 80
       targetPort: 5000
     type: LoadBalancer
   ```

3. **Deploy to cluster**
   ```bash
   kubectl apply -f deployment.yaml
   kubectl apply -f service.yaml
   ```

## 🔗 Full-Stack Deployment

### Option 1: Separate Deployments
- **Frontend**: Netlify/Vercel (Static hosting)
- **Backend**: Heroku/Railway/Render (Server hosting)
- **Configuration**: Update frontend to point to backend URL

### Option 2: Single Server
- **Platform**: AWS EC2/DigitalOcean/Linode
- **Setup**: Serve frontend files from Express.js
- **Benefits**: Single deployment, easier management

### Option 3: Containerized
- **Platform**: Docker + any cloud provider
- **Setup**: Multi-container with reverse proxy
- **Benefits**: Scalable, reproducible deployments

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Build process working locally
- [ ] Dependencies up to date
- [ ] Security vulnerabilities checked

### Frontend Deployment
- [ ] Build command: `npm run build:client`
- [ ] Publish directory: `dist/client`
- [ ] Redirects configured for SPA
- [ ] Custom domain configured (optional)

### Backend Deployment
- [ ] Start command: `npm start`
- [ ] Environment variables set
- [ ] Health check endpoint working
- [ ] CORS configured for frontend domain
- [ ] Database connected (if applicable)

### Post-Deployment
- [ ] Application accessible via URL
- [ ] All features working correctly
- [ ] Performance monitoring set up
- [ ] Error tracking configured
- [ ] Backup strategy in place

## 🔧 Environment Configuration

### Frontend Environment Variables
```bash
VITE_API_URL=https://your-backend-url.herokuapp.com
VITE_WS_URL=wss://your-backend-url.herokuapp.com
```

### Backend Environment Variables
```bash
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-frontend-url.netlify.app
```

## 📊 Monitoring & Maintenance

### Health Checks
```javascript
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Logging
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Performance Monitoring
- **Frontend**: Use tools like Lighthouse, Web Vitals
- **Backend**: Monitor response times, memory usage
- **Infrastructure**: Set up alerts for downtime

---

This deployment guide covers most production scenarios. Choose the option that best fits your infrastructure and requirements.