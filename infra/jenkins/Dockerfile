FROM jenkins/jenkins:lts-jdk21

ENV CASC_JENKINS_CONFIG=/usr/share/jenkins/ref/casc.yaml
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"

USER root

RUN apt-get update && apt-get install -y \
    bash \
    ca-certificates \
    curl \
    docker.io \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

USER jenkins

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

COPY casc.yaml /usr/share/jenkins/ref/casc.yaml
