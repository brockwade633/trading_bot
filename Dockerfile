FROM ubuntu:latest

# Create project directory
WORKDIR /usr/src/bot

RUN apt update

# Install node
RUN apt install nodejs -y
RUN nodejs -v

# Install NPM
RUN apt install npm -y
RUN npm -v

COPY package*.json ./

RUN npm install

COPY . .