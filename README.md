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
