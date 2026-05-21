pipeline {
  agent any

  options {
    timestamps()
  }

  stages {
    stage('Install') {
      steps {
        sh 'npm --prefix backend ci'
        sh 'npm --prefix backend run prisma:generate'
        sh 'npm --prefix frontend ci'
      }
    }

    stage('Test') {
      steps {
        sh 'npm --prefix backend test'
      }
    }

    stage('Build') {
      steps {
        sh 'npm --prefix backend run build'
        sh 'npm --prefix frontend run build'
      }
    }
  }
}
