Here’s a **one-click bash script** to automate steps 3–5 to **deploy an Angular app on Hostinger VPS using Nginx** (for **Ubuntu** VPS):

---

## ✅ Prerequisites:

* Angular app is already built (`ng build --configuration=production`)
* VPS is Ubuntu-based
* You have SSH access and can upload files
* Your domain (optional) points to your VPS IP

---

## 🛠️ Deployment Script

Save this script as `deploy-angular.sh` and run it on your VPS:

```bash
#!/bin/bash

# === CONFIGURATION ===
APP_NAME="angular-app"
APP_DIR="/var/www/$APP_NAME"
NGINX_CONF="/etc/nginx/sites-available/$APP_NAME"
DOMAIN="yourdomain.com"   # Leave blank if using only IP
PORT=80

# === 1. Create target directory ===
echo "📁 Creating app directory at $APP_DIR..."
sudo mkdir -p "$APP_DIR"
sudo chown -R $USER:$USER "$APP_DIR"

# === 2. Install Nginx if not installed ===
if ! command -v nginx &> /dev/null; then
  echo "🌐 Installing Nginx..."
  sudo apt update
  sudo apt install -y nginx
fi

# === 3. Set up Nginx config ===
echo "⚙️ Configuring Nginx..."
sudo tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen $PORT;
    server_name ${DOMAIN:-_};

    root $APP_DIR;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# Enable site
sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx configured. Upload your Angular build to: $APP_DIR"

# === 4. Suggest uploading files ===
echo "📤 Example to upload Angular files from your local machine:"
echo "scp -r dist/your-angular-app-name/* root@<vps-ip>:$APP_DIR"

# === 5. (Optional) Setup SSL ===
read -p "🔐 Do you want to enable SSL with Let's Encrypt for $DOMAIN? (y/n): " ssl_confirm
if [[ "$ssl_confirm" == "y" && -n "$DOMAIN" ]]; then
  sudo apt install -y certbot python3-certbot-nginx
  sudo certbot --nginx -d $DOMAIN
fi

echo "🚀 Done! Your Angular app will be live at http://${DOMAIN:-your-vps-ip}"
```

---

## 🧪 How to Use It

1. **Upload the script to VPS:**

   ```bash
   scp deploy-angular.sh root@<your-vps-ip>:/root/
   ```

2. **SSH into VPS:**

   ```bash
   ssh root@<your-vps-ip>
   ```

3. **Run the script:**

   ```bash
   chmod +x deploy-angular.sh
   ./deploy-angular.sh
   ```

4. **Upload your Angular build:**

   ```bash
   scp -r dist/your-angular-app-name/* root@<your-vps-ip>:/var/www/angular-app
   ```

5. **Visit in browser:**

   * `http://<your-vps-ip>` or `http://yourdomain.com`

---

Would you like me to generate a `.zip` of this script or customize it for multiple environments (e.g., staging + prod)?
