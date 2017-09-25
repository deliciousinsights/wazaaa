#!/bin/bash
#
# DEPENDENCY: [jq](https://stedolan.github.io/jq/) (CLI JSON procressor)

# Variables

location='WestEurope'
RGname='wazaaaRG'
SPname='wazaaaSP'
runtime='node|8.2'
SPSKU='B3'
siteName='wazaaa'
cosmosDBName='wazaaa'
mongoDBKeyName='MONGODB_URI'

# On we go!

echo 'Creating resource group'
az group create --name "$RGname" --location "$location"

echo 'Launching async creation of CosmosDB instance'
az cosmosdb create --name "$cosmosDBName" --resource-group "$RGname" --kind MongoDB &
cosmosdbAsync_pid=$!

echo 'Creating Azure App Service Service Plan'
az appservice plan create --name "$SPname" --resource-group "$RGname" --is-linux --sku "$SPSKU"

echo 'Creating Web App'
az webapp create --name "$siteName" --resource-group "$RGname" --plan "$SPname" --runtime "$runtime" --deployment-local-git

echo 'Configuring Docker log'
az webapp log config --name "$siteName" --resource-group "$RGname" --web-server-logging filesystem

echo 'Configuring Git remote'
read gitUserName gitUserPassword <<< $(az webapp deployment list-publishing-profiles --name "$siteName" --resource-group "$RGname" | jq '.[0].userName, .[0].userPWD' -r)
gitURL="https://${gitUserName}:${gitUserPassword}@${siteName}.scm.azurewebsites.net:443/${siteName}.git"
echo "$gitURL"
git remote remove azure 2> /dev/null
git remote add azure "$gitURL"

echo 'Pushing to Azure'
git push azure HEAD:master

echo 'Waiting for CosmosDB instance creation results'
wait "$cosmosdbAsync_pid"

echo 'Configuring CosmosDB key'
cosmosDBKey=$(az cosmosdb list-keys --name "$cosmosDBName" --resource-group "$RGname" --output tsv | cut -f1)
mongoDBURI="mongodb://${cosmosDBName}:${cosmosDBKey}@${cosmosDBName}.documents.azure.com:10250/mean?ssl=true&sslverifycertificate=false"
az webapp config appsettings set --name "$siteName" --resource-group "$RGname" --settings "${mongoDBKeyName}=${mongoDBURI}"

echo 'Browsing Web app'
az webapp browse --name "$siteName" --resource-group "$RGname"
