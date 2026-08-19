# WSL Cheat Sheet

This cheat sheet covers Windows Subsystem for Linux (WSL) commands for managing distributions, resources, and troubleshooting. Useful if running Docker on Windows (as Docker Desktop uses WSL backend) or dealing with Supabase CLI issues on Windows.

## Basic Commands
- **Check WSL version**: `wsl --version` or `wsl -l -v`  
  (Lists distributions with versions; WSL 2 is recommended for Docker)
- **List distributions**: `wsl -l -v`  
  (Shows name, state, version; e.g., Ubuntu-22.04)
- **Set default distribution**: `wsl --set-default <distro_name>`  
  (e.g., `wsl --set-default Ubuntu`)
- **Update WSL kernel**: `wsl --update`  
  (Installs latest kernel; run as admin if needed)
- **Shutdown all WSL**: `wsl --shutdown`  
  (Stops all distributions; useful for resetting state)
- **Restart WSL service**: (From PowerShell as admin: `Restart-Service LxssManager`)

## Managing Distributions
- **Start a distribution**: `wsl -d <distro_name>`  
  (Opens shell; if stopped, starts it)
- **Stop a distribution**: `wsl -t <distro_name>` or `wsl --terminate <distro_name>`  
  (Graceful stop)
- **Remove/uninstall a distribution**: `wsl --unregister <distro_name>`  
  (Deletes it completely—data lost; backup first)
- **Install a new distribution**: `wsl --install -d <distro_name>`  
  (e.g., Ubuntu from Microsoft Store; or `wsl --install` for default)
- **Export a distribution (backup)**: `wsl --export <distro_name> <file.tar>`  
  (e.g., `wsl --export Ubuntu backup.tar`)
- **Import a distribution (restore)**: `wsl --import <new_name> <install_path> <file.tar>`  
  (e.g., `wsl --import UbuntuRestored C:\WSL\Ubuntu backup.tar`)

## Resource Management
- **Configure resources**: Edit `%USERPROFILE%\.wslconfig` (create if missing):  
  ```
  [wsl2]
  memory=4GB  # Allocates 4GB RAM
  processors=2  # Uses 2 CPU cores
  swap=0  # Disables swap (or set size)
  ```
  Then `wsl --shutdown` and restart.
- **Check resource usage**: Inside WSL: `free -h` (memory), `top` or `htop` (CPU/processes; install htop if needed: `sudo apt install htop`)
- **Mount drives**: `sudo mount -t drvfs C: /mnt/c` (if not auto-mounted)
- **Access Windows files**: From WSL: `/mnt/c/Users/<username>/` (e.g., for Docker volumes)

## Troubleshooting Tips
- **Reset WSL network**: `wsl --shutdown; netsh winsock reset; netsh int ip reset all; netsh winhttp reset proxy; ipconfig /flushdns` (From PowerShell as admin, then restart)
- **Fix Docker in WSL**: Ensure WSL 2 backend enabled in Docker Desktop settings. If issues: `wsl --set-default-version 2`
- **Port conflicts**: From Windows: `netstat -ano | findstr :<port>` (e.g., :5432), then `taskkill /PID <pid> /F`
- **Full reset**: Uninstall WSL via Windows Features, reinstall: `wsl --install`
- **Common errors**: If "WSL not found," enable in Windows Features > Virtual Machine Platform + WSL. For memory issues, adjust .wslconfig.

Use `wsl --help` for more options. Run commands from PowerShell/Command Prompt as admin when needed.
