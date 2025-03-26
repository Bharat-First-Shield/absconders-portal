# AWS Deployment Guide for Absconders Portal

## Table of Contents
- [Prerequisites](#prerequisites)
- [AWS Services Setup](#aws-services-setup)
- [Application Configuration](#application-configuration)
- [Deployment Process](#deployment-process)
- [Security Configuration](#security-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Cost Optimization](#cost-optimization)

## Prerequisites

1. AWS Account
   - Create an AWS account if you don't have one
   - Access to AWS Management Console
   - Billing information set up

2. Local Development Environment
   - Node.js (v18 or later)
   - npm (v9 or later)
   - AWS CLI installed and configured
   - Elastic Beanstalk CLI installed

3. Required Credentials
   - AWS Access Key ID
   - AWS Secret Access Key
   - AWS Region configured

## AWS Services Setup

### 1. S3 Bucket Setup

```bash
# Create S3 bucket
aws s3 mb s3://your-bucket-name --region us-east-1

# Enable CORS for the bucket
aws s3api put-bucket-cors --bucket your-bucket-name --cors-configuration '{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": []
    }
  ]
}'

# Enable versioning
aws s3api put-bucket-versioning --bucket your-bucket-name --versioning-configuration Status=Enabled
```

### 2. DynamoDB Setup

1. Create required tables using the provided configuration:
```bash
# Create DynamoDB tables
aws dynamodb create-table --cli-input-json file://aws/dynamodb-tables.json
```

2. Enable Point-in-Time Recovery:
```bash
aws dynamodb update-continuous-backups \
  --table-name absconders_users \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

aws dynamodb update-continuous-backups \
  --table-name absconders_criminals \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

## Application Configuration

### 1. Environment Variables

Create a `.env` file with the following configuration:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# S3 Configuration
AWS_S3_BUCKET=your-bucket-name

# DynamoDB Configuration
DYNAMODB_TABLE_PREFIX=absconders_

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d

# Server Configuration
PORT=3000
NODE_ENV=production

# Frontend Configuration
VITE_API_URL=http://localhost:3000/api
```

### 2. Build Configuration

1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

## Deployment Process

### 1. Elastic Beanstalk Setup

1. Initialize EB project:
```bash
eb init absconders-portal --platform node.js --region us-east-1
```

2. Create EB environment:
```bash
eb create production
```

3. Deploy the application:
```bash
eb deploy
```

### 2. Domain and SSL Configuration

1. Route 53 Setup:
   - Create a hosted zone for your domain
   - Add necessary DNS records
   - Configure health checks

2. SSL Certificate:
   - Request certificate through AWS Certificate Manager
   - Validate domain ownership
   - Configure HTTPS in Elastic Beanstalk

## Security Configuration

### 1. IAM Roles and Policies

1. Create Service Role:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/absconders_users",
        "arn:aws:dynamodb:*:*:table/absconders_criminals"
      ]
    }
  ]
}
```

2. Security Group Configuration:
   - Configure inbound rules
   - Set up outbound rules
   - Implement proper VPC settings

### 2. Encryption and Security Measures

1. Enable encryption:
   - S3 server-side encryption
   - DynamoDB encryption at rest
   - SSL/TLS for data in transit

2. Implement security headers:
   - CORS policies
   - Content Security Policy
   - XSS protection

## Monitoring and Maintenance

### 1. CloudWatch Setup

1. Create alarms for:
   - CPU utilization
   - Memory usage
   - Error rates
   - Response times

2. Configure log groups:
```bash
aws logs create-log-group --log-group-name /aws/elasticbeanstalk/absconders-portal/
```

### 2. Backup Strategy

1. Database Backups:
   - Enable continuous backups for DynamoDB
   - Configure backup retention period
   - Test restore procedures

2. S3 Backup:
   - Enable versioning
   - Configure lifecycle rules
   - Set up cross-region replication

## Cost Optimization

### 1. DynamoDB Optimization

1. Capacity Mode:
   - Use on-demand capacity for unpredictable workloads
   - Monitor usage patterns
   - Implement auto-scaling

2. Data Management:
   - Implement TTL for temporary data
   - Use efficient queries
   - Optimize indexes

### 2. S3 Cost Management

1. Storage Classes:
   - Use appropriate storage classes
   - Implement lifecycle policies
   - Enable compression

2. Transfer Optimization:
   - Use CloudFront for content delivery
   - Implement caching strategies
   - Optimize file sizes

### 3. Elastic Beanstalk Optimization

1. Instance Configuration:
   - Choose appropriate instance types
   - Implement auto-scaling
   - Monitor resource utilization

2. Deployment Strategy:
   - Use Blue/Green deployment
   - Implement proper capacity planning
   - Monitor deployment health

## Regular Maintenance Tasks

1. Daily Tasks:
   - Monitor CloudWatch metrics
   - Check error logs
   - Review security events

2. Weekly Tasks:
   - Review performance metrics
   - Check cost analytics
   - Update security patches

3. Monthly Tasks:
   - Audit IAM roles and permissions
   - Review and optimize costs
   - Test backup restoration

## Troubleshooting

1. Common Issues:
   - Connection timeouts
   - Permission errors
   - Resource constraints

2. Debug Process:
   - Check CloudWatch logs
   - Review security group settings
   - Verify IAM permissions

## Support and Resources

1. AWS Support:
   - AWS Documentation
   - AWS Support Center
   - AWS Community Forums

2. Application Support:
   - GitHub Issues
   - Documentation
   - Team Contact Information