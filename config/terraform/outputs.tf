output "vnet_id" {
  description = "ID utworzonej sieci VNet"
  value       = azurerm_virtual_network.vnet.id
}

output "subnet_web_id" {
  description = "ID podsieci Public Web"
  value       = azurerm_subnet.web.id
}

output "subnet_app_id" {
  description = "ID podsieci Private App"
  value       = azurerm_subnet.app.id
}

output "subnet_db_id" {
  description = "ID podsieci Private DB"
  value       = azurerm_subnet.db.id
}

output "postgres_fqdn" {
  description = "Prywatny adres FQDN serwera PostgreSQL"
  value       = azurerm_postgresql_flexible_server.postgres.fqdn
}

output "postgres_database_name" {
  description = "Nazwa utworzonej bazy danych"
  value       = azurerm_postgresql_flexible_server_database.app_db.name
}

output "azure_client_id" {
  description = "Client ID tożsamości OIDC dla GitHub Actions"
  value       = azurerm_user_assigned_identity.github_cd.client_id
}

output "azure_tenant_id" {
  description = "Tenant ID subskrypcji Azure"
  value       = data.azurerm_client_config.current.tenant_id
}

output "azure_subscription_id" {
  description = "Subscription ID subskrypcji Azure"
  value       = data.azurerm_client_config.current.subscription_id
}

output "backend_app_name" {
  description = "Nazwa usługi Azure App Service dla backendu"
  value       = azurerm_linux_web_app.backend.name
}

output "backend_url" {
  description = "Publiczny adres URL warstwy App (Backend API)"
  value       = "https://${azurerm_linux_web_app.backend.default_hostname}"
}

output "frontend_storage_account" {
  description = "Nazwa konta Storage dla warstwy Web"
  value       = azurerm_storage_account.web.name
}

output "frontend_url" {
  description = "Publiczny adres URL warstwy Web (Frontend)"
  value       = azurerm_storage_account.web.primary_web_endpoint
}
