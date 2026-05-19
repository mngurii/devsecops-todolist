pipeline {
    agent any

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
                sh 'docker build -t backend-devsecop .'
            }
        }

        stage('SAST - SonarQube Scan') {
            steps {
                sh 'sonar-scanner'
            }
        }

        stage('Run Container Service') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('DAST - OWASP ZAP Scan') {
            steps {
                sh 'docker run -t zaproxy/zap-stable zap-baseline.py -t http://host.docker.internal:8080'
            }
        }

        stage('Blockchain Audit Trail Test') {
            steps {
                sh 'node blockchain.js'
            }
        }

        stage('Monitoring Validation') {
            steps {
                sh 'curl http://localhost:9090/-/healthy'
            }
        }

        stage('Deployment Success') {
            steps {
                echo 'Pipeline DevSecOps berhasil dijalankan'
            }
        }
    }
}