pipeline {
  agent any
  environment {
    REGISTRY = "medaillon1802" 
    APP="devops-lab-app"         
    IMAGE_REPO = "${REGISTRY}/${APP}"
  }
  stages {
    stage('Checkout') { steps { checkout scm } }
    stage('Compute Image Tag') {
  steps {
    script {
      // 1) essayer variables Jenkins
      def branch = env.BRANCH_NAME ?: (env.GIT_BRANCH ? env.GIT_BRANCH.tokenize('/').last() : null)

      // 2) si toujours vide/HEAD, récupérer depuis git
      if (!branch || branch == 'HEAD' || branch == 'null') {
        branch = sh(returnStdout: true, script: 'git rev-parse --abbrev-ref HEAD || true').trim()
      }
      if (!branch || branch == 'HEAD') {
        branch = sh(returnStdout: true, script: "git rev-parse --abbrev-ref origin/HEAD | sed 's@^origin/@@' || true").trim()
      }
      if (!branch) {
        branch = sh(returnStdout: true, script: "git branch -r --contains HEAD | sed -n 's#.*origin/##p' | head -1 || true").trim()
      }
      if (!branch) { branch = 'main' }  // dernier fallback

      // 3) nettoyer, SHA, tag final
      branch = branch.replaceAll('[^A-Za-z0-9._-]+','-')
      def sha = sh(returnStdout: true, script: 'git rev-parse --short=7 HEAD').trim()

      env.IMAGE_TAG  = "${branch}-${sha}-${env.BUILD_NUMBER}"
      env.IMAGE      = "${env.IMAGE_REPO}:${env.IMAGE_TAG}"

      echo "IMAGE=${env.IMAGE}"
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
