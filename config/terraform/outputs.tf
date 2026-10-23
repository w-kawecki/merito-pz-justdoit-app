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
