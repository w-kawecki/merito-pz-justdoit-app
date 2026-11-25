variable "subscription_id" {
  description = "ID subskrypcji Azure"
  type        = string
}

variable "project_name" {
  description = "Nazwa projektu używana jako prefiks zasobów"
  type        = string
  default     = "justdoit"
}

variable "location" {
  description = "Region Azure"
  type        = string
  default     = "swedencentral"
}

variable "vnet_cidr" {
  description = "Pula adresowa głównej sieci VNet"
  type        = list(string)
  default     = ["10.0.0.0/16"]
}

variable "subnet_web_cidr" {
  description = "Pula adresowa dla Public Web Subnet"
  type        = list(string)
  default     = ["10.0.1.0/24"]
}

variable "subnet_app_cidr" {
  description = "Pula adresowa dla Private App Subnet"
  type        = list(string)
  default     = ["10.0.2.0/24"]
}

variable "subnet_db_cidr" {
  description = "Pula adresowa dla Private DB Subnet"
  type        = list(string)
  default     = ["10.0.3.0/24"]
}

variable "db_admin_login" {
  description = "Login administratora bazy PostgreSQL"
  type        = string
  default     = "justdoitadmin"
}

variable "db_admin_password" {
  description = "Hasło administratora bazy PostgreSQL"
  type        = string
  sensitive   = true
}

variable "github_repo" {
  description = "Nazwa repozytorium GitHub (właściciel/repo)"
  type        = string
  default     = "w-kawecki/merito-pz-justdoit-app"
}
