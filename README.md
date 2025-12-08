sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl enable --now docker
docker --version
docker compose version


up:
	docker compose up --build -d

down:
	docker compose down -v

logs:
	docker compose logs -f

