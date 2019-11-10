FROM ubuntu:latest

ARG DEBIAN_FRONTEND=noninteractive

# Create project directory
WORKDIR /usr/src/bot

# setup package manager
RUN apt-get update -y
RUN apt-get install -y apt-utils

# Install node
RUN apt-get install nodejs -y
RUN nodejs -v

# Install NPM
RUN apt-get install npm -y
RUN npm -v

# Install curl
RUN apt-get install curl -y
RUN curl --version

COPY strategies/TBP ./strategies/TBP
COPY package*.json ./

RUN ls -la

RUN npm install

COPY . .

CMD ["npm", "run", "testOutBoundConnect"]