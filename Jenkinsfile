pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        NODE_VERSION = '20.19.0'
        CI = 'true'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup') {
            steps {
                sh 'bash infra/scripts/install-jenkins-deps.sh'
            }
        }

        stage('Install') {
            steps {
                sh 'bash infra/scripts/install-frontend-deps.sh'
            }
        }

        stage('Test') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    dir('frontend') {
                        sh '''
                            set -euo pipefail
                            . "${WORKSPACE}/.jenkins-env"
                            npm run test:coverage
                        '''
                    }
                }
            }
        }

        stage('Build') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    dir('frontend') {
                        sh '''
                            set -euo pipefail
                            . "${WORKSPACE}/.jenkins-env"
                            npm run build
                        '''
                    }
                    sh 'bash infra/scripts/package-frontend.sh'
                }
            }
        }

        stage('Notify') {
            steps {
                script {
                    env.PIPELINE_STATUS = currentBuild.currentResult ?: 'SUCCESS'
                    env.PIPELINE_JOB = env.JOB_NAME
                    env.PIPELINE_BUILD = env.BUILD_NUMBER
                    env.PIPELINE_URL = env.BUILD_URL
                }
                sh 'bash infra/scripts/send-pipeline-email.sh'
            }
        }
    }

    post {
        always {
            archiveArtifacts(
                artifacts: 'artifacts/frontend-package.tar.gz, frontend/coverage/**, frontend/html/**',
                fingerprint: true,
                allowEmptyArchive: true
            )
        }
    }
}
