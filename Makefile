.PHONY: up down build logs ps clean test lint

up:
	docker-compose up -d

down:
	docker-compose down

build:
	docker-compose build

logs:
	docker-compose logs -f

ps:
	docker-compose ps

clean:
	docker-compose down -v --remove-orphans

test:
	docker-compose exec api-gateway pytest tests/ -v

lint:
	cd services/api-gateway && ruff check . && mypy .
	cd services/agent-service && ruff check . && mypy .

k8s-apply:
	kubectl apply -f kubernetes/

k8s-delete:
	kubectl delete -f kubernetes/

setup:
	cp .env.example .env
	@echo "Edit .env with your API keys then run: make up"