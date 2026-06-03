// ---------------------------------------------------------------------------
// Helper: executa `npm run <script>` dentro de <directory> com o env do Jenkins
// ---------------------------------------------------------------------------
def npmRun(String directory, String script) {
    dir(directory) {
        sh """
            set -euo pipefail
            . "\${WORKSPACE}/.jenkins-env"
            npm run ${script}
        """
    }
}

pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        NODE_VERSION = '22.12.0'
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
            parallel {
                stage('Install Frontend') {
                    steps {
                        sh 'bash infra/scripts/install-frontend-deps.sh'
                    }
                }
                stage('Install Backend') {
                    steps {
                        sh 'bash infra/scripts/install-backend-deps.sh'
                    }
                }
            }
        }

        stage('Typecheck') {
            parallel {
                stage('Typecheck Frontend') {
                    steps {
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            npmRun('frontend', 'typecheck')
                        }
                    }
                }
                stage('Typecheck Backend') {
                    steps {
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            npmRun('backend', 'typecheck')
                            npmRun('backend', 'typecheck:test')
                        }
                    }
                }
            }
        }

        stage('Test') {
            parallel {
                stage('Test Frontend') {
                    steps {
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            npmRun('frontend', 'test:coverage')
                        }
                    }
                }
                stage('Test Backend') {
                    steps {
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            npmRun('backend', 'test:coverage')
                        }
                    }
                }
            }
        }

        stage('Build') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            npmRun('frontend', 'build')
                            sh 'bash infra/scripts/package-frontend.sh'
                        }
                    }
                }
                stage('Build Backend') {
                    steps {
                        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                            npmRun('backend', 'build')
                            sh 'bash infra/scripts/package-backend.sh'
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                env.PIPELINE_STATUS = currentBuild.currentResult ?: 'SUCCESS'
                env.PIPELINE_JOB = env.JOB_NAME
                env.PIPELINE_BUILD = env.BUILD_NUMBER
                env.PIPELINE_URL = env.BUILD_URL
            }
            sh 'bash infra/scripts/send-pipeline-email.sh'
            archiveArtifacts(
                artifacts: 'artifacts/frontend-package.tar.gz, artifacts/backend-package.tar.gz, frontend/coverage/**, frontend/html/**, backend/coverage/**, backend/test-results/**',
                fingerprint: true,
                allowEmptyArchive: true
            )
        }
    }
}
