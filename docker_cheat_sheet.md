# Docker Cheat Sheet (docker_cheat_sheet.md)

This cheat sheet covers essential Docker commands for managing containers, images, volumes, networks, and system resources. Useful for troubleshooting issues like unhealthy containers, stale volumes, or resource cleanup in setups like Supabase local development.

## System-Wide Commands
- **Check Docker version**: `docker --version`  
  (Verify your Docker installation, e.g., Docker version 27.4.0)
- **Check system info**: `docker info`  
  (Shows Docker setup, including storage driver and running containers)
- **Prune unused resources**: `docker system prune -f`  
  (Removes stopped containers, dangling images, unused networks; add `-a` for all unused, `--volumes` for volumes)
- **Prune everything (aggressive)**: `docker system prune -a --volumes -f`  
  (Clears all unused images, containers, volumes, networks—use with caution, backups first)
- **Restart Docker service**: (On Linux: `sudo systemctl restart docker`; On macOS/Windows: Restart Docker Desktop app)

## Containers
- **List running containers**: `docker ps` or `docker container ls`  
  (Shows ID, name, status; add `-a` for all, including stopped)
- **List all containers (including stopped)**: `docker ps -a`
- **Start a stopped container**: `docker start <container_id_or_name>`  
  (e.g., `docker start supabase_db_split-free-frontend`)
- **Stop a running container**: `docker stop <container_id_or_name>`  
  (Graceful shutdown; use `docker kill` for force)
- **Restart a container**: `docker restart <container_id_or_name>`
- **Remove a container**: `docker rm <container_id_or_name>`  
  (Must be stopped first; add `-f` to force remove running one)
- **Remove all stopped containers**: `docker rm $(docker ps -q -f status=exited)`
- **Inspect container details**: `docker inspect <container_id_or_name>`  
  (JSON output with config, mounts, health, etc.)
- **View logs**: `docker logs <container_id_or_name>`  
  (Add `-f` to follow live; `--tail 100` for last N lines)
- **Exec into running container**: `docker exec -it <container_id_or_name> bash`  
  (Or `/bin/sh` if no bash; for debugging inside)

## Images
- **List images**: `docker images` or `docker image ls`  
  (Shows tags, sizes; add `-a` for intermediates)
- **Remove an image**: `docker rmi <image_id_or_tag>`  
  (e.g., `docker rmi supabase/postgres:15.8.1.094`; must not be in use)
- **Remove dangling images**: `docker image prune -f`  
  (Cleans untagged images)
- **Pull an image**: `docker pull <image:tag>`  
  (e.g., `docker pull postgres:15`)

## Volumes
- **List volumes**: `docker volume ls`  
  (Filter with `-f "name=supabase"`)
- **Create a volume**: `docker volume create <volume_name>`
- **Remove a volume**: `docker volume rm <volume_name>`  
  (e.g., `docker volume rm supabase_db_split-free-frontend`; must not be in use)
- **Remove all unused volumes**: `docker volume prune -f`
- **Inspect a volume**: `docker volume inspect <volume_name>`  
  (Shows mount point, etc.)

## Networks
- **List networks**: `docker network ls`
- **Remove a network**: `docker network rm <network_id_or_name>`  
  (Add `-f` to force)
- **Prune unused networks**: `docker network prune -f`

## Troubleshooting Tips
- **Find conflicts (e.g., ports)**: `docker ps` (check ports) or `netstat -ano | findstr :5432` (Windows) / `lsof -i :5432` (Linux/macOS)
- **Health check**: `docker inspect --format '{{ .State.Health.Status }}' <container>` (e.g., healthy/unhealthy)
- **Full cleanup for fresh start**: `docker stop $(docker ps -q); docker system prune -a --volumes -f`
- **Common errors**: If "another server running," kill processes on ports; for volume issues, ensure containers stopped.
