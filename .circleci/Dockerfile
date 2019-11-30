FROM node:10

ARG DEBIAN_FRONTEND=noninteractive

# setup package manager
RUN apt-get update -y
RUN apt-get install -y apt-utils

# Install Python
RUN apt-get install -y python3-pip

# Install awscli
RUN pip3 install awscli

# Install Prerequisite Packages for Docker 
RUN apt-get upgrade -y
RUN apt-get install  curl apt-transport-https ca-certificates software-properties-common -y

# Add Docker Repos
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
RUN add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/debian $(lsb_release -cs) stable"
RUN apt-get update -y

# Install Docker
RUN apt-get install docker-ce -y

# Add setting
RUN echo "ulimit -n 8192" >> /etc/profile
RUN . /etc/profile
