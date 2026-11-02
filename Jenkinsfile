pipeline {
  agent any
  environment { TAG = "${env.BUILD_NUMBER}" }
  stages {
    stage('Test') {
      steps { sh 'docker build --target test -t linksnap-test:$TAG app' }
    }
    stage('Build image') {
      steps { sh 'docker build --target runtime -t linksnap:$TAG app' }
    }
    stage('Load into kind') {
      steps { sh 'kind load docker-image linksnap:$TAG --name devops' }
    }
    stage('Deploy') {
      steps {
        sh 'kubectl apply -f k8s/'
        sh 'kubectl -n linksnap set image deployment/linksnap linksnap=linksnap:$TAG'
        sh 'kubectl -n linksnap rollout status deployment/linksnap'
      }
    }
  }
}