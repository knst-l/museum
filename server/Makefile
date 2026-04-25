.DEFAULT_GOAL := help
include .env

database_name  = $(POSTGRES_DB)
DOCKER_COMP   = docker compose -f $(COMPOSE_FILE)

POSTGRES_CONT = $(DOCKER_COMP) exec $(POSTGRES_DB)

help:
	@echo "make help					- Prints this command and exit"
	@echo "			------ Working with docker compose -----"
	@echo "make build					- Forces build and pull containers from docker compose file"
	@echo "make up						- Ups containers from docker compose file"
	@echo "make up-debug					- Ups containers from docker compose file with logs output"
	@echo "make down 					- Downs containers from docker compose file"
	@echo "make restart 				- Downs and then ups containers from docker compose file"

	@echo "make upload-dump	name=name		- Upload dump from directory db_dumps"
	@echo "make export-dump	name=name		- Export dump to directory db_dumps"

# ---------- Docker Compose ----------
build:
	@$(DOCKER_COMP) build --pull --no-cache

up:
	@$(DOCKER_COMP) up --detach --wait

up-debug:
	@$(DOCKER_COMP) up

down:
	@$(DOCKER_COMP) down --remove-orphans

restart: down up

upload-dump:
	@echo "Recreating '$(database_name)' database..."
	@$(POSTGRES_CONT) psql -U postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$(database_name)';"
	@$(POSTGRES_CONT) psql -U postgres -c "DROP DATABASE IF EXISTS $(database_name);"
	@$(POSTGRES_CONT) psql -U postgres -c "CREATE DATABASE $(database_name);"
	@echo "Applying $(name) dump..."
	@$(POSTGRES_CONT) bash -c "pg_restore -e -v -U postgres -Fc --no-owner --no-privileges -d $(database_name) /dump/$(name)"

download-dump:
	@echo "Exporting '$(database_name)' database to $(name)..."
	@$(POSTGRES_CONT) pg_dump -U postgres -Fc --no-owner --no-privileges -d $(database_name) -f /dump/$(name)

