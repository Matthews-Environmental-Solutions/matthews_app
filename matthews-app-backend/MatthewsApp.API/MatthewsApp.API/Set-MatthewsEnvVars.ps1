# Run PowerShell as Administrator

# Define environment variables
$envVars = @{
    "MatthewsCaseApiDBConnectionString" = "Server=LAPTOP-Branislav;Database=MatthewsAppDB;User Id=sa;Password=ComData21;Encrypt=False;TrustServerCertificate=true"
    "MatthewsCaseApiOAuthPassword"      = "mv)AlkS2"
    "MatthewsCaseApiOAuthUsername"      = "branislav@comdata.rs"
}

# Set system environment variables
foreach ($key in $envVars.Keys) {
    [System.Environment]::SetEnvironmentVariable($key, $envVars[$key], [System.EnvironmentVariableTarget]::Machine)
    Write-Host "Set system environment variable: $key"
}
