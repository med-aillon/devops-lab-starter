pipeline {
  agent any
  environment {
    REGISTRY = "medaillon1802" 
    APP="devops-app-lab"         
    IMAGE_REPO = "${REGISTRY}/${APP}"
    IMAGE_TAG  = "${env.BRANCH_NAME}-${env.GIT_COMMIT.take(7)}-${env.BUILD_NUMBER}"
    IMAGE    = "${IMAGE_REPO}:${IMAGE_TAG}"
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
  docker tag $IMAGE ${IMAGE_REPO}:latest
  docker push ${IMAGE_REPO}:latest
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
      kubectl --kubeconfig "$KUBECONFIG" get ns
  sed "s#IMAGE_PLACEHOLDER#$IMAGE#g" deploy/k8s.yaml > /tmp/k8s.yaml
  kubectl --kubeconfig "$KUBECONFIG" apply -f /tmp/k8s.yaml
  kubectl --kubeconfig "$KUBECONFIG" rollout status deploy/lab-app --timeout=120s
      kubectl get deploy,po,svc -l app=lab-app
    '''
  }
}

  }
}
