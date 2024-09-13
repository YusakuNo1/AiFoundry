# Prod image -----------------------------------------------------------

FROM mcr.microsoft.com/devcontainers/python:3.10 AS aifoundry_server_dev

RUN apt update -y && apt upgrade -y
RUN apt install curl -y

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh | bash
RUN rm nodesource_setup.sh
RUN apt-get install -y nodejs

USER vscode
WORKDIR /home/vscode/aifoundry

COPY ./server/dev_requirements.txt ./requirements.txt  
RUN pip install -r requirements.txt


# Dev image ------------------------------------------------------------

FROM aifoundry_server_dev AS aifoundry_server

COPY --chown=vscode:vscode server /home/vscode/aifoundry/server
COPY --chown=vscode:vscode start_server.dev.sh /home/vscode/aifoundry/start_server.dev.sh
COPY --chown=vscode:vscode start_server.prod.sh /home/vscode/aifoundry/start_server.prod.sh

# Important: remove credentials/user-data from the image
RUN rm -f /home/vscode/aifoundry/server/.env
RUN mv /home/vscode/aifoundry/server/.env_example /home/vscode/aifoundry/server/.env
RUN find /home/vscode/aifoundry/server -name '.DS_Store' -type f -delete
# Find all python cache files, e.g. .pytest_cache, __pycache__, and delete them
RUN find /home/vscode/aifoundry/server -name '__pycache__' -type d -exec rm -r {} +
RUN find /home/vscode/aifoundry/server -name '.pytest_cache' -type d -exec rm -r {} +

