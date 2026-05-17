name: __PROJECT_NAME__

services:
  shell:
    profiles: [prod]
    build:
      context: .
      dockerfile: docker/Dockerfile.shell
    ports:
      - "3000:3000"

  app1:
    profiles: [prod]
    build:
      context: .
      dockerfile: docker/Dockerfile.remote
      args:
        PACKAGE: app1
        PORT: 3002
    ports:
      - "3002:3002"
