pipeline {
  agent any
  environment {
    REGISTRY = "medaillon1802" 
    APP="devops-app-lab"         
    IMAGE_REPO = "${REGISTRY}/${APP}"
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Compute Image Tag '){
      steps {
        script{
          def branch = env.BRANCH_NAME
          if(!branch || branch == 'null' ){
            branch = sh(retournStdout : true,script 'git rev-parse --abbrev-ref HEAD').trim())
          }
          branch = branch.replaceAll('[^A-Za-z0-9._-]+','-')
          def sha = sh(returnStdout: true, script: 'git rev-parse --short=7 HEAD').trim()
          env.IMAGE_TAG = "${branch}-${sha}-${env.BUILD_NUMBER}"
      env.IMAGE     = "${env.IMAGE_REPO}:${env.IMAGE_TAG}"
      sh 'echo \"IMAGE=$IMAGE\"'
        }
      }
    }
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
