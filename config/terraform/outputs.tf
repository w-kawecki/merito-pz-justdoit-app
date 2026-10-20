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
