# TravelCRM Google Cloud Platform (GCP) Deployment Guide

This guide describes how to run the entire backend stack (PostgreSQL, Redis, Meilisearch, MinIO, n8n, CRM Backend) on a single **Google Compute Engine (GCE) VM** using **Docker Compose**.

By running everything on one instance, we can easily stay within your $300 GCP credit limit for up to a year, utilizing internal Docker networking and Caddy for automatic SSL certificates.

---

## Prerequisites

1. Active Google Cloud Console account with billing set up (using your $300 credit).
2. Access to your DNS manager (e.g., Hostinger, Cloudflare) for `imagicaholidays.com`.
3. A copy of your database dump (e.g., `crm_backup.sql`) if you wish to migrate existing data.

---

## Step 1: Create a VM Instance on GCP

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **Compute Engine** -> **VM instances** and click **Create Instance**.
3. Choose a name, e.g., `travelcrm-stack`.
4. Select a region near your target audience (e.g., `asia-south1` for India).
5. Under **Machine configuration**:
   - **Series**: `E2`
   - **Machine Type**: `e2-medium` (2 vCPUs, 4 GB Memory) — *Approx. $25/month*.
6. Under **Boot disk**:
   - Click **Change**.
   - **Operating System**: `Ubuntu`
   - **Version**: `Ubuntu 22.04 LTS` or `Ubuntu 24.04 LTS`.
   - **Size**: Change to `35 GB` (SSD Persistent Disk recommended for performance).
7. Under **Firewall**:
   - Check **Allow HTTP traffic**.
   - Check **Allow HTTPS traffic**.
8. Click **Create** at the bottom of the page.

---

## Step 2: Reserve a Static IP Address

By default, GCP VMs have ephemeral external IP addresses that change when the VM is restarted. We need to make this IP address static:

1. In the console, search for **VPC Network** -> **IP addresses**.
2. Find the IP address assigned to `travelcrm-stack`.
3. Under the **Type** column, click the dropdown and change it from **Ephemeral** to **Static**.
4. Name the IP address (e.g., `travelcrm-static-ip`) and save it.

---

## Step 3: Add Firewall Rules for HTTP/HTTPS

Ensure port `80` (HTTP) and `443` (HTTPS) are open:
1. Navigate to **VPC Network** -> **Firewall**.
2. Ensure there are active rules named `default-allow-http` and `default-allow-https` targeting your instance. If not, click **Create Firewall Rule**:
   - **Direction of traffic**: Ingress
   - **Action on match**: Allow
   - **Targets**: Specified target tags (add tag `http-server` and `https-server` to your VM) or All instances.
   - **Source IPv4 ranges**: `0.0.0.0/0`
   - **Protocols and ports**: TCP `80`, `443`.

---

## Step 4: Configure DNS Records

Go to your DNS manager (e.g., Hostinger, GoDaddy, or Cloudflare) and point the following subdomains to your VM's **Static External IP** using **A records**:

| Subdomain | Record Type | Value (Destination) | Purpose |
|---|---|---|---|
| `api.imagicaholidays.com` | A | `YOUR_VM_STATIC_IP` | CRM Backend API |
| `minio.imagicaholidays.com`| A | `YOUR_VM_STATIC_IP` | MinIO Dashboard |
| `s3.imagicaholidays.com`  | A | `YOUR_VM_STATIC_IP` | File Upload API Endpoint |
| `search.imagicaholidays.com`| A | `YOUR_VM_STATIC_IP` | Meilisearch Engine |
| `n8n.imagicaholidays.com` | A | `YOUR_VM_STATIC_IP` | n8n Automation Engine |

---

## Step 5: Install Docker and Docker Compose on the VM

SSH into your GCP VM (using the SSH button in the console, or `gcloud compute ssh`) and execute the following commands:

```bash
# Update Ubuntu package lists
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker and Docker Compose
sudo apt-get install -y docker.io docker-compose

# Ensure Docker starts automatically on system boot
sudo systemctl enable --now docker

# Add your user to the docker group to run command without 'sudo'
sudo usermod -aG docker $USER

# RESTART SSH SESSION: Log out of SSH and log back in to apply group changes
exit
```

---

## Step 6: Clone and Configure the Application

After logging back into your VM:

1. Clone your travel CRM Git repository:
   ```bash
   git clone <YOUR_GIT_REPOSITORY_URL> app
   cd app/deployment/gcp
   ```
2. Create your live production environment configuration file:
   ```bash
   cp .env.gcp.example .env
   nano .env
   ```
3. Edit `.env` to supply all credentials, keys (JWT secret, SMTP keys, Razorpay, etc.), and setup secure passwords. Save the file (in nano, press `Ctrl + O` to write, `Enter` to confirm, and `Ctrl + X` to exit).

4. Configure Caddy:
   Ensure the domains listed in your `Caddyfile` match your domains exactly. Caddy will use these to request Let's Encrypt certificates.

---

## Step 7: Launch the Application Stack

Run the stack in the background:
```bash
docker-compose up -d --build
```

You can verify that all containers are running successfully:
```bash
docker-compose ps
```

To view the live application logs:
```bash
docker-compose logs -f
```

---

## Step 8: Database & File Data Migration (Crucial)

To migrate your existing data from Railway to GCP:

### 1. Database (Postgres) Migration
If your Railway project is suspended, pay the balance temporarily to resume it. Once it's running:
1. **Export the Railway DB** (from your local machine or GCE VM):
   ```bash
   pg_dump "postgresql://postgres:<YOUR_RAILWAY_PASS>@<RAILWAY_HOST>:<PORT>/railway" -f crm_backup.sql
   ```
2. **Import into GCP VM DB**:
   Copy `crm_backup.sql` to your VM, then run:
   ```bash
   docker exec -i crm-postgres psql -U postgres -d railway < crm_backup.sql
   ```

### 2. Files (MinIO) Migration
If you have media uploads in MinIO that you want to move:
1. Access the old MinIO bucket and download your files.
2. Upload them to the new MinIO console hosted at `https://minio.imagicaholidays.com` under the `crm-backups` bucket.
