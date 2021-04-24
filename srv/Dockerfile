FROM ubuntu:14.04
USER root

ENV \
    HOME="/root"  \
    
WORKDIR  $HOME
COPY . .
RUN \
	apt-get update && apt-get install && \
	pip install flask 


EXPOSE 80
ENTRYPOINT ["python", "simple_server.py"]
