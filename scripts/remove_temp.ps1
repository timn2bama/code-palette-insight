$paths = Get-ChildItem -Path . -Force -Recurse -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -eq '.temp' }
if ($paths.Count -eq 0) {
  Write-Output 'No .temp directories found.'
} else {
  foreach ($p in $paths) {
    Write-Output "FOUND: $($p.FullName)"
    try {
      # Clear attributes for files and directories inside
      Get-ChildItem -LiteralPath $p.FullName -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.PSIsContainer) { $_.Attributes = 'Directory' } else { $_.Attributes = 'Normal' }
      }
      Remove-Item -LiteralPath $p.FullName -Force -Recurse -ErrorAction Stop
      Write-Output "REMOVED: $($p.FullName)"
    } catch {
      Write-Output "FAILED TO REMOVE: $($p.FullName) - $($_.Exception.Message)"
    }
  }
}
