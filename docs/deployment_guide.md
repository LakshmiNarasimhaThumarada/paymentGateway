# Production Deployment Guide: PaySecure Portal

This guide provides step-by-step instructions on how to build and deploy the React frontend, Spring Boot backend, and MySQL database for production.

---

## Architecture Choices

In a production environment, you have three primary deployment architectures:

| Architecture | Best For | Description |
| :--- | :--- | :--- |
| **Option A: Decoupled Cloud Hosting** | Quick startups, low cost | Deploy the React frontend to **Vercel/Netlify** (static CDN) and the Spring Boot backend to **Render/Heroku/AWS Beanstalk**. |
| **Option B: VPS Server (Nginx)** | Full control, single instance | Deploy both on a single Linux VPS (DigitalOcean/AWS EC2) using **Nginx** as a reverse proxy and static server. |
| **Option C: Docker Containers** | Cloud-native, scalable | Containerize all services and deploy using **Docker Compose** or **Kubernetes**. |

---

## Prerequisites: Build the Applications

Before deploying, you must compile and package the production bundles.

### 1. Build the Backend (Spring Boot JAR)
Run this command inside the `backend` folder:
```bash
# If using maven wrapper
mvnw clean package -DskipTests
# Or if using global mvn
mvn clean package -DskipTests
```
* **Output:** Generates an executable JAR file at `backend/target/backend-0.0.1-SNAPSHOT.jar`.

### 2. Build the Frontend (React Static Assets)
Run these commands inside the `frontend` folder:
```bash
npm install
npm run build
```
* **Output:** Generates a `dist` folder containing optimized HTML, JS, and CSS static files.

---

## Option A: Decoupled Cloud Hosting (Vercel & Render)

This is the easiest and most cost-effective hosting model.

### 1. Deploy the MySQL Database
Use a managed database service like **AWS RDS (MySQL)**, **Aiven**, or **Tidb**:
- Note down your connection URL, database name, master username, and password.

### 2. Deploy the Spring Boot Backend (e.g., Render)
1. Log in to [Render](https://render.com) and create a new **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Runtime:** `Docker` (preferred if using Java 21) or `Java`.
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/backend-0.0.1-SNAPSHOT.jar`
4. Add the following **Environment Variables** in Render:
   - `SPRING_PROFILES_ACTIVE` = `mysql`
   - `SPRING_DATASOURCE_URL` = `jdbc:mysql://<your-database-host>:3306/<db-name>?useSSL=true`
   - `SPRING_DATASOURCE_USERNAME` = `<your-database-username>`
   - `SPRING_DATASOURCE_PASSWORD` = `<your-database-password>`
   - `SERVER_PORT` = `8081` (Render automatically detects ports or binds to `$PORT`)
5. Once deployed, Render will provide a public URL like `https://paysecure-backend.onrender.com`.

### 3. Deploy the React Frontend (e.g., Vercel)
Since we are deploying frontend and backend to different domains, you must configure CORS and direct API connections instead of the Vite proxy.
1. Create a `.env.production` file in your `frontend` folder:
   ```env
   VITE_API_BASE_URL=https://paysecure-backend.onrender.com
   ```
2. Update `frontend/src/services/api.ts` to use this base URL:
   ```typescript
   const api = axios.create({
     baseURL: import.meta.env.VITE_API_BASE_URL || '',
     headers: {
       'Content-Type': 'application/json',
     },
   })
   ```
3. Deploy to [Vercel](https://vercel.com) by connecting your Git repository and setting:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

---

## Option B: VPS Server Deployment (Nginx Reverse Proxy)

This setup uses a single Linux VM (Ubuntu) to host the database, Spring Boot, and static assets.

```
Incoming Request (port 80/443)
       │
       ▼
  Nginx Server
   ├── /api/ ──► Proxy to Spring Boot (port 8081)
   └── /*    ──► Serves React static files (dist)
```

### Step 1: Install Nginx, Java, and MySQL
Log in to your VPS terminal and install dependencies:
```bash
sudo apt update
sudo apt install nginx openjdk-21-jdk mysql-server -y
```

### Step 2: Configure MySQL and Seed Tables
Create the database and database user on the VPS:
```sql
CREATE DATABASE paysecure_db;
CREATE USER 'paysecure_admin'@'localhost' IDENTIFIED BY 'PaySecure@123';
GRANT ALL PRIVILEGES ON paysecure_db.* TO 'paysecure_admin'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Run the Spring Boot JAR as a Service
1. Upload `backend-0.0.1-SNAPSHOT.jar` to `/var/www/paysecure-backend/`.
2. Create a systemd service file `/etc/systemd/system/paysecure.service`:
   ```ini
   [Unit]
   Description=PaySecure Spring Boot Service
   After=syslog.target

   [Service]
   User=root
   ExecStart=/usr/bin/java -jar /var/www/paysecure-backend/backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=mysql
   SuccessExitStatus=143
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```
3. Start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable paysecure.service
   sudo systemctl start paysecure.service
   ```

### Step 4: Configure Nginx to Serve Frontend and Proxy Backend
1. Upload the React `dist` folder to `/var/www/paysecure-frontend/dist/`.
2. Edit `/etc/nginx/sites-available/default`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com; # Replace with your IP or Domain

       # Serve React static assets
       location / {
           root /var/www/paysecure-frontend/dist;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       # Proxy API requests to Spring Boot
       location /api/ {
           proxy_pass http://localhost:8081/api/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
3. Test and restart Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## Option C: Containerization (Docker Compose)

The cleanest way to package your app. Create a single `docker-compose.yml` to boot up MySQL, Spring Boot, and Nginx.

### 1. Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=mysql"]
```

### 2. Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
# Build stage
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production server stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Frontend Nginx configuration (`frontend/nginx.conf`)
```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8081/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Orchestration Config (`docker-compose.yml` in project root)
```yaml
version: '3.8'

services:
  database:
    image: mysql:8.0
    container_name: paysecure-db
    environment:
      MYSQL_DATABASE: paysecure_db
      MYSQL_USER: paysecure_admin
      MYSQL_PASSWORD: PaySecure@123
      MYSQL_ROOT_PASSWORD: rootpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  backend:
    build: ./backend
    container_name: paysecure-backend
    ports:
      - "8081:8081"
    depends_on:
      - database
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://database:3306/paysecure_db?createDatabaseIfNotExist=true&useSSL=false
      SPRING_DATASOURCE_USERNAME: paysecure_admin
      SPRING_DATASOURCE_PASSWORD: PaySecure@123

  frontend:
    build: ./frontend
    container_name: paysecure-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
      
volumes:
  mysql-data:
```

To run this compose environment:
```bash
docker-compose up --build -d
```
