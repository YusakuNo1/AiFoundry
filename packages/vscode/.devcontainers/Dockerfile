FROM mcr.microsoft.com/devcontainers/python:3.10

WORKDIR /

RUN apt update && apt upgrade -y && apt install -y fuse
# Install ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Python environment
COPY ./.devcontainers/requirements.txt .
RUN pip install -r requirements.txt
RUN rm requirements.txt

# Node.js environment
RUN sudo apt install nodejs -y
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
RUN yarn add @langchain/core

USER vscode
WORKDIR /home/vscode/aifoundry
ENV CODE_HOME=/home/vscode/aifoundry
