#!/usr/bin/env python3
"""
PPBM Docker Management Script
Handles stopping, building, running, and following logs for Docker containers.
"""

import subprocess
import sys
import time
import signal
import os
import threading
from pathlib import Path

class DockerManager:
    def __init__(self):
        self.project_containers = ['ppbm-backend', 'ppbm-nginx']
        self.compose_file = 'docker-compose.yml'
        self.project_root = Path(__file__).parent.parent
        
    def run_command(self, command, shell=True, capture_output=True):
        """Run a command and return the result."""
        try:
            if capture_output:
                result = subprocess.run(
                    command, 
                    shell=shell, 
                    capture_output=True, 
                    text=True,
                    cwd=self.project_root
                )
                return result
            else:
                # For commands that need real-time output (like logs)
                process = subprocess.Popen(
                    command,
                    shell=shell,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    cwd=self.project_root
                )
                return process
        except Exception as e:
            print(f"❌ Error running command '{command}': {e}")
            return None

    def run_command_with_live_output(self, command, description):
        """Run a command showing live output without clearing."""
        print(f"⏳ {description}...")
        
        try:
            process = subprocess.Popen(
                command,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                cwd=self.project_root
            )
            
            # Store all output lines
            output_lines = []
            
            # Read and display output in real-time
            for line in iter(process.stdout.readline, ''):
                line = line.rstrip()
                if line:  # Only process non-empty lines
                    print(f"  📋 {line}")
                    output_lines.append(line)
                    sys.stdout.flush()
            
            # Wait for process to complete
            process.wait()
            
            return process.returncode == 0, output_lines
            
        except Exception as e:
            print(f"❌ Error running command '{command}': {e}")
            return False, []

    def check_docker_running(self):
        """Check if Docker is running."""
        print("🐳 Checking if Docker is running...")
        result = self.run_command("docker info")
        if result and result.returncode == 0:
            print("✅ Docker is running")
            return True
        else:
            print("❌ Docker is not running. Please start Docker and try again.")
            return False

    def get_running_containers(self):
        """Get list of running containers for this project."""
        print("🔍 Checking for running project containers...")
        result = self.run_command("docker ps --format '{{.Names}}'")
        if result and result.returncode == 0:
            all_containers = result.stdout.strip().split('\n') if result.stdout.strip() else []
            project_containers = [c for c in all_containers if c in self.project_containers]
            if project_containers:
                print(f"📦 Found running containers: {', '.join(project_containers)}")
            else:
                print("📦 No project containers currently running")
            return project_containers
        return []

    def stop_containers(self):
        """Stop all running containers for this project."""
        print("🛑 Stopping project containers...")
        
        # First try docker-compose down
        success, output = self.run_command_with_live_output("docker-compose down", "Stopping containers with docker-compose")
        if success:
            print("✅ Successfully stopped containers using docker-compose")
        else:
            print("⚠️  docker-compose down failed, trying individual container stops...")
            
            # Stop containers individually
            running_containers = self.get_running_containers()
            for container in running_containers:
                success, output = self.run_command_with_live_output(f"docker stop {container}", f"Stopping container: {container}")
                if success:
                    print(f"✅ Stopped {container}")
                else:
                    print(f"❌ Failed to stop {container}")
        
        # Wait a moment for containers to fully stop
        time.sleep(2)

    def cleanup_containers(self):
        """Remove stopped containers for this project."""
        print("🧹 Cleaning up stopped containers...")
        
        for container in self.project_containers:
            success, output = self.run_command_with_live_output(f"docker rm {container}", f"Removing container: {container}")
            if success:
                print(f"✅ Removed container: {container}")
            # Don't print error if container doesn't exist - that's expected

    def build_containers(self):
        """Build Docker containers."""
        print("🔨 Building Docker containers...")
        success, output = self.run_command_with_live_output("docker-compose build --no-cache", "Building containers")
        if success:
            print("✅ Successfully built containers")
            return True
        else:
            print("❌ Failed to build containers")
            # Show last few lines of output for debugging
            if output:
                print("Last few lines of output:")
                for line in output[-30:]:
                    print(f"  {line}")
            return False

    def start_containers(self):
        """Start Docker containers."""
        print("🚀 Starting Docker containers...")
        success, output = self.run_command_with_live_output("docker-compose up -d", "Starting containers")
        if success:
            print("✅ Successfully started containers")
            return True
        else:
            print("❌ Failed to start containers")
            # Show last few lines of output for debugging
            if output:
                print("Last few lines of output:")
                for line in output[-30:]:
                    print(f"  {line}")
            return False

    def follow_logs(self):
        """Follow logs from all containers."""
        print("📋 Following container logs... (Press Ctrl+C to stop)")
        print("=" * 60)
        
        try:
            # First show all existing logs
            print("📜 Showing existing logs:")
            existing_logs_process = self.run_command("docker-compose logs --no-color --tail=all", capture_output=False)
            if existing_logs_process:
                existing_logs_process.wait()
            
            print("\n📋 Now following new logs:")
            print("-" * 50)
            
            # Then follow new logs
            process = self.run_command("docker-compose logs -f --no-color", capture_output=False)
            if process:
                # Stream the output in real-time without buffering
                for line in iter(process.stdout.readline, ''):
                    sys.stdout.write(line)
                    sys.stdout.flush()
                    
                process.wait()
            else:
                print("❌ Failed to start log following")
                
        except KeyboardInterrupt:
            print("\n📋 Stopped following logs")
            if 'process' in locals() and process:
                process.terminate()
                process.wait()
        finally:
            print("\n" + "=" * 60)
            print("📋 Log following session ended")

    def check_containers_health(self):
        """Check if containers are healthy and running."""
        print("🏥 Checking container health...")
        time.sleep(5)  # Wait for containers to fully start
        
        success, output = self.run_command_with_live_output("docker-compose ps", "Checking container status")
        if success:
            print("📊 Container status:")
            for line in output:
                print(line)
            return True
        else:
            print("❌ Failed to check container status")
            return False

    def check_git_permissions(self):
        """Check and fix Git repository permissions."""
        git_dir = self.project_root / '.git'
        if git_dir.exists():
            print("🔍 Checking Git repository permissions...")
            
            # Check if git status works
            result = self.run_command("git status --porcelain")
            if result and result.returncode != 0:
                print("⚠️  Git repository permissions issue detected, fixing...")
                
                # Fix permissions
                fix_result = self.run_command(f"chmod -R 755 {git_dir}")
                if fix_result and fix_result.returncode == 0:
                    print("✅ Git repository permissions fixed")
                else:
                    print("❌ Failed to fix Git permissions")
                    return False
            else:
                print("✅ Git repository permissions are correct")
        
        return True

    def main(self):
        """Main execution flow."""
        print("🚀 PPBM Docker Management Script")
        print("=" * 60)
        
        # Change to project root directory
        os.chdir(self.project_root)
        print(f"📂 Working directory: {self.project_root}")
        
        # Check if docker-compose.yml exists
        if not os.path.exists(self.compose_file):
            print(f"❌ {self.compose_file} not found in project root")
            return 1
        
        # Check if Docker is running
        if not self.check_docker_running():
            return 1

        # Check Git permissions before starting
        if not self.check_git_permissions():
            return 1
        
        try:
            # Step 1: Stop existing containers
            self.stop_containers()
            
            # Step 2: Clean up stopped containers
            self.cleanup_containers()
            
            # Step 3: Build new containers
            if not self.build_containers():
                return 1
            
            # Step 4: Start containers
            if not self.start_containers():
                return 1
            
            # Step 5: Check container health
            self.check_containers_health()
            
            # Step 6: Follow logs
            self.follow_logs()
            
            # Step 7: Final Git permissions check
            print("\n🔍 Final Git repository check...")
            if not self.check_git_permissions():
                print("⚠️  Git permissions were affected during Docker operations")
            
            return 0
            
        except KeyboardInterrupt:
            print("\n⚠️  Process interrupted by user")
            return 1
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return 1

def signal_handler(signum, frame):
    """Handle Ctrl+C gracefully."""
    print("\n⚠️  Received interrupt signal. Cleaning up...")
    sys.exit(1)

if __name__ == "__main__":
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    # Run the Docker manager
    manager = DockerManager()
    exit_code = manager.main()
    sys.exit(exit_code) 