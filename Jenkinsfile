pipeline {
  agent any
  environment {
    REGISTRY = "medaillon1802"              // <- mets ton Docker ID si différent
    IMAGE    = "${REGISTRY}/devops-lab-app:latest"
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Build')    { steps { sh 'docker build -t $IMAGE ./app' } }
    stage('Test')     { steps { sh 'docker run --rm $IMAGE npm test' } }
    stage('Login & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
          sh '''
            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
            docker push $IMAGE
          '''
        }
      }
    }
    stage('Deploy to Minikube (kubectl)') {
  environment {
    KUBECONFIG = "/var/jenkins_home/.kube/config"
    HOME       = "/var/jenkins_home"
  }
  steps {
    sh '''
      set -e
      echo "Using KUBECONFIG=$KUBECONFIG"
      kubectl get ns
      sed "s#IMAGE_PLACEHOLDER#$IMAGE#g" deploy/k8s.yaml > /tmp/k8s.yaml
      kubectl apply -f /tmp/k8s.yaml
      kubectl rollout status deploy/lab-app --timeout=120s
      kubectl get deploy,po,svc -l app=lab-app
    '''
  }
}

  }
}
