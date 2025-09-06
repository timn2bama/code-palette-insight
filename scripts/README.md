remove_temp.ps1

Purpose
- Helper to find and remove `.temp` directories under the repository root.

Usage
- Run from the project root in PowerShell (no admin required in normal cases):

  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\remove_temp.ps1

Notes
- The script attempts to clear file attributes before removal. If permission errors occur, run PowerShell as Administrator and re-run the script.
- This script is safe to run and only targets directories named `.temp`.
