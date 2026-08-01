variable "instance_name" {
  description = "Value of the EC2 instance's Name tag."
  type        = string
  default     = "devops-project"
}

variable "instance_type" {
  description = "The EC2 instance's type."
  type        = string
  default     = "t3.small"
}

variable "my_ip" {
  description = "Your IP for SSH access"
  type        = string
}
