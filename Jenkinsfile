pipeline {
  agent any

  environment {
    REGISTRY = "REPLACE_WITH_YOUR_DOCKERHUB"
    IMAGE = "${REGISTRY}/devops-lab-app:latest"
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Build') {
      steps {
        sh 'docker build -t $IMAGE ./app'
      }
    }

    stage('Test') {
      steps {
        sh 'docker run --rm $IMAGE npm test'
      }
    }

    stage('Login & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
          sh 'docker push $IMAGE'
        }
      }
    }

    stage('Helm Deploy (Minikube)') {
      steps {
        sh '''
        helm upgrade --install lab ./helm/devops-lab-app           --set image.repository=$REGISTRY/devops-lab-app           --set image.tag=latest
        '''
      }
    }
  }
}