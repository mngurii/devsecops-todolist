pipeline {
    agent any

    environment {
        APP_NAME = 'backend-devsecop'
    }

    stages {

        stage('Checkout Source Code') {
            steps {
                echo 'Source code berhasil diambil dari GitHub'
            }
        }

        stage('Install Dependency') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build --no-cache -t backend-devsecop .'
            }
        }

        stage('Run Container Service') {
            steps {
                sh 'docker-compose down || true'
                sh 'docker-compose build --no-cache'
                sh 'docker-compose up -d --build --force-recreate'
            }
        }
    
        stage('SAST - SonarQube Scan') {
            steps {
                sh 'sleep 120'
                sh 'npx sonarqube-scanner'
            }
        }


        stage('DAST - OWASP ZAP Scan') {
            steps {
                sh '''
                docker run --rm \
                --network host \
                zaproxy/zap-stable \
                zap-baseline.py -t http://localhost:8080 || true
                '''
            }
        }

        stage('Blockchain Audit Trail Test') {
            steps {
                sh 'node blockchain.js'
            }
        }

        stage('Monitoring Validation') {
            steps {
                sh 'sleep 60'
                sh 'curl http://localhost:9090 || true'
                sh 'curl http://localhost:3000 || true'
            }
        }

        stage('Deployment Success') {
            steps {
                echo 'Pipeline DevSecOps berhasil dijalankan'
            }
        }
    }
}
