error:
	@echo "Please use one of the following targets: prod, dev, clean"

prod:
	cd docker && docker-compose up -d

dev:
	cd docker && docker-compose -f docker-compose.dev.yml up --build

clean:
	rm -rf dist node_modules
