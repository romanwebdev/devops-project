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
