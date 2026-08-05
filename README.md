# DevOps Project

This project is a hands-on journey through common DevOps practices. I will gradually explore tools and workflows such as Terraform, Ansible, GitHub Actions, CI/CD, automation, and infrastructure management.

The main goal is to learn how modern DevOps workflows help build, deploy, and maintain applications in a more reliable and repeatable way.

## Project Goals

- Learn foundational DevOps concepts and tools
- Practice infrastructure automation with code
- Improve understanding of deployment and configuration workflows
- Build a practical project that grows over time

## Steps

### Step 1: Infrastructure provisioning with Terraform

I used Terraform to create an EC2 instance on AWS and set up a new security group with SSH and HTTP access. This was an introduction to infrastructure as code and showed how cloud resources can be provisioned in a repeatable and structured way.

**Git Branch**: `provisioning-with-terraform`

[Link to the task](https://roadmap.sh/projects/iac-digitalocean)

---

### Step 2: Configuration management with Ansible

I used Ansible to configure the EC2 instance provisioned by Terraform, writing a `setup.yml` playbook with four roles: `base` (server updates, common utilities, fail2ban), `ssh` (adds a given public key to the server), `nginx` (installs and starts the web server), and `app` (uploads and extracts a static website tarball into the webroot). Each role is tagged so it can be run independently or as part of the full sequence. This introduced role-based playbook structure, idempotent task design, and separating infrastructure provisioning from server configuration.

**Git Branch**: `configuration-management-with-ansible`

[Link to the task](https://roadmap.sh/projects/configuration-management)

---

### Step 3: Converting to a Node.js service and automating deployment with GitHub Actions

I extended the Ansible setup to replace the static HTML/CSS site with a Node.js service and automated its deployment with GitHub Actions. Added a `nodejs` role (installs Node.js 20.x and npm via NodeSource) and rewrote the `app` role to stop and remove Nginx, clone the application repository (a minimal Express app with a single `/` route returning "Hello, world!"), install dependencies with npm, and run the app as a `systemd` service using `AmbientCapabilities=CAP_NET_BIND_SERVICE` so it can bind directly to port 80 without running as root. Both roles are tagged `app` and wired into a new `node_service.yml` playbook, runnable independently of `setup.yml`. I then wrote a GitHub Actions workflow that runs this playbook directly from CI on push to `main` or manual trigger, reconstructing the SSH key and inventory file from GitHub Actions secrets rather than committing real host details to the repo. This introduced systemd unit templating, Linux capability-based privilege management, and secrets-based CI/CD for infrastructure automation.

**Git Branch**: `node-service+github-actions`

[Link to the task](https://roadmap.sh/projects/nodejs-service-deployment)

---

### Step 4: Dockerizing the service and deploying via GitHub Container Registry

I extended the Node.js service with a Basic Auth-protected `/secret` route (reading `SECRET_MESSAGE`, `USERNAME`, and `PASSWORD` from environment variables) and containerized it with a `Dockerfile`, excluding the `.env` file from the image via `.dockerignore`. On the infrastructure side, I added a `docker` role to install Docker Engine on the existing EC2 instance and reworked the `app` role to retire the previous systemd-managed Node process in favor of pulling and running the containerized app, using the `community.docker` Ansible collection to authenticate with GitHub Container Registry, pull the image, template a runtime `.env` file, and run the container with a restart policy. Updated the GitHub Actions workflow to build the Docker image, push it to `ghcr.io` using the built-in `GITHUB_TOKEN`, then invoke the same Ansible pipeline with sensitive values (registry token, secret message, Basic Auth credentials) passed as `--extra-vars` rather than stored in the repo. This introduced multi-stage CI/CD (build-and-push followed by deploy), container registry authentication, and reusing an existing Ansible pipeline to manage a fundamentally different deployment artifact (a container image instead of a cloned application directory).

**Git Branch**: `dockerized-service`

[Link to the task](https://roadmap.sh/projects/dockerized-service-deployment)

---

### Step 5: Building a Todo API with MongoDB and deploying via Docker Compose

I extended the same Node.js app with a full CRUD Todo API (`GET/POST/PUT/DELETE /todos`, `GET /todos/:id`), backed by MongoDB through Mongoose, keeping the existing `/` and `/secret` routes intact. Locally, a `docker-compose.yml` spins up the API alongside a MongoDB container with a named volume for persistent storage, so todo data survives container restarts. For production, I extended the `docker` Ansible role to install the Docker Compose plugin, and rewrote the `app` role to deploy a templated production `docker-compose.yml` (pulling the pre-built API image instead of building on the server) alongside the same MongoDB service, replacing the previous standalone-container deployment. The GitHub Actions workflow now builds and pushes the image to Docker Hub instead of GHCR, then runs the same Ansible pipeline to pull and restart the stack with `docker compose`. This introduced multi-container orchestration with Docker Compose, persistent data volumes across deployments, and switching container registries within an already-established CI/CD pipeline.

**Git Branch**: `multi-container-application`

[Link to the task](https://roadmap.sh/projects/multi-container-service)

---

### Step 6: Scheduled MongoDB backups to S3

I set up automated backups of the MongoDB data running on the EC2 instance, using a cron job on the server rather than a scheduled GitHub Actions workflow, since the database already lives there and a local cron avoids round-tripping through CI just to trigger a remote action. Added a `backup` Ansible role that installs AWS CLI v2 (Ubuntu's default repos don't ship a usable `awscli` package, so it downloads and installs the official AWS binary instead), deploys AWS credentials for a dedicated least-privilege IAM user scoped to a single S3 bucket, and templates a backup script that runs `mongodump` inside the `mongo` container, copies the dump out to the host, tars it, uploads it to S3, and prunes old local tarballs while leaving the full history in S3. The role schedules this via Ansible's `cron` module to run every 12 hours. I originally planned to use Cloudflare R2 as the task suggests, but switched to AWS S3 — S3's API is functionally equivalent for this use case. This introduced running commands inside a live Docker container from a host-level script, scoped IAM permissions for automation, and server-side scheduled tasks as an alternative to CI-triggered automation.

**Git Branch**: `automated-db-backups`

[Link to the task](https://roadmap.sh/projects/automated-backups)

---

### Step 7: Blue-green deployment with Nginx

I restructured the deployment to support blue-green releases with zero downtime. Introduced an Nginx reverse proxy as the sole entry point on port 80, sitting in front of two identical API containers (`api_blue` and `api_green`) that are no longer exposed to the host directly, both running continuously with only one receiving live traffic at a time via Nginx's upstream config. Added a dedicated `/health` endpoint to the app, and wrote a `deploy-blue-green.sh` script that deploys the new image into whichever container is currently idle, polls its `/health` endpoint until it responds successfully, then rewrites the Nginx upstream and issues a graceful `nginx -s reload` to cut traffic over atomically — aborting before any traffic switch if the health check fails. The previously active container is left running untouched after a successful switch, making rollback as simple as re-running the deploy script to flip back. I also split the deployment pipeline: Ansible now only runs for infrastructure/template changes (Nginx config, compose structure, the switch script itself), while routine code deploys use `appleboy/ssh-action` to SSH in and trigger the switch script directly, rather than re-running the full playbook on every push. This introduced reverse-proxy-based traffic control, health-check-gated deployments, atomic zero-downtime cutovers, and separating infrastructure provisioning from routine application deploys within the same CI/CD pipeline.

**Git Branch**: `blue-green-deployment`

[Link to the task](https://roadmap.sh/projects/blue-green-deployment)
