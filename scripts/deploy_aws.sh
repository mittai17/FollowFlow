#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# FollowFlow — AWS Production Deployment Script
# Targets: Amazon ECS Fargate, Amazon ECR, AWS Bedrock
# Account: 798404182134 | Region: us-east-1
# ==============================================================================

AWS_REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
CLUSTER_NAME="followflow-production"
SERVICE_NAME="followflow-service"
SECURITY_GROUP="sg-0e3e8248f8b093e56"
VPC_ID="vpc-07d47100b921f3bc6"
SUBNETS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=${VPC_ID}" --query "Subnets[0:2].SubnetId" --output text | tr '\t' ',')

echo "=== FollowFlow AWS Production Deployment ==="
echo "Account ID: ${ACCOUNT_ID}"
echo "Region:     ${AWS_REGION}"
echo "Registry:   ${REGISTRY}"
echo "Cluster:    ${CLUSTER_NAME}"
echo "Subnets:    ${SUBNETS}"
echo ""

# 1. ECR Login
echo "1. Authenticating Docker to Amazon ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${REGISTRY}"

# 2. Build & Push followflow-agent
echo "2. Building and pushing followflow-agent container..."
docker build -t "${REGISTRY}/followflow-agent:latest" ./apps/agent
docker push "${REGISTRY}/followflow-agent:latest"

# 3. Build & Push followflow-web
echo "3. Building and pushing followflow-web container..."
docker build -t "${REGISTRY}/followflow-web:latest" ./apps/web
docker push "${REGISTRY}/followflow-web:latest"

# 4. Register ECS Task Definition
echo "4. Registering ECS Fargate task definition..."
aws ecs register-task-definition --cli-input-json file://infra/ecs-task-def.json

# 5. Create or Update ECS Service
echo "5. Checking if ECS service exists..."
SERVICE_STATUS=$(aws ecs describe-services --cluster "${CLUSTER_NAME}" --services "${SERVICE_NAME}" --query "services[0].status" --output text || echo "MISSING")

if [ "${SERVICE_STATUS}" == "ACTIVE" ]; then
    echo "Updating existing ECS service..."
    aws ecs update-service \
        --cluster "${CLUSTER_NAME}" \
        --service "${SERVICE_NAME}" \
        --task-definition followflow-production-task \
        --force-new-deployment
else
    echo "Creating new ECS Fargate service..."
    aws ecs create-service \
        --cluster "${CLUSTER_NAME}" \
        --service-name "${SERVICE_NAME}" \
        --task-definition followflow-production-task \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[${SUBNETS}],securityGroups=[${SECURITY_GROUP}],assignPublicIp=ENABLED}"
fi

echo ""
echo "=== FollowFlow Production Deployment Complete! ==="
echo "Monitor ECS Tasks:"
echo "aws ecs list-tasks --cluster ${CLUSTER_NAME}"
