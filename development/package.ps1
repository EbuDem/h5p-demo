# Set the desired filename for the zip file
$zipFilename = "example.zip"
$renamedFilename = "example-$(get-date -f yyyy-MM-dd-HH-mm-ss).h5p"
$tempFolder = "C:/tmp/temp"

if( Test-Path $pwd\$zipFilename )
{
    Remove-Item -Path $pwd\$zipFilename -Force  
}

if( Test-Path $pwd\$renamedFilename )
{
    Remove-Item -Path $pwd\$renamedFilename -Force
}

# Create a temporary subfolder and copy all contents to it
Remove-Item -Path *.h5p -Recurse -Force
New-Item -ItemType Directory -Path $tempFolder -Force | Out-Null
Copy-Item * -Destination $tempFolder -Recurse -Force
Remove-Item -Path $tempFolder\package.ps1 -Recurse -Force


# Compress the contents of the temporary subfolder into a zip file
Compress-Archive -Path $tempFolder\* -DestinationPath $zipFilename

# Remove the temporary subfolder
Remove-Item -Path $tempFolder -Recurse -Force


# Rename the zip file to example.h5p
Rename-Item -Path $zipFilename -NewName $renamedFilename

Write-Host "Compression completed. Renamed zip file: $pwd\$renamedFilename"
